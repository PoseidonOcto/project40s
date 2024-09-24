import { MessageMode } from "./types";

// Cant send the request directly (violates CORS)
// so ask for background script to do it instead.
(async () => {
    // Commented out purely so we don't send a bunch of stuff all the time, without meaning to.
    // const response = await chrome.runtime.sendMessage({mode: MessageMode.FactCheck, text: document.body.innerText});
    // console.log(response);
})();
