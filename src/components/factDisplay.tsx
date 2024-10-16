import React, {Fragment, useEffect, useRef, useState} from "react";
import { FactCheckIndex } from "../types";
import { getStoredFacts } from "../factCheckApi";
import { TaskQueue } from "../utils";
import FactDisplayTrigger from "./factDisplayTrigger";
import FaviconDisplay from "./faviconDisplay";

const FactDisplay = () => {
    const [facts, setFacts] = useState<FactCheckIndex | undefined>(undefined);
    const taskQueue = useRef<TaskQueue>(new TaskQueue());

    useEffect(() => {
        const updateData = (clearBadge: boolean) => taskQueue.current.enqueue((async () => {
            // This is potentially unsynchronous (service worker could be setting badge text at same time),
            // however fixing this would require enqueuing this task in the service workers task queue
            // instead, and the notification number being a bit out of sync isn't too bad.
            if (clearBadge) {
                await chrome.action.setBadgeText({text: ""});
            }
            const response = await getStoredFacts();
            if (response.status === 'success') {
                setFacts(response.data);
            } else {
                console.error(response);
            }
        }));

        updateData(true);

        /*
         * To communicate back and forth with the service worker,
         * utilise the chrome.storage listener. Sending messages
         * to the popup from the background script requires a
         * handshake first - see: https://tinyurl.com/ynmtyy44
         */
        chrome.storage.onChanged.addListener((_, type) => {
            if (type === 'session') {
                updateData(false);
            }
        });
    }, []);

    return (
        <>
            <div id="fact-checks">
                {facts === undefined && <div className="loadingIcon"></div>}
                {facts !== undefined && facts.size === 0 && <p>None</p>}
                {facts !== undefined && facts.size !== 0 && Array.from(facts.values()).map((fact, i) => {
                    return (
                        <Fragment key={i}>
                            <div id="fact-check">
                                <dl>
                                    <div id={"claim-container"}>
                                        <div id={"claim-icon-container"}>
                                            <FaviconDisplay id={"claim-icon"} url={fact.url}/>
                                        </div>
                                        <dt className='claim'>
                                            <i>{fact.claim}</i>
                                        </dt>
                                    </div>
                                    <hr/>
                                    <div id="truth-author-container">
                                        <a className='truth-status'><strong>Truth Status:</strong> {fact.review}</a>
                                        <p className='author'>Author: {fact.author_name} | <a href={fact.url} target="_blank">Source</a></p>
                                    </div>
                                </dl>
                            </div>
                            <div id="fact-display-entry-container">
                                <FactDisplayTrigger triggers={fact.triggers}/>
                            </div>
                            <hr/>
                        </Fragment>

                    );
                })}
            </div>
        </>
    )
};

export default FactDisplay;
