import React, {useEffect, useState} from "react";
import { FactCheckData } from "../types";
import {getDatabase} from "../factCheckApi";
import { TaskQueue } from "../utils";

const FactDisplayEntry = ( {data}: {data: FactCheckData} ) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    return (
        <>
            <button id={"expand-fact-button"} onClick={() => setIsExpanded(!isExpanded)}><i>Click to See Relevant Claims</i><br/>{isExpanded ? <strong>∧</strong> : <strong>∨</strong>}</button>
            {isExpanded &&
                <div id="triggering-fact-container">
                {Array.from(data.triggeringText.values())
                    .map((text, j) => <a id={"triggering-fact"}key={j}><i>"{text}"</i></a>)
                }
                </div>
            }
        </>
    );
};

export default FactDisplayEntry;