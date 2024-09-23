import sentencize from "@stdlib/nlp-sentencize"

// On success, data should not be undefined.
// On failure, message should not be undefined.
export type FactCheckResults = {
    status: 'success' | 'error',
    data?: {
        claim: string,
        responses: FactCheckResultEntry[]
    }[],
    message?: string
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

export const fetchFactChecks = async (text: string) => {
    // Splitting into sentences isn't necessarily the best way of
    // separating into seperate claims, as claims could be split
    // over sentences.
    const claims = sentencize(text);

    const factChecks: FactCheckResults = await fetch('http://192.168.1.3:5000/embedding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'data': claims})
    }).then((response) => response.json())
    
    if (factChecks.status != 'success') {
        return factChecks;
    }

    // Filter out claims that have no responses.
    factChecks.data = factChecks.data!.filter(claimResult => claimResult.responses.length > 0);
    return factChecks;
}
