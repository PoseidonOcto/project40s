import React, { useEffect, useState } from "react";
import "../style.css"
import {Outlet, Link, useLocation} from "react-router-dom";


const Sidebar = () => {
    const location = useLocation();
    return (
        <>
            <div className="flexbox-container">
                <div className="sidebar-container">
                    <div className="icon-holder">
                        <img src="../images/hamburger-icon.png" alt="menu-icon"></img>
                        <br/>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder">
                            <Link to={`dashboard`} id="dashboard">
                                <img src="../images/dashboard-icon.png" alt="dashboard-icon" id="document-icon"></img>
                                <br/> {location.pathname === "/dashboard" ? <p>Dashboard &larr;</p> : <p>Dashboard</p>}
                            </Link><br/>
                        </div>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder">
                            <Link to={`education`} id="education">
                                <img src="../images/education-icon.png" alt="education-icon" id="education-icon"></img>
                                <br/> {location.pathname === "/education" ? <p>Education &larr;</p> : <p>Education</p>}
                            </Link>
                        </div>
                    </div>
                    <div id="button-holder">
                        <p>Last Login Date:</p>
                        <p>insert date here</p>
                        <button id="logout-button" onClick={() => {console.log(location.pathname)}}>Log Out</button>
                    </div>
                </div>
                <div className="outlet">
                    <h1>The page selected is output here</h1>
                    <h3>(Dashboard by default)</h3>
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default Sidebar;

