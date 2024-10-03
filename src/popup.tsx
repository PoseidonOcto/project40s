import React, { useEffect, useState, Fragment, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MessageMode, isDeveloperMode } from "./types";
import { getDatabase } from "./factCheckApi";
import "./style.css"
import "./facts.css"
import "./popup.css"
import { TaskQueue } from "./utils";
import { FactCheckData } from "./types";

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

    const openOptionsPage = () => {
        chrome.runtime.sendMessage({mode: MessageMode.OpenOptionsPage});
    }

    // TODO the triggering text could be paired with a URL directing to the page
    //  where it came from. This URL could even maybe link directly to the text.
    // TODO the triggering piece of text needs to be kept a little bit more separate
    //  from other triggering pieces, the kind of blend together.
    return (
        <div id='popup' className='outlet'>
            {isDeveloperMode && 
                <>
                    <button onClick={authenticationButton}>Authentication</button>
                    <button onClick={testingButton}>Testing</button>
                    <button onClick={clearStorage}>Clear Storage</button>
                </>
            }
            <div id='dashboard-button-container'>
                <button id='dashboard-button' onClick={openOptionsPage}>Dashboard</button>
            </div>
            <hr/>


            <h3>Here are some facts that may be relevant to you</h3>
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
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
