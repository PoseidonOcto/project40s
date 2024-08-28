import React, { useEffect, useState } from "react";
import Style from "./style";
import { createRoot } from "react-dom/client";
import {handleUserQuery} from "./gptApi";


const Selection = () => {
    const [queryResult, setQueryResult] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const awaitUserQuery = async (query: string | undefined): Promise<void> => {
        setIsLoading(true);
        setQueryResult((await handleUserQuery(query)).response);
        setIsLoading(false);
        return;
    }

    useEffect(() => {
        if (!self.hasOwnProperty('queryText')) {
            // TODO handle
            return;
        }

        //@ts-ignore: We know this property exists
        awaitUserQuery(self.queryText);
    }, []);

    // TODO put button in form? I think this is better practice?
    //
    const selectionPopupStyle: React.CSSProperties = {
        bottom: 0, 
        right: 0, 
        display: "flex",
        // width: "20%", 
        // height: "15svh", 
        position: "fixed" as "fixed",  // Expects non-string type
        backgroundColor: "lightgreen",
        zIndex: 2147483647,
        padding: "1%",
    }

    const textareaStyle: React.CSSProperties = {
        width: "30vw",
        height: "15vh",
        padding: "5%",
    }
    return (
        <>
            <Style/>
            <div style={selectionPopupStyle}>
                {isLoading && <div className="loadingIcon"></div>}
                {!isLoading && <textarea value={queryResult} style={textareaStyle}/>}
            </div>
        </>
    );
};

const rootTarget = document.createElement("div");
rootTarget.id = "project40s-selection";

// Make stay on top and cover screen
// rootTarget.style.display = "block";
// rootTarget.style.height = "100svh";
// rootTarget.style.width = "100%";
// rootTarget.style.top = "0px";
// rootTarget.style.left = "0px";
// rootTarget.style.maxHeight = "none";
// rootTarget.style.maxWidth = "none";
// rootTarget.style.minHeight = "unset";
// rootTarget.style.minWidth = "unset";
// rootTarget.style.position = "fixed";
// rootTarget.style.zIndex = "2147483647";
// //rootTarget.style.background = "transparent";
// rootTarget.style.borderWidth = "0px";
// // rootTarget.style.borderRadius = "0px";
// rootTarget.style.margin = "0px";
// //rootTarget.style.outline = "0px";
// rootTarget.style.padding = "0px";
// // rootTarget.style.overflowClipMargin = "content-box";
// rootTarget.style.overflow = "clip";
// rootTarget.style.pointerEvents = "none";

document.documentElement.appendChild(rootTarget);

const root = createRoot(rootTarget!);

root.render(
    <React.StrictMode>
        <Selection />
    </React.StrictMode>
);
