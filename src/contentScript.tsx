import { MessageMode } from "./types";
import { getClaims, DATA_USAGE_MESSAGE } from "./utils";


/* 
 * Note: Cant send fact check requests directly (violates CORS)
 *      so ask for background script to do it instead.
 */

// Note: 'document.body.innerText' doesn't only grow, it can shrink as stuff is unloaded.
// So there will be claims in here that are no longer in 'document.body.innerText'.
let PROCESSED_CLAIMS: Set<string> = new Set();

const setPermission = async (hasPermission: boolean): Promise<void> => {
    await chrome.storage.sync.set({permission: hasPermission});
}

const getPermission = async (): Promise<boolean> => {
    const permission = (await chrome.storage.sync.get(["permission"])).permission;
    if (permission === undefined) {
        await setPermission(false);
        return false;
    } 
    return permission;
}

(async () => {
    if (await getPermission()) {
        setInterval(factCheckPageContents, 3000)
        return;
    }

    const dataUsageMessage = DATA_USAGE_MESSAGE(false) + " You will have the option, at any time, " +
        "to press a button removing all the data we ever collected from our database. " +
        "Press 'Cancel' and uninstall the extension if you do not wish for your data to be stored. "
    const response = confirm(dataUsageMessage);
    if (response) {
        await setPermission(true);
        setInterval(factCheckPageContents, 3000)
    }
})();

async function factCheckPageContents() {
    const claimsFromPage = new Set(getClaims(document.body.innerText));

    const newClaims = difference(claimsFromPage, PROCESSED_CLAIMS);

    PROCESSED_CLAIMS = union(PROCESSED_CLAIMS, newClaims);

    if (newClaims.size == 0) {
        return;
    }

    chrome.runtime.sendMessage({
        mode: MessageMode.FactCheck, claims: Array.from(newClaims)
    });
}

document.addEventListener('click', () => {
    chrome.runtime.sendMessage({mode: 'LogClick'}); 
});

/* 
 * The following set operations were copied from the following url.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#instance_methods
 */
function isSuperset<T>(set: Set<T>, subset: Set<T>) {
    for (const elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

function union<T>(setA: Set<T>, setB: Set<T>) {
    const _union = new Set(setA);
    for (const elem of setB) {
        _union.add(elem);
    }
    return _union;
}

function intersection<T>(setA: Set<T>, setB: Set<T>) {
    const _intersection = new Set();
    for (const elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function difference<T>(setA: Set<T>, setB: Set<T>) {
    const _difference = new Set(setA);
    for (const elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}
