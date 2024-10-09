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
            <hr/>
            <h2>Facts Checks</h2>
            <h4>Here are some fact checks we found relating to the content you've viewed.</h4>
            <br/>
            <FactDisplay />
        </>
    );
};

export default Dashboard;

