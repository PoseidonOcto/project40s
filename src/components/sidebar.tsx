import React, { useEffect, useState } from "react";
import "../style.css"
import {Outlet, Link, useLocation} from "react-router-dom";
import set = chrome.cookies.set;
import {MessageMode} from "../types";
import { getUserProfileIcon } from "../background";

// TODO Make side bar collapse on click on an icon
const Sidebar = () => {
    const [image, setImage] = useState<string | undefined>(undefined);
    const [sideBarVisible, setSideBarClicked] = useState<boolean>(false);
    const location = useLocation();
    const [firstOpen, setFirstOpen] = useState<boolean>(location.pathname == "/");

    useEffect(() => {
        (async () => {
            const response = await getUserProfileIcon();
            if (response.status === 'error') {
                console.error(response);
                return;
            }
            console.log(response);

            setImage(response.data);
        })();
    }, []);

    return (
        <>
            <div className="flexbox-container">
                <div className={sideBarVisible ? "sidebar-container" : "collapsed-sidebar-container"}>
                    <div id="hamburger-icon-holder" className="icon-holder" onClick={() => setSideBarClicked(!sideBarVisible)}>
                        <img src="../images/hamburger-icon.png" alt="menu-icon" id="hamburger-icon"></img>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/dashboard" || firstOpen ? "selected" : "not-selected"}>
                            <Link to={`dashboard`} id="dashboard" onClick={() => {setFirstOpen(false)}}>
                                <img src="../images/dashboard-icon.png" alt="dashboard-icon" id="document-icon"></img>
                                {sideBarVisible ? (location.pathname === "/dashboard" ? <p><strong>Dashboard</strong></p> : <p>Dashboard</p>) : <></>}
                            </Link>
                        </div>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/education" ? "selected" : "not-selected"}>
                            <Link to={`education`} id="education" onClick={() => {setFirstOpen(false)}}>
                                <img src="../images/education-icon.png" alt="education-icon" id="education-icon"></img>
                                {sideBarVisible ? (location.pathname === "/education" ? <p><strong>Education</strong></p> : <p>Education</p>) : <></>}
                            </Link>
                        </div>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/preferences" ? "selected" : "not-selected"}>
                            <Link to={`preferences`} id="preferences" onClick={() => {setFirstOpen(false)}} >
                                <img src="../images/gear-icon.png" alt="preferences-icon" id="preferences-icon"></img> {/* https://www.flaticon.com/free-icon/gear_1160356 */}
                                {sideBarVisible ? (location.pathname === "/preferences" ? <p><strong>Preferences</strong></p> : <p>Preferences</p>) : <></>}
                            </Link>
                        </div>
                    </div>
                    <div className="arrow-icon-container">
                        <div className="icon-holder" id={location.pathname === "/help" ? "selected" : "not-selected"}>
                            <Link to={`help`} id="help">
                                <img src="../images/gear-icon.png" alt="help-icon" id="help-icon"></img>
                                {sideBarVisible ? (location.pathname === "/help" ? <p><strong>Help</strong></p> : <p>Help</p>) : <></>}
                            </Link>
                        </div>
                    </div>
                    <div id="profile-icon">
                        {image === undefined && <div className="loadingIcon"></div>}
                        {image !== undefined && 
                            <img id="profile" src={image} 
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    // currentTarget.src="image_path_here";
                                }}/>
                            }
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

