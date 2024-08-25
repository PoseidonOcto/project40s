import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Style from "./style";
import {handleUserQuery} from "./gptApi";



const Options = () => {
    const [queryText, setQueryText] = useState<string>();
    const [queryResult, setQueryResult] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const awaitUserQuery = async (query: string | undefined): Promise<void> => {
        setIsLoading(true);
        setQueryResult((await handleUserQuery(query)).response);
        setIsLoading(false);
        return;
    }


    return (
        <>
            <Style/>
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} disabled={isLoading}
                    onClick={(_) => awaitUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon">bruh</div>}
            <p>{queryResult}</p>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
