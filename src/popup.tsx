import React, { useEffect, useState, Fragment } from "react";
import { createRoot } from "react-dom/client";
import { MessageMode } from "./types";
import { FactCheckResults, FactCheckResultEntry } from "./factCheckApi";
import "./style.css"
import "./popup.css"

const Popup = () => {
    const [factChecks, setFactChecks] = useState<Map<number, FactCheckResultEntry['entity']>>(new Map());
    const [queryResult, setQueryResult] = useState<FactCheckResults>({'status': 'error', 'message': 'No query provided yet.'});

    useEffect(() => {
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                switch (request.mode) {
                    case MessageMode.SendFactCheckToPopup:
                        const results: FactCheckResults = request.factChecks;
                        if (results.status !== 'success') {
                            return false;
                        }

                        const newFactChecks = new Map();
                        results.data.forEach(claimResults => claimResults.responses.forEach(entry => factChecks.set(entry.id, entry.entity)));
                        setFactChecks(request.factChecks);
                        return false;
                    default:
                        // These messages are not for us.
                        return false;
                }
            }
        );
    }, []);

    const authenticationButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({mode: MessageMode.Authentication});
            console.log(response);
        })();
    }

    const testingButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({mode: MessageMode.Testing});
            console.log(response);
        })();
    }

    return (
        <div id='popup' className='outlet'>
            <button onClick={authenticationButton}>Authentication</button>
            <button onClick={testingButton}>Testing</button>
            <hr/>

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
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
