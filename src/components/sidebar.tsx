import React, { useEffect, useState } from "react";
import "../style.css"
import {Outlet, Link, useLocation} from "react-router-dom";
import set = chrome.cookies.set;

// TODO Make side bar collapse on click on an icon
const Sidebar = () => {
    const [sideBarVisible, setSideBarClicked] = useState<boolean>(false);
    const location = useLocation();
    return (
        <>
            <div className="flexbox-container">
                <div className={sideBarVisible ? "sidebar-container" : "collapsed-sidebar-container"}>
                    <div className="icon-holder">
                        <img src="../images/hamburger-icon.png" alt="menu-icon" id="hamburger-icon" onClick={() => setSideBarClicked(!sideBarVisible)}></img>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/dashboard" ? "selected" : "not-selected"}>
                            <Link to={`dashboard`} id="dashboard">
                                <img src="../images/dashboard-icon.png" alt="dashboard-icon" id="document-icon"></img>
                                <br/> {sideBarVisible ? (location.pathname === "/dashboard" ? <p><strong>Dashboard</strong></p> : <p>Dashboard</p>) : <></>}
                            </Link><br/>
                        </div>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/education" ? "selected" : "not-selected"}>
                            <Link to={`education`} id="education">
                                <img src="../images/education-icon.png" alt="education-icon" id="education-icon"></img>
                                <br/> {sideBarVisible ? (location.pathname === "/education" ? <p><strong>Education</strong></p> : <p>Education</p>) : <></>}
                            </Link>
                        </div>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/preferences" ? "selected" : "not-selected"}>
                            <Link to={`preferences`} id="preferences">
                                <img src="../images/gear-icon.png" alt="preferences-icon" id="preferences-icon"></img> {/* https://www.flaticon.com/free-icon/gear_1160356 */}
                                <br/> {sideBarVisible ? (location.pathname === "/preferences" ? <p><strong>Preferences</strong></p> : <p>Preferences</p>) : <></>}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="outlet">
                    {/* Putting anything here will be above the outlet */}
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default Sidebar;

