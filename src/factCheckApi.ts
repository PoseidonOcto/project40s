import { FactCheckIndex, APIResponse } from "./types"
import { getOAuthToken } from "./background";
import { fetchFromAPI } from "./utils";

export const MINIMUM_SIMILARITY_THRESHOLD = 0.5;
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

export const getStoredFacts = async (): Promise<APIResponse<FactCheckIndex>> => {
    const response = await fetchFromAPI("facts/get", {
        oauth_token: await getOAuthToken(),
    });

    if (response.status === 'error') {
        return response;
    }

    const data = new Map();
    for (const claim_with_results of response.data as any) {
        data.set(claim_with_results['id'], claim_with_results);
    }
    return {
        status: 'success',
        data: data,
    }
}

/*
 *
 * Returns the number of previously unseen facts. Note that if a
 * new piece of text triggers a previously seen fact, this piece of text
 * is stored in the database, but it is not counted as a previously unseen fact.
 */
export const sendText = async (claims: string[], url_of_trigger: string, similarityThreshold: number): Promise<APIResponse<number>> => {
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
