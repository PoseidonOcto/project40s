import { MessageMode } from "./background";

// Cant send the request directly (violates CORS)
// so ask for background script to do it instead.
(async () => {
    const response = await chrome.runtime.sendMessage({mode: MessageMode.FactCheck, text: document.body.innerText});
    console.log(response);
})();
