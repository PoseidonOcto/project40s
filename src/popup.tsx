import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
    const [queryText, setQueryText] = useState<string>();
    const [currentURL, setCurrentURL] = useState<string>();

    // useEffect(() => {
    //     chrome.action.setBadgeText({ text: count.toString() });
    // }, [count]);

    // Technically would not update if the page redirects while the popup is open.
    //   However, this is a rare occurance, and likely would not impact user experience.
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url);
            // console.log("onPopup: ");
            // tabs.forEach((tab) => {console.log(tab);});
        });
    }, []);


    // const changeBackground = () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //         const tab = tabs[0];
    //         // console.log("onBackground: ");
    //         // tabs.forEach((tab) => {console.log(tab);});
    //         if (tab.id) {
    //             chrome.tabs.sendMessage(
    //                 tab.id,
    //                 {
    //                     color: "#555555",
    //                 },
    //                 (msg) => {
    //                     console.log("result message:", msg);
    //                 }
    //             );
    //         }
    //     });
    // };


    const authenticationButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({authentication: "true"});
            // do something with response here, not outside the function
            console.log(response);
        })();
        //chrome.identity.getAuthToken({interactive: true}, onCallbackFromAuthentication);
    }

    const queryChatGPT = (query: string | undefined) => {
        if (query === undefined) {
            return;
        }

        // TODO make secure!!! Should not be in code!!!
        const OPENAI_API_KEY = "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";
        let init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + OPENAI_API_KEY
            },
            body: JSON.stringify({
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a helpful assistant.'
                    },
                    {
                        'role': 'user',
                        'content': query
                    }
                ]
            })
        };
        fetch('https://api.openai.com/v1/chat/completions', init)
                .then((response) => response.json())
                .then(function(data) {
                    console.log(data);
                });
    };

    // TODO put button in form? I think this is better practice?
    return (
        <>
            <ul style={{ minWidth: "700px" }}>
                <li>Current URL: {currentURL}</li>
                <li>Current Time: {new Date().toLocaleTimeString()}</li>
            </ul>
            {/*
            <button
                onClick={() => setCount(count + 1)}
                style={{ marginRight: "5px" }}
            >
                count up
            </button>
            <button onClick={changeBackground}>change background</button>
            */}
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" onClick={(_) => queryChatGPT(queryText)}>Query</button>
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
