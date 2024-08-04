/// <reference types="chrome"/>
import Tab = chrome.tabs.Tab;

type Option<T> = {value: T} | null;
// type TabActivationInfo = {url: URL, lastAccessed: number};
let trackedTab: Option<Tab> = null;
type TabDurationDatabase = {[key: string]: number}
const tabDurationDatabase: TabDurationDatabase = {};

function logDuration(url: string, duration: number, tabDatabase: TabDurationDatabase) {
    if (!(url in tabDatabase)) {
        tabDatabase[url] = 0;
    }
    tabDatabase[url] += duration;
}

function updateTrackedTab(tab: Tab) {
    // Discard tab if url is pending. Another (non-pending) url update will be sent.
    if (tab.url == undefined) {
        return;
    }
    console.assert(tab.lastAccessed != undefined);

    if (trackedTab == null) {
        trackedTab = {value: tab}
    } else {
        // If there is already a tracked tab, one of the callbacks has come late, i.e. one of the tabs was switched too
        // quickly to have its duration tracked. This (negligible) duration is discarded.
        if (<number>tab.lastAccessed >= <number>trackedTab.value.lastAccessed) {
            trackedTab = {value: tab};
        }
    }
}

// (When active tab switches / updates / chrome closes)
// 'Current time - time was last accessed' -> added to tabinfo for active tabs url.
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log(tabDurationDatabase);
    if (trackedTab != null) {
        console.assert(trackedTab.value.url != undefined, "trackedTabs should not have pending URLs");
        logDuration(<string>trackedTab.value.url, Date.now() - <number>trackedTab.value.lastAccessed, tabDurationDatabase);

        trackedTab = null;
    }
    chrome.tabs.get(activeInfo.tabId, updateTrackedTab);
})

chrome.tabs.onUpdated.addListener((_, __, tab) => {
    if (!tab.active) {
        return;
    }
    console.log(tabDurationDatabase);

    if (trackedTab != null) {
        console.assert(trackedTab.value.url != undefined, "trackedTabs should not have pending URLs");
        logDuration(<string>trackedTab.value.url, Date.now() - <number>trackedTab.value.lastAccessed, tabDurationDatabase);

        trackedTab = null;
    }
    updateTrackedTab(tab);
})

export default {}





//
// function polling() {
//   // console.log("polling");
//   setTimeout(polling, 1000 * 30);
// }
// 
// polling();
