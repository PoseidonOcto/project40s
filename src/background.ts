import { fetchFactChecks } from "./factCheckApi";
import { MessageMode } from "./types"

// Message handlers should return a boolean with value
// true if and only if they will call sendResponse asynchronously.
type MessageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean;

const handleFactCheckMessage: MessageHandler = (request, _, sendResponse) => {
    (async () => {
        if (request.text === undefined) {
            sendResponse({ status: 'error', message: 'No text provided.', });
            return;
        }
        sendResponse(await fetchFactChecks(request.text));
    })();

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

// If multiple event listeners, only the first listener to send a
// response will have their response received. So we keep
// all event listeners in one place.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.mode) {
            // Authentication proof of concept.
            case MessageMode.Authentication:
                return handleAuthenticationMessage(request, sender, sendResponse);
            case MessageMode.FactCheck:
                return handleFactCheckMessage(request, sender, sendResponse);
            default:
                console.error("Message with unexpected MessageMode received.");
                return false;
        }
    }
);

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


