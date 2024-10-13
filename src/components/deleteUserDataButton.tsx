import React from "react";
import { MessageMode } from "../types";

const DeleteUserDataButton = () => {
    const deleteData = async () => {
        const response = confirm("Are you sure you wish to delete all your data from the database? This action cannot be undone.");
        if (response) {
            await chrome.runtime.sendMessage({mode: MessageMode.DeleteUserData});
        }
    }

    return (
        <>
            <button id="delete-button" onClick={deleteData}>Delete all data from database</button>
        </>
    )
};

export default DeleteUserDataButton;
