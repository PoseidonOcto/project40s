/// <reference types="chrome"/>
import Tab = chrome.tabs.Tab;

type Option<T> = {value: T} | null;
// type TabActivationInfo = {url: URL, lastAccessed: number};
let trackedTab: Option<Tab> = null;
type TabDurationDatabase = {[key: string]: number}
const tabDurationDatabase: TabDurationDatabase = {};


// function logDuration(url: string, duration: number) {
//     // Get current durations and update to new ones.
//     chrome.storage.sync.get(
//         {
//             urlDurations: "a",
//         },
//         (rawItems) => {
//             // Saves options to chrome.storage.sync.
//             const items = JSON.parse(rawItems['urlDurations']);
//             if (!(url in items)) {
//                 items[url] = 0;
//             }
//             items[url] += duration;
// 
//             chrome.storage.sync.set(
//                 {
//                     urlDurations: JSON.stringify(items),
//                 },
//                 () => {
//                     // Update status to let user know options were saved.
//                     console.log("Tab duration saved.");
//                     // const id = setTimeout(() => {
//                     //     setStatus("");
//                     // }, 1000);
//                     // return () => clearTimeout(id);
//                     return;
//                 }
//             );
//         }
//     );
// 
// }

// function updateTrackedTab(tab: Tab) {
//     // Discard tab if url is pending. Another (non-pending) url update will be sent.
//     if (tab.url == undefined) {
//         return;
//     }
//     console.assert(tab.lastAccessed != undefined);
// 
//     if (trackedTab == null) {
//         trackedTab = {value: tab}
//     } else {
//         // If there is already a tracked tab, one of the callbacks has come late, i.e. one of the tabs was switched too
//         // quickly to have its duration tracked. This (negligible) duration is discarded.
//         if (<number>tab.lastAccessed >= <number>trackedTab.value.lastAccessed) {
//             trackedTab = {value: tab};
//         }
//     }
// }
// 
// // (When active tab switches / updates / chrome closes)
// // 'Current time - time was last accessed' -> added to tabinfo for active tabs url.
// chrome.tabs.onActivated.addListener((activeInfo) => {
//     console.log(tabDurationDatabase);
//     if (trackedTab != null) {
//         console.assert(trackedTab.value.url != undefined, "trackedTabs should not have pending URLs");
//         logDuration(<string>trackedTab.value.url, Date.now() - <number>trackedTab.value.lastAccessed);
// 
//         trackedTab = null;
//     }
//     chrome.tabs.get(activeInfo.tabId, updateTrackedTab);
// })
// 
// chrome.tabs.onUpdated.addListener((_, __, tab) => {
//     if (!tab.active) {
//         return;
//     }
//     console.log(tabDurationDatabase);
// 
//     if (trackedTab != null) {
//         console.assert(trackedTab.value.url != undefined, "trackedTabs should not have pending URLs");
//         logDuration(<string>trackedTab.value.url, Date.now() - <number>trackedTab.value.lastAccessed);
// 
//         trackedTab = null;
//     }
//     updateTrackedTab(tab);
// })

// Authentication proof of concept.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.authentication === "true") {
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
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        sendResponse("tester2");
        // if (request.greeting === "hello") {
        //     sendResponse({farewell: "goodbye"}) 
        // };
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

chrome.contextMenus.onClicked.addListener((item, tab) => {
    if (tab === undefined) {
        console.error("Tab undefined on contextMenu click.");
        return;
    }
    if (tab.id === undefined) {
        console.error("Tab id undefined on contextMenu click.");
        return;
    }

    chrome.scripting.executeScript({
            // Set selected text as window variable.
            target : {tabId : tab.id},
            args: [{queryText: item.selectionText}],
            func: (funcArgs) => Object.assign(self, funcArgs),
        }).then(() => {
            chrome.scripting.executeScript({
                    // Inject selection component.
                    target: {tabId: tab.id!}, 
                    files: [ "js/selection.js" ]
                });
        });
});

export default {}





//
// function polling() {
//   // console.log("polling");
//   setTimeout(polling, 1000 * 30);
// }
// 
// polling();
