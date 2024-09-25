import React, { useEffect, useState, Fragment, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MessageHandler, MessageMode } from "./types";
import { FactCheckResults, FactCheckResultEntry } from "./factCheckApi";
import "./style.css"
import "./popup.css"

type FactCheckData = {
    triggeringText: Set<string>,
} & FactCheckResultEntry['entity']

const Popup = () => {
    const [factChecks, setFactChecks] = useState<Map<number, FactCheckData>>(new Map());
    const factChecksPointer = useRef<Map<number, FactCheckData>>(factChecks);
    factChecksPointer.current = factChecks;

    useEffect(() => {
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                switch (request.mode) {
                    case MessageMode.SendFactCheckToPopup:
                        const results: FactCheckResults = request.factChecks;
                        if (results.status !== 'success') {
                            return false;
                        }

                        // Have to use a pointer to factChecks here as the 'factChecks' reference doesn't
                        // stay between renders. Additionally, we clone as it's best practice to mutate clone 
                        // rather than old state.
                        const newFactChecks = structuredClone(factChecksPointer.current);
                        console.log(factChecksPointer.current);

                        // Add all new fact checks to state.
                        for (const claimResults of results.data) {
                            for (const entry of claimResults.responses) {
                                // If a fact check is already there, add the new claim that triggered it.
                                if (newFactChecks.has(entry.id)) {
                                    newFactChecks.get(entry.id)!.triggeringText.add(claimResults.claim);
                                } else {
                                    newFactChecks.set(entry.id, Object.assign({triggeringText: new Set([claimResults.claim])}, entry.entity));
                                }
                            }
                        }
                        setFactChecks(newFactChecks);

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

            <h3>Here are some fact checks that may be relevant to you</h3>
            <div id="fact-checks">
                {factChecks.size === 0 && <p>None</p>}
                {factChecks.size !== 0 && Array.from(factChecks.values()).map((fact, i) => {
                    return (
                        <div id="fact-check" key={i}>
                            <p>Claim: {fact.claim}</p>
                            <p>Truth Status: {fact.review}</p>
                            <p>Author: {fact.author_name}</p>
                            <p>Author url: {fact.author_url}</p>
                            <p>Source: {fact.url}</p>
                            <p>This fact check was triggered by the following text:</p>
                            <ol>
                                {Array.from(fact.triggeringText.values())
                                    .map((text, j) => <li key={j}>{text}</li>)
                                }
                            </ol>
                        </div>
                    );
                })}
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
