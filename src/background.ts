import Tab = chrome.tabs.Tab;

let active = false;

function makeOrange(color: string): void {
    document.body.style.backgroundColor = color;
}

chrome.action.onClicked.addListener((tab) => {

    active = !active;
    const color = active ? 'orange' : 'white';
    chrome.scripting.executeScript({
        target: {tabId: tab.id ? tab.id : -1},
        func: makeOrange,
        args: [color]
    }).then();
});

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

    if (trackedTab != null) {
        console.assert(trackedTab.value.url != undefined, "trackedTabs should not have pending URLs");
        logDuration(<string>trackedTab.value.url, Date.now() - <number>trackedTab.value.lastAccessed, tabDurationDatabase);

        trackedTab = null;
    }
    updateTrackedTab(tab);
})

// const TRACK_ACTIVE_TAB = 'TRACK_ACTIVE_TAB';
//
// // Check if alarm exists to avoid resetting the timer.
// // The alarm might be removed when the browser session restarts.
// async function createAlarm() {
//     const alarm = await chrome.alarms.get(TRACK_ACTIVE_TAB);
//     if (typeof alarm === 'undefined') {
//         chrome.alarms.create(TRACK_ACTIVE_TAB, {
//             periodInMinutes: 1/60,
//             when: 0
//         });
//         updateTip();
//     }
// }