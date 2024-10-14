import { getSimilarityThreshold, sendText } from "./factCheckApi";
import { MessageMode, MessageHandler, APIResponse, WebsiteInteractionEntry } from "./types"
import { TaskQueue, fetchFromAPI, sleep } from "./utils";

const TASK_QUEUE = new TaskQueue();


export const getOAuthToken = async (): Promise<string> => {
    return (await chrome.identity.getAuthToken({interactive: true})).token!
}

export const getUserProfileIcon = async (): Promise<APIResponse<string>> => {
    let results;
    try {
        const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
        const response = await fetch(url, {
            method: 'GET',
            // async: true,
            headers: {
                Authorization: 'Bearer ' + await getOAuthToken(),
                'Content-Type': 'application/json'
            },
            // 'contentType': 'json'
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        results = await response.json();
    } catch (error) {
        return {
            status: 'error',
            message: (error as Error).message
        }
    }

    return {
        status: 'success',
        data: results.picture,
    };
}

const updateFactDisplays = async () => {
    // Change something in session storage to trigger FactDisplay's event listener.
    await chrome.storage.session.set({'last_storage_update': Date.now()});
}

const handleDeleteUserData: MessageHandler = (_, __, ___) => {
    const deleteUserData = async () => {
        await fetchFromAPI("delete", {
            oauth_token: await getOAuthToken(),
        });

        await updateFactDisplays();
        return
    }

    TASK_QUEUE.enqueue(deleteUserData);
    
    return false;
}

const handleFactCheckMessage: MessageHandler = (request, sender, sendResponse) => {
    TASK_QUEUE.enqueue(async () => {
        console.assert(sender.url !== undefined);

        const response = await sendText(request.claims, sender.url!, await getSimilarityThreshold());
        sendResponse(response);
        if (response.status === 'error') {
            console.error(response);
            return;
        }

        // Update number of unseen fact checks.
        const oldNum = Number(await chrome.action.getBadgeText({}));
        const newNum = oldNum + response.data;
        if (oldNum != newNum) {
            await chrome.action.setBadgeText({text: `${newNum}`});
        }

        await updateFactDisplays();
    });

    return true;
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
const handleUrlChange: MessageHandler = (request, sender, sendResponse) => {
    console.log("URL changed to:", request.newUrl);

    (async () => {
        await sleep(1000);
        sendResponse(`URL changed to ${request.newUrl} 1000ms ago`);
    })();
    return true;
}

let userInteractions: WebsiteInteractionEntry = {
    url: "",
    duration: 0,
    date: 0,
    clicks: 0,
    leaning: null,
};

interface Request {
    mode?: string;
}

interface ChangeInfo {
    url?: string;
}

const trackUserInteractions = async (request?: { mode: string; } | null, changeInfo?: chrome.tabs.TabChangeInfo | undefined) => {
    const currentTime = Date.now();
    
    if (request) {
        if (request.mode === 'LogClick') {
            userInteractions.clicks++;
        }
    }

    if (changeInfo && changeInfo.url) {
        if (userInteractions.url) {
            console.log(`Data logged:`, {
                ...userInteractions,
                duration: (currentTime - userInteractions.date) / 1000
            });
        }

        // Reset interactions data for new URL
        userInteractions = {
            url: changeInfo.url,
            duration: 0,
            date: currentTime,
            clicks: 0,
            leaning: null,
        };
        
        // // Send this data to the server
        // await fetchFromAPI("user_interaction/add", { 
        //     oauth_token: await getOAuthToken(),
        //     url: userInteractions.url,
        //     duration_spent: userInteractions.duration,
        //     date_spent: userInteractions.date,
        //     clicks: userInteractions.clicks
        // });
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    trackUserInteractions(null, changeInfo);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    trackUserInteractions(request);
    sendResponse(`Tracked: ${request.mode}`);
    return true;
})

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
            case MessageMode.OpenOptionsPage:
                chrome.runtime.openOptionsPage();
                return false;
            case MessageMode.DeleteUserData:
                return handleDeleteUserData(request, sender, sendResponse);
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
