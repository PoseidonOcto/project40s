import React from "react";
import { createRoot } from "react-dom/client";
import { MessageMode } from "./types";

const Popup = () => {
    const authenticationButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({mode: MessageMode.Authentication});
            console.log(response);
        })();
    }

    const testingButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({mode: MessageMode.Testing});
            console.log(response);
        })();
    }

    return (
        <>
            <button onClick={authenticationButton}>Authentication</button>
            <button onClick={testingButton}>Testing</button>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
