import React from "react";
import { createRoot } from "react-dom/client";
import { MessageMode, isDeveloperMode } from "./types";
import "./style.css"
import "./facts.css"
import "./popup.css"
import FactDisplay from "./components/factDisplay";

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

    const clearStorage = () => {
        (async () => {
            await chrome.storage.sync.remove("similarity_threshold");
            await chrome.storage.session.clear();
        })();
    }

    const openOptionsPage = () => {
        chrome.runtime.sendMessage({mode: MessageMode.OpenOptionsPage});
    }

    return (
        <div id='popup' className='outlet'>
            {isDeveloperMode && 
                <>
                    <button onClick={authenticationButton}>Authentication</button>
                    <button onClick={testingButton}>Testing</button>
                    <button onClick={clearStorage}>Clear Storage</button>
                </>
            }
            <button id='dashboard-button-container' onClick={openOptionsPage}><strong>Dashboard</strong></button>
            <hr/>
            <h3>Here are some facts that may be relevant to you</h3>
            <br/>
            <FactDisplay />
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
