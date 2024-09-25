import sentencize from "@stdlib/nlp-sentencize"

// On success, data should not be undefined.
// On failure, message should not be undefined.
export type FactCheckResults = {
    status: 'success',
    data: {
        claim: string,
        responses: FactCheckResultEntry[]
    }[],
} | {
    status: 'error',
    message: string,
}

export type FactCheckResultEntry = {
    distance: number,
    entity: {
        claim: string,
        author_name: string,
        author_url: string,
        review: string,
        url: string,
    },
    id: number,
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

export const factCheckText = async (text: string): Promise<FactCheckResults> => {
    const claims = getClaims(text);
    console.log("---- Fetching fact checks for claims -----");
    console.log(claims);
    console.log("------------------------------------------");

    return await factCheckClaims(claims);
}

// TODO: We let our api fall asleep. While its waking up, this function returns 'Response status: 502' or 'Response status: 500'.
export const factCheckClaims = async (claims: string[]): Promise<FactCheckResults> => {
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
