import React, {useEffect, useState} from "react";
import { FactCheckData2 } from "../types";
import { TaskQueue } from "../utils";

const FactDisplayEntry = ( {data}: {data: FactCheckData2} ) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    return (
        <>
            <button id={"expand-fact-button"} onClick={() => setIsExpanded(!isExpanded)}><i>Click to See Relevant Claims</i><br/>{isExpanded ? <strong>∧</strong> : <strong>∨</strong>}</button>
            {isExpanded &&
                <div id="triggering-fact-container">
                {data.triggers.map((entry, j) => <a id={"triggering-fact"} key={j}><i>{'"' + entry.text + '"'}</i></a>)}
                </div>
            }
        </>
    );
};

export default FactDisplayEntry;
