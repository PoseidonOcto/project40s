import React, { useEffect, useState, Fragment, useRef } from "react";
import "../style.css"
import "../facts.css"
import { FactCheckData, FactCheckResults } from "../types";
import {handleUserQuery} from "../gptApi";
import {QueryResult, queryClaimBuster} from "../claimBusterApi";
import { Outlet, Link } from "react-router-dom";
import { TaskQueue } from "../utils";
import { getDatabase } from "../factCheckApi";



const Dashboard = () => {
    const [factChecks, setFactChecks] = useState<Map<number, FactCheckData>>(new Map());
    const taskQueue = useRef<TaskQueue>(new TaskQueue());
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const updateData = () => taskQueue.current.enqueue((async () => {
            // This is potentially unsynchronous (service worker could be setting badge text at same time),
            // however fixing this would require enqueuing this task in the service workers task queue
            // instead, and the notification number being a bit out of sync isn't too bad.
            await chrome.action.setBadgeText({text: ""});
            setFactChecks(await getDatabase())
        }));

        updateData();

        /*
         * To communicate back and forth with the service worker,
         * utilise the chrome.storage listener. Sending messages
         * to the popup from the background script requires a
         * handshake first - see: https://tinyurl.com/ynmtyy44
         */
        chrome.storage.onChanged.addListener((_, type) => {
            console.assert(type === 'session');
            updateData();
        });
    }, []);

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
            <h4>Testing Test</h4>
            <hr/>
            <h3>Here are some fact checks that may be relevant to you</h3>
            <div id="fact-checks">
                {factChecks.size === 0 && <p>None</p>}
                {factChecks.size !== 0 && Array.from(factChecks.values()).map((fact, i) => {
                    return (
                        <Fragment key={i}>
                            <div id="fact-check">
                                <dl>
                                    <dt className='claim'>Claim:<br/><i>{fact.claim}</i></dt>
                                    <hr/>
                                    <dd className='truth-status'>Truth Status: {fact.review}</dd>
                                    <dd>Author: {fact.author_name} | <a href={fact.url}>Source</a></dd>
                                    <br/>
                                    <dd><u>Triggered by</u></dd>
                                    {Array.from(fact.triggeringText.values())
                                        .map((text, j) => <dd key={j}><i>{text}</i></dd>)
                                    }
                                </dl>
                            </div>
                            <hr/>
                        </Fragment>
                    );
                })}
            </div>
        </>
    );
};

export default Dashboard;

