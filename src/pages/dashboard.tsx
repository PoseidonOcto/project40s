import React from "react";
import "../style.css"
import "../facts.css"
import BarGraph from "../components/graph";
import FactDisplay from "../components/factDisplay";


const Dashboard = () => {
    return (
        <>
            <h1>Dashboard</h1>
            <BarGraph />
            <h4>Testing Test</h4>
            <hr/>
            <h3>Here are some fact checks that may be relevant to you</h3>
            <FactDisplay />
        </>
    );
};

export default Dashboard;

