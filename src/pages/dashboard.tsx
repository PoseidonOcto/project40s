import React, { useEffect, useState } from "react";
import "../style.css"
import {handleUserQuery} from "../gptApi";
import { Outlet, Link } from "react-router-dom";



const Dashboard = () => {
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
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} disabled={isLoading}
                    onClick={(_) => awaitUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon">bruh</div>}
            <p>{queryResult}</p>
            <hr/>
            <Link to={`education`}>Education is here!</Link>
            <hr/>
            <div>
                <p>Fun <br/> Survey <br/> Time</p>
                <div className='survey'>
                    <label>
                        <input type='checkbox'/> Left
                    </label>
                    <br/>
                    <label>
                        <input type='checkbox'/> Right
                    </label>
                    <br/>
                    <label>
                        <input type='checkbox'/> Authoritarian
                    </label>
                    <br/>
                    <label>
                        <input type='checkbox'/> Libertarian
                    </label>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

