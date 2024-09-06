import React, { useEffect, useState } from "react";
import "../style.css"
import { Outlet, Link } from "react-router-dom";


const Sidebar = () => {
    return (
        <>
            <div>
                <h1>Sidebar is here</h1>
                <h3>(i.e. this is where the links are, we can transform this so it's on the left of the page)</h3>
                <Link to={`dashboard`}>Click to show Dashboard!</Link><br/>
                <Link to={`education`}>Click to show Education!</Link>

            </div>
            <hr/>
            <div>
                <h1>The page selected is output here</h1>
                <h3>(Dashboard by default)</h3>
                <Outlet />
            </div>
        </>
    );
};

export default Sidebar;

