import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
    const [count, setCount] = useState(0);
    const [currentURL, setCurrentURL] = useState<string>();

    useEffect(() => {
        chrome.action.setBadgeText({ text: count.toString() });
    }, [count]);

    // Technically would not update if the page redirects while the popup is open.
    //   However, this is a rare occurance, and likely would not impact user experience.
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url);
            // console.log("onPopup: ");
            // tabs.forEach((tab) => {console.log(tab);});
        });
    }, []);


    const changeBackground = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            // console.log("onBackground: ");
            // tabs.forEach((tab) => {console.log(tab);});
            if (tab.id) {
                chrome.tabs.sendMessage(
                    tab.id,
                    {
                        color: "#555555",
                    },
                    (msg) => {
                        console.log("result message:", msg);
                    }
                );
            }
        });
    };


    const onCallbackFromAuthentication = (result: any) => {
        console.log(result.token);
    }

    const authenticationButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({authentication: "true"});
            // do something with response here, not outside the function
            console.log(response);
        })();
        //chrome.identity.getAuthToken({interactive: true}, onCallbackFromAuthentication);
    }

    return (
        <>
            <ul style={{ minWidth: "700px" }}>
                <li>Current URL: {currentURL}</li>
                <li>Current Time: {new Date().toLocaleTimeString()}</li>
            </ul>
            <button
                onClick={() => setCount(count + 1)}
                style={{ marginRight: "5px" }}
            >
                count up
            </button>
            <button onClick={changeBackground}>change background</button>
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
