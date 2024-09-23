import { fetchFactChecks } from "./factCheckApi";

// Cant send the request to non https server from content script.
(async () => {
    // console.log(await fetchFactChecks(document.body.innerText));
})()

// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//   if (msg.color) {
//     console.log("Receive color = " + msg.color);
//     document.body.style.backgroundColor = msg.color;
//     sendResponse("Change color to " + msg.color);
//   } else {
//     sendResponse("Color message is none.");
//   }
// });
