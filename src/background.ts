import { factCheckClaims } from "./factCheckApi";
import { MessageMode, MessageHandler } from "./types"

/*
 * Queue related code is written under the assumption
 * that there is only one thread handling this code.
 */
class TaskQueue {
    tasks: (() => Promise<void>)[];
    isRunning: boolean

    constructor() {
        this.tasks = [];
        this.isRunning = false;
    }

    async runQueue(): Promise<void> {
        console.assert(!this.isRunning);
        this.isRunning = true;
        while (true) {
            if (this.tasks.length === 0) {
                break;
            }

            const nextTask = this.tasks.shift();
            await nextTask!();
        }
        this.isRunning = false;
    }

    enqueue(task: () => Promise<void>) {
        this.tasks.push(task);
        if (!this.isRunning) {
            this.runQueue();
        }
    }
}

const TASK_QUEUE = new TaskQueue();

// TODO number can get out of sync because no lock on badge text.
const handleFactCheckMessage: MessageHandler = (request, _, sendResponse) => {
    TASK_QUEUE.enqueue(async () => {
        console.assert(request.addToDatabase !== undefined); // We will use this param later.
        const factChecks = await factCheckClaims(request.claims);
        if (factChecks.status !== 'success') {
            return;
        }

        const old = Number(await chrome.action.getBadgeText({}));

        await chrome.action.setBadgeText({text: `${old + factChecks.data.length}`});

        //await chrome.runtime.sendMessage({mode: MessageMode.SendFactCheckToPopup, factChecks: factChecks});
        sendResponse(factChecks);
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
    console.log("Not doing anything right now.");
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
            case MessageMode.SendFactCheckToPopup:
                console.log("This message is not for us.");
                return false;
            default:
                console.error("Message with unexpected MessageMode received.");
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

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
