import React, { useState, useEffect, ReactElement } from "react";


export const getFaviconOfWebsite = (url: string): string => {
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`
}

/*
 * The image may fail to load and return a temporary image, with the website we
 * query returning a replacement image but also a 404 error. This 404 error is
 * logged to console. Because it returns a replacement image, the 'onerror'
 * image property never triggers. Hence, catching this 404 error before it logs 
 * is suprisingly hard.
 */
const FaviconDisplay = ( {url}: {url: string} ) => {
    return (
        <>
            <img src={getFaviconOfWebsite(url)}/>
        </>
    );
};

export default FaviconDisplay;
