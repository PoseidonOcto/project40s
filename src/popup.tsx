import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {handleUserQuery} from "./gptApi";


// Attribution: Alot of this code is inspired by the offical ChatGPT manual that tells you how to do this stuff.

const Popup = () => {
    const [queryText, setQueryText] = useState<string>();

    const authenticationButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({authentication: "true"});
            // do something with response here, not outside the function
            console.log(response);
        })();
        //chrome.identity.getAuthToken({interactive: true}, onCallbackFromAuthentication);
    }

    const logQueryResult = async (query: string | undefined): Promise<void> => {
        console.log((await handleUserQuery(query)).response);
    }

    // TODO put button in form? I think this is better practice?
    return (
        <>
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" onClick={(_) => logQueryResult(queryText)}>Query</button>
            <button onClick={authenticationButton}>Authentication</button>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
