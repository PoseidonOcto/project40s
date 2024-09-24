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

type FactCheckResultEntry = {
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

export const fetchFactChecks = async (text: string): Promise<FactCheckResults> => {
    // Splitting into sentences isn't necessarily the best way of
    // separating into seperate claims, as claims could be split
    // over sentences.
    const claims = sentencize(text);
    console.log("---- Fetching fact checks for claims -----");
    console.log(claims);
    console.log("------------------------------------------");

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
