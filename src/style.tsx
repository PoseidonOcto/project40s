import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Style = () => {
    const css =
        `.loadingIcon {
              border: 10px solid #f3f3f3;
              border-top: 10px solid #3498db;
              border-radius: 50%;
              width: 80px;
              height: 80px;
              animation: spin 1s linear infinite;
              }
        @keyframes spin {
              0% {
                  transform: rotate(0deg);
              }
              100% {
                  transform: rotate(360deg);
              }
            }
        .loadingButton {
            background-color: #808080;
            color: #DCDCDC;
            }
            
        .loadingButton:active { border-style: outset;}
        
        .notLoadingButton {
            background-color: #DCDCDC;
            color: #0000000;
            }
    `
    return (
        <>
            <style>
                {css}
            </style>
        </>
    );
};

// const root = createRoot(document.getElementById("root")!);

export default Style;