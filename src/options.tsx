import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css"
import {
    createHashRouter,
    RouterProvider,
} from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Education from "./pages/education";
import Sidebar from "./components/sidebar";
import Preferences from "./pages/preferences";
import Help from "./pages/help";

const router = createHashRouter([
    {
        path: "/",
        element: <Sidebar/>,
        children: [
            {
                // The default child
                index: true,
                element: <Dashboard />,
            },
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "education",
                element: <Education />,
            },
            {
                path: "preferences",
                element: <Preferences />,
            },
            {
                path: "help",
                element: <Help />,
            },
        ],
    },
]);


const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
