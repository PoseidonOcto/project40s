import { fetchFactChecks } from "./factCheckApi";

export enum MessageMode {
    Authentication,
    Testing,
    FactCheck,
}

type MessageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => Promise<void>;

const handleFactCheckMessage: MessageHandler = async (request, sender, sendResponse) => {
    if (request.text === undefined) {
        sendResponse({ status: 'error', message: 'No text provided.', });
        return;
    }
    sendResponse(await fetchFactChecks(request.text));
}

const handleAuthenticationMessage: MessageHandler = async (request, sender, sendResponse) => {
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
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.mode) {
            // Authentication proof of concept.
            case MessageMode.Authentication:
                handleAuthenticationMessage(request, sender, sendResponse);
                break;
            case MessageMode.Testing:
                break;
            case MessageMode.FactCheck:
                handleFactCheckMessage(request, sender, sendResponse);
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

export default {}
