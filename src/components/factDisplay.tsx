import React, {Fragment, useEffect, useRef, useState} from "react";
import { FactCheckIndex2 } from "../types";
import { getStoredFacts } from "../factCheckApi";
import { TaskQueue } from "../utils";
import FactDisplayEntry from "./factDisplayEntry";

const FactDisplay = () => {
    const [factChecks, setFactChecks] = useState<FactCheckIndex2>(new Map());
    const taskQueue = useRef<TaskQueue>(new TaskQueue());
    const [expandTriggeringFactDisplay, setTriggeringFactDisplay] = useState<boolean>(false);

    useEffect(() => {
        const updateData = () => taskQueue.current.enqueue((async () => {
            // This is potentially unsynchronous (service worker could be setting badge text at same time),
            // however fixing this would require enqueuing this task in the service workers task queue
            // instead, and the notification number being a bit out of sync isn't too bad.
            await chrome.action.setBadgeText({text: ""});
            const response = await getStoredFacts();
            if (response.status === 'success') {
                setFactChecks(response.data);
            } else {
                console.error(response);
            }
        }));

        updateData();

        /*
         * To communicate back and forth with the service worker,
         * utilise the chrome.storage listener. Sending messages
         * to the popup from the background script requires a
         * handshake first - see: https://tinyurl.com/ynmtyy44
         */
        chrome.storage.onChanged.addListener((_, type) => {
            if (type === 'session') {
                updateData();
            }
        });
    }, []);

    return (
        <>
            <div id="fact-checks">
                {factChecks.size === 0 && <p>None</p>}
                {factChecks.size !== 0 && Array.from(factChecks.values()).map((fact, i) => {
                    return (
                        <Fragment key={i}>
                            <div id="fact-check">
                                <dl>
                                    <dt className='claim'>Claim:<br/>
                                        <i>{fact.claim}</i>
                                    </dt>
                                    <div id="truth-author-container">
                                        <a className='truth-status'><strong>Truth Status:</strong> {fact.review}</a>
                                        <a className='author'>Author: {fact.author_name} | <a href={fact.url}>Source</a></a>
                                    </div>
                                </dl>
                            </div>
                            <div id="fact-display-entry-container">
                                <FactDisplayEntry  data={fact}/>
                            </div>
                            {/*<button id={"trigger-fact-display-button"} onClick={() => {setTriggeringFactDisplay(!expandTriggeringFactDisplay)}}></button>\*/}
                            {/*<div id="triggering-fact-container">*/}
                            {/*    {Array.from(fact.triggeringText.values())*/}
                            {/*        .map((text, j) => <a id={"triggering-fact"}key={j}><i>"{text}"</i></a>)*/}
                            {/*    }*/}
                            {/*</div>*/}
                            <hr/>
                        </Fragment>

                    );
                })}
            </div>
        </>
    )
};

export default FactDisplay;
