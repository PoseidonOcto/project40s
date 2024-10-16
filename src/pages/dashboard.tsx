import React from "react";
import "../style.css"
import "../facts.css"
import BarGraph from "../components/graph";
import FactDisplay from "../components/factDisplay";
import DeleteUserDataButton from "../components/deleteUserDataButton";
import { DATA_USAGE_MESSAGE } from "../utils";

const SPECIFIC_DATA_USAGE_MESSAGE = DATA_USAGE_MESSAGE(true) + " Upon pressing " +
    "the button below, all data collected related to you will be deleted from the database."

const Dashboard = () => {
    return (
        <>
            <h1>Dashboard</h1>
            <h2>Media Consumption</h2>
            <BarGraph />
            <hr/>
            <h2>Facts Checks</h2>
            <h4>Here are some fact checks we found relating to the content you've viewed.</h4>
            <br/>
            <FactDisplay />
            <hr/>
            <h2>Data Usage</h2>
            <div id="data-usage">
                <p dangerouslySetInnerHTML={{__html: SPECIFIC_DATA_USAGE_MESSAGE}}></p>
            </div>
            <br/>
            <DeleteUserDataButton />
        </>
    );
};

export default Dashboard;

