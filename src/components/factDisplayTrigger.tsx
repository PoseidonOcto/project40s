import React, { useState, Fragment } from "react";
import { FactCheckData2 } from "../types";
import FaviconDisplay from "./faviconDisplay";

/* 
 * Note since we never actually trigger a selection but rather pull text arbitrarily, 
 * we cannot make a link that will always direct the user to the text.
 */
const getLinkToHightlight = (url: string, text: string) => {
    return `${url}#:~:text=${encodeURIComponent(text)}`;
}

const FactDisplayTrigger = ( {triggers}: {triggers: FactCheckData2['triggers']} ) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    return (
        <>
            <button id={"expand-fact-button"} onClick={() => setIsExpanded(!isExpanded)}><i>Show text that triggered this fact</i><br/>{isExpanded ? <strong>&#8743;</strong> : <strong>&#8744;</strong>}</button>
            {isExpanded &&
                <div id="triggering-fact-container">
                {triggers.map((trigger, j) => {
                    return (
                        <Fragment key={j}>
                            <div id="triggering-fact-container">
                                <a id={"triggering-fact"} href={getLinkToHightlight(trigger.url, trigger.text)} target="_blank"><i>{'"' + trigger.text + '"'}</i></a>
                                <div id={"triggering-fact-author-holder"} onClick={() => {window.open(trigger.url, "_blank")}}>
                                    <a>Triggered by visiting: </a>
                                    <FaviconDisplay id={"triggering-fact-icon"} url={trigger.url}/>
                                </div>
                            </div>
                        </Fragment>
                    );
                })}
                </div>
            }
        </>
    );
};

export default FactDisplayTrigger;
