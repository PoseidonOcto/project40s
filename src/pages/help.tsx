import React from "react";
import "../style.css"
import "./help.css"

const Help = () => {

    return (
        <>
            <h1>Help</h1>
            <h4>The following video walks you through our extension.</h4>
            <br/>
            <iframe src="https://www.youtube.com/embed/YNapXCUBqNI?si=l0YzZh_TDHvPye2x" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </>
    );
};

export default Help;

