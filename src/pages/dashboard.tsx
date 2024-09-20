import React, { useEffect, useState } from "react";
import "../style.css"
import {handleUserQuery} from "../gptApi";
import {QueryResult, queryClaimBuster} from "../claimBusterApi";
import { Outlet, Link } from "react-router-dom";



const Dashboard = () => {
    const [queryText, setQueryText] = useState<string>();
    const [queryResult, setQueryResult] = useState<any>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const awaitUserQuery = async (query: string | undefined): Promise<void> => {
        setIsLoading(true);
        setQueryResult(await queryClaimBuster(query));
        setIsLoading(false);
        return;
    }


    return (
        <>
            <h1>Dashboard</h1>
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} disabled={isLoading}
                    onClick={(_) => awaitUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon">bruh</div>}
            <div id="query-result">
                {queryResult && queryResult.map((claimResult: QueryResult, i: number) => {
                    return (
                        <div id="query-result-individual" key={i}>
                            <h4>Claim: {claimResult.claim}</h4>
                            <p>We found the following database entries:</p>
                            <ul>
                            {claimResult.justification.map((entry, j: number) => {
                                return (
                                    <li key={j}>{entry.claim + "\n\nTruth Rating: " + entry.truth_rating}</li>
                                );
                            })}
                            </ul>
                        </div>
                    );
                })}
                

            </div>
            <hr/>
            <Link to={`education`}>Education is here!</Link>
            <hr/>
            <div>
                <p>Fun <br/> Survey <br/> Time</p>
                <div className='survey'>
                    <label>
                        <input type='checkbox'/> Left
                    </label>
                    <br/>
                    <label>
                        <input type='checkbox'/> Right
                    </label>
                    <br/>
                    <label>
                        <input type='checkbox'/> Authoritarian
                    </label>
                    <br/>
                    <label>
                        <input type='checkbox'/> Libertarian
                    </label>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

