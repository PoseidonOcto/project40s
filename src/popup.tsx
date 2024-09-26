import React, { useEffect, useState, Fragment, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MessageHandler, MessageMode } from "./types";
import { FactCheckResults, FactCheckResultEntry, getDatabase } from "./factCheckApi";
import "./style.css"
import "./popup.css"
import { TaskQueue } from "./utils";

type FactCheckData = {
    triggeringText: Set<string>,
} & FactCheckResultEntry['entity']

const Popup = () => {
    const [factChecks, setFactChecks] = useState<Map<number, FactCheckData>>(new Map());
    const taskQueue = useRef<TaskQueue>(new TaskQueue());


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

    const clearStorage = () => {
        (async () => {
            await chrome.storage.session.clear();
        })();
    }

    return (
        <div id='popup' className='outlet'>
            <button onClick={authenticationButton}>Authentication</button>
            <button onClick={testingButton}>Testing</button>
            <button onClick={clearStorage}>Clear Storage</button>
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
