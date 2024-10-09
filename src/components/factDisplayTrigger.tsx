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
            <button id={"expand-fact-button"} onClick={() => setIsExpanded(!isExpanded)}><i>Click to See Relevant Claims</i><br/>{isExpanded ? <strong>∧</strong> : <strong>∨</strong>}</button>
            {isExpanded &&
                <div id="triggering-fact-container">
                {triggers.map((trigger, j) => {
                    return (
                        <Fragment key={j}>
                            <div id="triggering-fact-container">
                                <a id={"triggering-fact"} href={getLinkToHightlight(trigger.url, trigger.text)}><i>{'"' + trigger.text + '"'}</i></a>
                                <div id={"triggering-fact-author-holder"}>
                                    <a>Triggered by: </a>
                                    <img id={"triggering-fact-icon"} src={"IMAGE"}/>
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
