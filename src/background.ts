import { getSimilarityThreshold, updateDatabase } from "./factCheckApi";
import { MessageMode, MessageHandler } from "./types"
import { TaskQueue, sleep } from "./utils";

const TASK_QUEUE = new TaskQueue();

const getOAuthToken = async (): Promise<string> => {
    return (await chrome.identity.getAuthToken({interactive: true})).token!
}

const handleFactCheckMessage: MessageHandler = (request, sender, __) => {
    TASK_QUEUE.enqueue(async () => {
        console.assert(sender.url !== undefined);  // Can this happen?
        const unseenFactChecks = await updateDatabase(request.claims, sender.url!, await getSimilarityThreshold());

        // Update number of unseen fact checks.
        const oldNum = Number(await chrome.action.getBadgeText({}));
        const newNum = oldNum + unseenFactChecks.size;
        if (oldNum != newNum) {
            await chrome.action.setBadgeText({text: `${newNum}`});
        }
    });

    return false;
}

const handleAuthenticationMessage: MessageHandler = (_, __, ___) => {
    chrome.identity.getAuthToken({interactive: true}, (token: string | undefined, _: any) => {
        let init = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', init)
                .then((response) => response.json())
                .then(function(data) {
                    console.log(data)
                });


        console.log(token);
    });

    return false;
}

const handleTestingMessage: MessageHandler = (request, __, ___) => {
    (async () => {
        console.log(await getOAuthToken());
    })();
    return false;
}

const handleLogClick: MessageHandler = (request, sender, sendResponse) => {
    console.log("User clicked");
    
    // Put any async code in here
    (async () => {
        await sleep(1000);
        sendResponse("User clicked 1000ms ago");
    })();

    // We return true to indicate we are going to send a response later, but its not ready right now!
    // i.e. indicating we are async
    return true;
}

// Print when we change urls for debugging.
const handleUrlChange: MessageHandler = (request, sender, sendResponse) => {
    console.log("URL change");

    (async () => {
        await sleep(1000);
        sendResponse("URL change 1000ms ago");
    })();

    return false;
}

/*
 * If multiple event listeners, only the first listener to send a
 * response will have their response received. So we keep
 * all event listeners in one place.
 *
 * This listener will check every MessageMode and throw if an unexpected
 * one is given to allow easier debugging.
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.mode) {
            // Authentication proof of concept.
            case MessageMode.Authentication:
                return handleAuthenticationMessage(request, sender, sendResponse);
            case MessageMode.FactCheck:
                return handleFactCheckMessage(request, sender, sendResponse);
            case MessageMode.Testing:
                return handleTestingMessage(request, sender, sendResponse);
            case MessageMode.AddingToDatabase:
                // request.data
                // Jackie do your fetch here.
                return false; 
            case MessageMode.UrlChange:
                return handleUrlChange(request, sender, sendResponse);
            case MessageMode.OpenOptionsPage:
                chrome.runtime.openOptionsPage();
                return false;
            case MessageMode.LogClick:
                return handleLogClick(request, sender, sendResponse);
            default:
                // These messages are not for us.
                return false;
        }
    }
);

/*
 * These functions require both event listeners.
 */
chrome.runtime.onStartup.addListener(function () {
    chrome.action.setBadgeBackgroundColor({color: [210, 43, 43, 255]});
});
chrome.runtime.onInstalled.addListener(function () {
    chrome.action.setBadgeBackgroundColor({color: [210, 43, 43, 255]});
});

// Create context menu.
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        title: "Detect Disinformation in: \"%s\"",
        contexts: ['all'],
        id: 'detect',
    });
});

// Handles response when context menu clicked.
chrome.contextMenus.onClicked.addListener(async (item, tab) => {
    if (tab === undefined) {
        console.error("Tab undefined on contextMenu click.");
        return;
    }
    if (tab.id === undefined) {
        console.error("Tab id undefined on contextMenu click.");
        return;
    }

    // Send parameters for script that creates the response popup.
    await chrome.scripting.executeScript({
        target : {tabId : tab.id},
        args: [{queryText: item.selectionText}],
        func: (funcArgs) => Object.assign(self, funcArgs),
    })
    // Create the response popup
    await chrome.scripting.executeScript({
        target: {tabId: tab.id!}, 
        files: [ "js/selection.js" ]
    });
});

chrome.runtime.onInstalled.addListener((details) => {
    const internalUrl = chrome.runtime.getURL("options.html#/help");
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: internalUrl }, function (tab) {
        });
    }
});
