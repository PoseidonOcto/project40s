import React, { useEffect, useState, useRef } from "react";
import "../style.css"
import "./preferences.css"
import { DEFAULT_SIMILARITY_THRESHOLD, MAXIMUM_SIMILARITY_THRESHOLD, MINIMUM_SIMILARITY_THRESHOLD, getSimilarityThreshold, setSimilarityThreshold } from "../factCheckApi";
import { Slider } from "@mui/material";
import { TaskQueue } from "../utils";

const SLIDER_STEP = 0.05

const Preferences = () => {
    const [sliderValue, setSliderValue] = useState<number | undefined>(undefined);
    const thresholdUpdateQueue = useRef<TaskQueue>(new TaskQueue());

    useEffect(() => {
        thresholdUpdateQueue.current.enqueue(async () => {
            setSliderValue(-1 * await getSimilarityThreshold());
        });
    },[]);

    const updateDisplayedThreshold = (newThreshold: number) => {
        setSliderValue(-1 * newThreshold);
    }

    const updateStoredThreshold = async (newThreshold: number) => {
        thresholdUpdateQueue.current.enqueue(async () => {
            await setSimilarityThreshold(newThreshold)
        });
    }

    const resetToDefaultThreshold = async () => {
        updateDisplayedThreshold(DEFAULT_SIMILARITY_THRESHOLD);
        await updateStoredThreshold(DEFAULT_SIMILARITY_THRESHOLD);
    }

    // TODO Should say 'saved' when onChangeCommitted to give user feedback.
    return (
        <>
            <h1>Preferences</h1>
            <hr/>
            <div id="slider-container">
                <h4>Fact Relevance Threshold</h4>
                <br/>
                <div id="slider">
                    {sliderValue === undefined && <div className="loadingIcon"></div>}
                    {sliderValue !== undefined && 
                        <Slider
                            aria-label="Small steps"
                            defaultValue={sliderValue}
                            value={sliderValue}
                            step={SLIDER_STEP}
                            min={-MAXIMUM_SIMILARITY_THRESHOLD}
                            max={-MINIMUM_SIMILARITY_THRESHOLD}
                            marks={[{label: "Show facts with any relevance", value: -MINIMUM_SIMILARITY_THRESHOLD}, 
                                    {label: "Show very relevant facts", value: -MAXIMUM_SIMILARITY_THRESHOLD}]}
                            onChange={(_, newThreshold) => updateDisplayedThreshold(-1 * (newThreshold as number))}
                            onChangeCommitted={(_, newThreshold) => updateStoredThreshold(-1 * (newThreshold as number))}
                        />
                    }
                </div>
                <br/>
                <button onClick={resetToDefaultThreshold}>Reset to default</button>
            </div>
        </>
    );
};

export default Preferences;

