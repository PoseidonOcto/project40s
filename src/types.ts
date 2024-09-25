/* 
 * Must be in a seperate file as contentScript 
 * can't import from background due to missing APIs.
 */
export enum MessageMode {
    Authentication,
    Testing,
    FactCheck,
    SendFactCheckToPopup,
}

// Message handlers should return a boolean with value
// true if and only if they will call sendResponse asynchronously.
export type MessageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean;
