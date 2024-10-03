import React, { useEffect, useState } from "react";
import "../style.css"
import { setSimilarityThreshold } from "../factCheckApi";


const Preferences = () => {
    const [threshold, setThreshold] = useState<number | undefined>(undefined);

    const updateStoredThreshold = async (userInput: string) => {
        const number = Number(userInput);
        setThreshold(number);
        await setSimilarityThreshold(number);
    }

    return (
        <>
            <h1>Preferences</h1>
            <div id="options-container">
                <div>
                    <p>Similarity Threshold</p>
                    <input name="threshold" onChange={(e) => updateStoredThreshold(e.target.value)}/>


                </div>
                <div id="option-text">
                    <div>Dark Mode Option:</div>
                </div>
                <div id="options">
                    <div className="btn-group">
                        <button>Light</button>
                        <button>Dark</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Preferences;

