import { MessageMode } from "./types";
import { getClaims, getSimilarityThreshold } from "./factCheckApi"


/* 
 * Note: Cant send fact check requests directly (violates CORS)
 *      so ask for background script to do it instead.
 */

/*
 * For testing automated fact checking try visiting "https://www.reddit.com/r/politics/"
 * (allows testing scenario where all text is not immediately available, as you can scroll to load more).
 */

/*
 * Problem: wish to minimize unnecessary calls.
 *  Some possible approaches here:
 * ------------------------------
 *
 *  1. Store every sentence we have ever scraped from the webpage in a database,
 *      pull this and check against it before fact checking the sentence.
 *      [Impractical; database would be humongous]
 *
 *  2. Store every sentence we scrape on the webpage for the lifetime of this script,
 *      check against it before fact checking the sentence. If we detect a piece
 *      of misinformation, check if it is already in the database for the current
 *      website before pushing it.
 *
 * */


// Note: 'document.body.innerText' doesn't only grow, it can shrink as stuff is unloaded.
// So there will be claims in here that are no longer in 'document.body.innerText'.
let PROCESSED_CLAIMS: Set<string> = new Set();

// For jackie
// chrome.runtime.sendMessage({mode: MessageMode.AddingToDatabase, data: ""});



setInterval(factCheckPageContents, 3000)

// TODO: Two things could turn up the same fact check; but only would
// probably want to display it once?
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
    (async () => {
        const response = await chrome.runtime.sendMessage({mode: MessageMode.LogClick}); 
        console.log(response);
    })();
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
