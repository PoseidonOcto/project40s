import React, { useEffect, useState } from "react";
import "../style.css"
import {handleUserQuery} from "../gptApi";
import {QueryResult, queryClaimBuster} from "../claimBusterApi";
import { Outlet, Link } from "react-router-dom";



const Dashboard = () => {
    const testingText = `The United Kingdom has the highest retirement age in the world. It also has the lowest pensions, longest working hours, lowest minimum wages, highest energy costs, highest profits and lowest taxes for the rich, in Europe. Benjamin Netanyahu celebrated the Lebanon pager explosions. Trump insists he won a "Man of The Year" contest in Michigan. Video surfaced showing Israeli PM Benjamin Netanyahu’s reaction to the pager blasts in Lebanon. Scores of people take to the streets and march together to express solidarity with Manipur. COVID-19 deaths in US topped 1 million under Trump. Democrat congressman Dan Goldman: President Trump “is destructive to our democracy and he has to be, he has to be eliminated.”. PA sent out 1,823,148 ballots during the 2020 election but got back 2,589,242. HPV vaccine is harmful to children.`
    const [queryText, setQueryText] = useState<string>(testingText);
    const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
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
            <h3>[Under Development]</h3>
            <p>Enter a paragraph of text in the input below, and relevant claims in the text will be checked. It is prefilled with text for testing.</p>
            <textarea name="query" value={testingText} onChange={(e) => setQueryText(e.target.value)} style={{width: "30vw", height: "15vh"}}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} disabled={isLoading}
                    onClick={(_) => awaitUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon"></div>}
            <div id="query-result">
                {queryResult.length === 0 && <h4>No results found.</h4>}
                {queryResult.length !== 0 && queryResult.map((claimResult: QueryResult, i: number) => {
                    return (
                        <div id="query-result-individual" key={i}>
                            <h4>Claim: {claimResult.claim}</h4>
                            <p>We found the following database entries:</p>
                            <ul>
                            {claimResult.justification.map((entry, j: number) => {
                                return (
                                    <li key={j}>{entry.claim + "----> Truth Rating: " + entry.truth_rating}</li>
                                );
                            })}
                            </ul>
                        </div>
                    );
                })}
                

            </div>
        </>
    );
};

export default Dashboard;

