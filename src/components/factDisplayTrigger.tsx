import React, { useState, Fragment } from "react";
import { FactCheckData2 } from "../types";
import { getFaviconOfWebsite } from "../utils";

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
                            <img src={getFaviconOfWebsite(trigger.url)}/>
                            <a id={"triggering-fact"} href={getLinkToHightlight(trigger.url, trigger.text)}><i>{'"' + trigger.text + '"'}</i></a>
                        </Fragment>
                    );
                })}
                </div>
            }
        </>
    );
};

export default FactDisplayTrigger;
