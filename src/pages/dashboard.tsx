import React, { useEffect, useState, Fragment } from "react";
import "../style.css"
import {handleUserQuery} from "../gptApi";
import {QueryResult, queryClaimBuster} from "../claimBusterApi";
import { Outlet, Link } from "react-router-dom";
import { factCheckText, FactCheckResults } from "../factCheckApi";



const Dashboard = () => {
    const testingText = `The United Kingdom has the highest retirement age in the world. It also has the lowest pensions, longest working hours, lowest minimum wages, highest energy costs, highest profits and lowest taxes for the rich, in Europe. Benjamin Netanyahu celebrated the Lebanon pager explosions. Trump insists he won a "Man of The Year" contest in Michigan. Video surfaced showing Israeli PM Benjamin Netanyahu’s reaction to the pager blasts in Lebanon. Scores of people take to the streets and march together to express solidarity with Manipur. COVID-19 deaths in US topped 1 million under Trump. Democrat congressman Dan Goldman: President Trump “is destructive to our democracy and he has to be, he has to be eliminated.”. PA sent out 1,823,148 ballots during the 2020 election but got back 2,589,242. HPV vaccine is harmful to children.`
    const [queryText, setQueryText] = useState<string>(testingText);
    const [testText, setTestText] = useState<string>("No testing text");
    const [queryResult, setQueryResult] = useState<FactCheckResults>({'status': 'error', 'message': 'No query provided yet.'});
    const [isLoading, setIsLoading] = useState(false);

    const awaitUserQuery = async (query: string | undefined): Promise<void> => {
        setIsLoading(true);
        console.log("Currently does nothing");
        // console.log(query);
        // setQueryResult(query !== undefined ? await factCheckText(query) : {'status': 'error', 'message': 'No query provided.'});
        setIsLoading(false);
        return;
    }

    const testingButton = async () => {
        // setTestText(await factCheckText());
    }

    return (
        <>
            <h1>Dashboard</h1>
            <h3>[Under Development]</h3>
            <p>Enter a paragraph of text in the input below, and relevant claims in the text will be checked. It is prefilled with text for testing.</p>
            <textarea name="query" onChange={(e) => setQueryText(e.target.value)} style={{width: "30vw", height: "15vh"}}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} disabled={isLoading}
                    onClick={(_) => awaitUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon"></div>}
            <div id="query-result">
                {queryResult.status == 'error' && <h4>{queryResult.message}</h4>}
                {queryResult.status == 'success' && queryResult.data!.length === 0 && <h4>No results found.</h4>}
                {queryResult.status == 'success' && queryResult.data!.length !== 0
                        && queryResult.data.map((claimResult, i) => {
                            return (
                                <div id="query-result-individual" key={i}>
                                    <h4>Claim: {claimResult.claim}</h4>
                                    <p>We found the following database entries:</p>
                                    <ul>
                                    {claimResult.responses.map((entry, j: number) => {
                                        return (
                                            <Fragment key={j}>
                                                <li>{entry.entity.claim}<br/><br/>{"Truth Rating: " + entry.entity.review}</li><br/>
                                            </Fragment>
                                        );
                                    })}
                                    </ul>
                                </div>
                            );
                        })
                }
            </div>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} disabled={isLoading}
                    onClick={(_) => testingButton()}>TestingButton</button>
            <h4>Testing Test</h4>
            {JSON.stringify(testText)}
        </>
    );
};

export default Dashboard;

