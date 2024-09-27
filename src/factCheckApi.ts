import sentencize from "@stdlib/nlp-sentencize"
import { FactCheckData, FactCheckResults, FactCheckResultEntry, FactCheckIndex } from "./types"

/*
 *
 * Returns an index containing all previously unseen fact checks. Note that if a
 * new piece of text triggers a previously seen fact check, this piece of text
 * is stored in the database, but the associated fact check is not returned.
 */
export const updateDatabase = async (claims: string[]): Promise<FactCheckIndex> => {
    const incomingFactChecks = await factCheckClaims(claims);
    if (incomingFactChecks === undefined || incomingFactChecks.size === 0) {
        return new Map();
    }

    const unseenFactChecks = new Map();
    const databaseFactChecks = await getDatabase();
    
    // Merge the indexes.
    for (const [id, entry] of incomingFactChecks.entries()) {
        // If a fact check is already there, add any new claims that triggered it.
        if (databaseFactChecks.has(id)) {
            const oldEntry = databaseFactChecks.get(id)!;
            // Merge the triggering text fields.
            oldEntry.triggeringText = new Set([...oldEntry.triggeringText, ...entry.triggeringText]);
        } else {
            unseenFactChecks.set(id, entry);
            databaseFactChecks.set(id, entry);
        }
    }

    await chrome.storage.session.set({data: stringifyIndex(databaseFactChecks)});
    return unseenFactChecks;
}

export const getDatabase = async (): Promise<FactCheckIndex> => {
    let databaseFactChecks;

    // Get seen fact checks from database.
    const storedData = await chrome.storage.session.get(["data"]);
    if (storedData.data === undefined) {
        databaseFactChecks = new Map();
    } else {
        databaseFactChecks = parseIndex((storedData).data);
    }
    return databaseFactChecks;
}

// Splitting into sentences isn't necessarily the best way of
// separating into seperate claims, as claims could be split
// over sentences.
export const getClaims = (text: string): string[] => {
    const paragraph = text.split("\n")
        .filter(hasEnoughWords)
        .join(". ");

    return sentencize(paragraph).filter(hasEnoughWords);
}

const hasEnoughWords = (text: string): boolean => {
    const smallestSentenceLength = 5;
    return text.trim().split(/\s+/).length >= smallestSentenceLength;
}

export const factCheckText = async (text: string): Promise<FactCheckIndex | undefined> => {
    return await factCheckClaims(getClaims(text));
}

export const factCheckClaims = async (claims: string[]): Promise<FactCheckIndex | undefined> => {
    const response = await fetchFactChecks(claims);
    if (response.status !== 'success') {
        console.error(response);
        return undefined;
    }

    return sortById(response);
}

const sortById = (results: Extract<FactCheckResults, { status: 'success' }>): FactCheckIndex => {
    const index = new Map();
    // Add all new fact checks to state.
    for (const claimResults of results.data) {
        for (const entry of claimResults.responses) {
            // If a fact check is already there, add the new claim that triggered it.
            if (index.has(entry.id)) {
                index.get(entry.id)!.triggeringText.add(claimResults.claim);
            } else {
                index.set(entry.id, Object.assign({triggeringText: new Set([claimResults.claim])}, entry.entity));
            }
        }
    }
    return index;
}

// TODO: We let our api fall asleep. While its waking up, this function returns 'Response status: 502' or 'Response status: 500'.
const fetchFactChecks = async (claims: string[]): Promise<FactCheckResults> => {
    if (claims.length === 0) {
        console.log("WARNING: trying to fact check 0 claims.");
    }

    let results: FactCheckResults;
    try {
        const url = 'https://project40s-embedding-server-production.up.railway.app/embedding';
        const response =  await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'data': claims})
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        results = await response.json();
    } catch (error) {
        return {
            status: 'error',
            message: (error as Error).message
        }
    }

    if (results.status != 'success') {
        return results;
    }

    // Filter out claims that have no responses.
    results.data = results.data.filter(claimResult => claimResult.responses.length > 0);
    return results;
}

// Order is not guaranteed, but this will be replaced by a database soon.
// source: https://stackoverflow.com/questions/24242441/does-json-stringify-preserve-the-order-of-objects-in-an-array
// This code is inspired by: https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
const stringifyIndex = (index: FactCheckIndex): string => {
    return JSON.stringify(index, (_, value) => {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()),
            }
        } else if (value instanceof Set) {
            return {
                dataType: 'Set',
                value: Array.from(value.values()),
            }
        } else {
            return value;
        }
    });
}

const parseIndex = (index: string): FactCheckIndex => {
    return JSON.parse(index, (_, value) => {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            } else if (value.dataType === 'Set') {
                return new Set(value.value);
            }
        }
        return value;
    });
}
