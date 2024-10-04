import React, { useEffect, useState, useRef } from "react";
import "../style.css"
import { getSimilarityThreshold, setSimilarityThreshold } from "../factCheckApi";
import { Slider } from "@mui/material";
import { TaskQueue } from "../utils";


const Preferences = () => {
    const [threshold, setThreshold] = useState<number | undefined>(undefined);
    const thresholdUpdateQueue = useRef<TaskQueue>(new TaskQueue());

    useEffect(() => {
        thresholdUpdateQueue.current.enqueue(async () => {
            setThreshold(await getSimilarityThreshold());
        });
    },[]);

    const updateStoredThreshold = async (newThreshold: number) => {
        thresholdUpdateQueue.current.enqueue(async () => {
            await setSimilarityThreshold(newThreshold)
        });
    }

    // {getAriaValueText={'TODO'}}
    return (
        <>
            <h1>Preferences</h1>
            <div id="options-container">
                <div id="option">
                    {threshold !== undefined && 
                        <Slider
                            aria-label="Small steps"
                            defaultValue={threshold!}
                            value={threshold!}
                            step={0.05}
                            marks
                            min={0.5}
                            max={1}
                            valueLabelDisplay="auto"
                            onChange={(_, newThreshold) => setThreshold(newThreshold as number)}
                            onChangeCommitted={(_, newThreshold) => updateStoredThreshold(newThreshold as number)}
                        />
                    }

                </div>
                <div id="option-text">
                    <div>Dark Mode Option:</div>
                </div>
                <div id="options">
                    <div className="btn-group">
                        <button>Light</button>
                        <button>Dark</button>
                    </div>
                <button onClick={() => console.log("test")}>TEST BUTTON</button>
                </div>
            </div>
        </>
    );
};

export default Preferences;

