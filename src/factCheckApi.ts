import { FactCheckData, FactCheckResults, FactCheckResultEntry, FactCheckIndex, APIResponse } from "./types"
import { getOAuthToken } from "./background";
import { getClaims } from "./utils";

export const MINIMUM_SIMILARITY_THRESHOLD = 0.6;
export const DEFAULT_SIMILARITY_THRESHOLD = 0.9;
export const MAXIMUM_SIMILARITY_THRESHOLD = 0.95;

export const setSimilarityThreshold = async (similarity_theshold: number): Promise<void> => {
    console.assert(similarity_theshold >= MINIMUM_SIMILARITY_THRESHOLD && similarity_theshold <= MAXIMUM_SIMILARITY_THRESHOLD);
    await chrome.storage.sync.set({similarity_threshold: similarity_theshold});
}

export const getSimilarityThreshold = async (): Promise<number> => {
    const threshold = (await chrome.storage.sync.get(["similarity_threshold"])).similarity_threshold;
    if (threshold === undefined) {
        await setSimilarityThreshold(DEFAULT_SIMILARITY_THRESHOLD);
        return DEFAULT_SIMILARITY_THRESHOLD;
    } 
    return threshold;
}

/*
 *
 * Returns an index containing all previously unseen fact checks. Note that if a
 * new piece of text triggers a previously seen fact check, this piece of text
 * is stored in the database, but the associated fact check is not returned.
 */
export const updateDatabase = async (claims: string[], url_of_trigger: string, similarityThreshold: number): Promise<FactCheckIndex> => {
    // TODO: URL will be added once we get the database. Otherwise have to spend time making a Set that holds tuples.

    console.log(await getStoredFactChecks());
    console.log(await sendFactChecks(claims, url_of_trigger, similarityThreshold));
    const incomingFactChecks = await factCheckClaims(claims, similarityThreshold);
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

export const factCheckText = async (text: string, similarityThreshold: number): Promise<FactCheckIndex | undefined> => {
    return await factCheckClaims(getClaims(text), similarityThreshold);
}

export const factCheckClaims = async (claims: string[], similarityThreshold: number): Promise<FactCheckIndex | undefined> => {
    const response = await fetchFactChecks(claims, similarityThreshold);
    if (response.status !== 'success') {
        console.error(response.message);
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

const getStoredFactChecks = async (): Promise<APIResponse<FactCheckIndex>> => {
    const response = await fetchFromAPI("facts/get", {
        oauth_token: await getOAuthToken(),
    });

    if (response.status === 'error') {
        return response;
    }

    const data = new Map();
    for (const claim_with_results of response.data as any) {
        data.set(claim_with_results['claim_id'], claim_with_results);
    }
    return {
        status: 'success',
        data: data,
    }
}

async function fetchFromAPI<T>(endpoint: string, data: Object): Promise<APIResponse<T>> {
    let results;
    try {
        const url = `https://project40s-embedding-server-production.up.railway.app/${endpoint}`;
        const response =  await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
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

    return results;
}

const sendFactChecks = async (claims: string[], url_of_trigger: string, similarityThreshold: number): Promise<APIResponse<number>> => {
    if (claims.length === 0) {
        console.log("WARNING: trying to fact check 0 claims.");
    }

    return await fetchFromAPI("facts/add", {
        oauth_token: await getOAuthToken(), 
        url_of_trigger: url_of_trigger, 
        data: claims, 
        similarity_threshold: similarityThreshold
    });
}

// TODO: We let our api fall asleep. While its waking up, this function returns 'Response status: 502' or 'Response status: 500'.
const fetchFactChecks = async (claims: string[], similarityThreshold: number): Promise<FactCheckResults> => {
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
            body: JSON.stringify({'data': claims, 'similarity_threshold': similarityThreshold})
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
