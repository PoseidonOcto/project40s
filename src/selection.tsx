import React, { useEffect, useState } from "react";
import "./cleanslate.css"
import "./style.css"
import "./selection.css"
import { createRoot } from "react-dom/client";
import { APIResponse, MessageMode } from "./types";

/*
 * If the website the script is injected into has existing css,
 * it will conflict with the css of our component.
 */
const Selection = () => {
    const [queryResult, setQueryResult] = useState<APIResponse<number> | undefined>(undefined);

    /*
     * Note in development mode, the query will be sent twice to the database
     * due to the useEffect running twice, and the second one will hence always
     * reveal no unseen facts. In production however, this will work fine.
     */
    useEffect(() => {
        if (!self.hasOwnProperty('queryText')) {
            console.error("Selection popup opened without queryText.");
            return;
        }

        //@ts-ignore: We know this property exists
        const query = self.queryText;
        handleUserQuery(query);
    }, []);


    const handleUserQuery = async (query: string | undefined): Promise<void> => {
        if (query === undefined) {
            console.error("User query was undefined.");
            return;
        }

        setQueryResult(await chrome.runtime.sendMessage({
            mode: MessageMode.FactCheck, claims: [query!]
        }));
    }

    return (
        <>
            <div id="selection-popup">
                <h2>Manual Fact Detector</h2>
                <hr/>
                {queryResult === undefined && <div className="loadingIcon"></div>}
                {queryResult !== undefined && queryResult.status === 'error' && <p>Something went wrong.</p>}
                {queryResult !== undefined && queryResult!.status === 'success' && <p>{`Your query triggered ${queryResult.data} previously unseen facts.`}</p>}
            </div>
        </>
    );
};

const SELECTION_ROOT_ID = "project40s-selection";
const existingSelectionPopup = document.getElementById(SELECTION_ROOT_ID);
if (existingSelectionPopup != null) {
    existingSelectionPopup.remove();
}

const rootTarget = document.createElement("div");
rootTarget.id = SELECTION_ROOT_ID;
rootTarget.className = 'cleanslate';

document.documentElement.appendChild(rootTarget);

const root = createRoot(rootTarget);

root.render(
    <React.StrictMode>
        <Selection />
    </React.StrictMode>
);
