const API_KEY = "2b6f69d7f6754bc1ba373005f1df6735";

let input_claim = 'The sky is blue.';

export type QueryResult = {
    claim: string;
    justification: {
        claim: string;
        truth_rating: string;
    }[];
}

export const queryClaimBuster = async (query: string | undefined): Promise<QueryResult[]> => {
    if (query === undefined) {
        console.assert(false);
        return [];
    }

    const claims = await getClaims(query);
    console.log("------ claims -------");
    console.log(claims);
    console.log("---------------------");
    // 
    // 
    // const filtered = results.results.filter((result: any) => result.score > 0.5);
    // console.log(filtered);

    // const queried = await Promise.all(filtered.map((result: any) => factCheck(result.text)));
    // console.log(queried);
    // return queried;

    // knowledge_bases seems unreliable, triggering off of simple definitions of words.
    const results = await Promise.all(claims.results
        .filter((result: any) => result.score > 0.8)
        .map((result: any) => factCheck(result.text, "fact_matcher")));

    const tmp = results.filter((result) => result.justification.length !== 0);
    console.log("------ fact check -------");
    console.log(tmp);
    console.log("---------------------");
    return tmp;
        //.map((result: any) => {
        //    return {
        //        claim: result.claim,
        //        justification: result.justification,
        //    };
        //});


    // Print out the JSON payload the API sent back
    // console.log(response.json());
    // Print out the JSON payload the API sent back
    // console.log(JSON.stringify(response.json(), null, 2));
    //return response.json();
    //return JSON.stringify(await factCheck(query), null, 2);
}

const factCheck = async(query: string, mode: "knowledge_bases" | "fact_matcher"): Promise<any> => {
    // Setup the Fetch GET Request with the appropriate headers and URL
    const response = await fetch(`https://idir.uta.edu/claimbuster/api/v2/query/${mode}/${query}`, {
        method: 'GET',
        headers: {
            'x-api-key': API_KEY,
        }
    });

    return response.json();
}

const getClaims = async(query: string): Promise<any> => {
    // Setup the Fetch GET Request with the appropriate headers and URL
    const response = await fetch(`https://idir.uta.edu/claimbuster/api/v2/score/text/sentences/${query}`, {
        method: 'GET',
        headers: {
            'x-api-key': API_KEY,
        }
    });

    return response.json();
}


// type QueryResult = {
//     claim: string;
//     origin: "Claim Matcher" | "Claim Checker - Knowledge Bases";
//     justification: [{
//         question: 
// 
//     }]
// 
// 
// }

