import React, { useEffect, useState } from "react";
import "../style.css"


const Preferences = () => {
    return (
        <>
            <h1>Preferences</h1>
            <div id="options-container">
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

