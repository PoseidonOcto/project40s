import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
    const [queryText, setQueryText] = useState<string>();
    const [currentURL, setCurrentURL] = useState<string>();

    // useEffect(() => {
    //     chrome.action.setBadgeText({ text: count.toString() });
    // }, [count]);

    // Technically would not update if the page redirects while the popup is open.
    //   However, this is a rare occurance, and likely would not impact user experience.
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url);
            // console.log("onPopup: ");
            // tabs.forEach((tab) => {console.log(tab);});
        });
    }, []);


    // const changeBackground = () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //         const tab = tabs[0];
    //         // console.log("onBackground: ");
    //         // tabs.forEach((tab) => {console.log(tab);});
    //         if (tab.id) {
    //             chrome.tabs.sendMessage(
    //                 tab.id,
    //                 {
    //                     color: "#555555",
    //                 },
    //                 (msg) => {
    //                     console.log("result message:", msg);
    //                 }
    //             );
    //         }
    //     });
    // };


    const authenticationButton = () => {
        (async () => {
            const response = await chrome.runtime.sendMessage({authentication: "true"});
            // do something with response here, not outside the function
            console.log(response);
        })();
        //chrome.identity.getAuthToken({interactive: true}, onCallbackFromAuthentication);
    }

    const handleUserQuery = (query: string | undefined) => {
        if (query === undefined) {
            return;
        }

        // Encode the raw query into a URL-like format.
        const queryAsUrl = encodeURIComponent(query);

        console.log(queryAsUrl);
        // Search for related articles, and give to chatgpt.
        fetch('https://s.jina.ai/' + queryAsUrl, {method: "GET",})
                .then((response) => response.text())
                .then((searchInfo) => {
                    // Feed info retrieved from related articles to ChatGPT.
                    queryChatGPT(query, searchInfo);
                });
    };

    // TODO could possibly be improved by letting ChatGPT decide to use the tool itself. 
    //      In this manner, it might make multiple useful searches.
    const queryChatGPT = (query: string, relatedInfo: string) => {

        // TODO make secure!!! Should not be in code!!!
        const OPENAI_API_KEY = "sk-svcacct-JHSMzMYNZRVwWuQk3kJ3d0K0F3EuJZP7XbCoI9lB6A6Q6zxbzL4F7PSjumV923F1uMqitGWgjuFV-sDsT3BlbkFJ2YGDJYbL73J-FXGLAZf_DgLACHHlJgH8OiWDTOnXPKyIjtCGUdPALJ3e4g5iIigyHoceAjm_yVgKGbcA";

        // TODO half of these are string for no reason?
        let gptRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + OPENAI_API_KEY
            },
            body: JSON.stringify({
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a helpful assistant.'
                    },
                    {
                        'role': 'user',
                        'content': query
                    },
                ],
                'tools': [
                    {
                        'type': 'function',
                        'strict': true,
                        'function': {
                            'name': 'search_for_information',
                            'description': 'Call this to search online for information related to the user\'s query',
                            'parameters': {
                                'type': 'object',
                                'properties': {
                                    'query_to_search': {
                                        'type': 'string',
                                        'description': 'A query that will be searched online for relevant information',
                                    },
                                },
                                'required': ['query_to_search'],
                                'additionalProperties': false,
                            },
                        }
                    }
                ],
                'tool_choice': {'type': 'function', 'function': {'name': 'search_for_information'}}
            })
        };

        fetch('https://api.openai.com/v1/chat/completions', gptRequest)
                .then((response) => response.json())
                .then(function(response) {
                    console.assert(response.finish_reason == "tool_calls");

                    // Create a message containing the result of the function call
                    const function_call_result_message = {
                        role: "tool",
                        content: JSON.stringify({
                            'query_to_search': query,
                            'information_related_to_user_query': relatedInfo
                        }),
                        tool_call_id: response.choices[0].message.tool_calls[0].id
                    };


                    // TODO make secure!!! Should not be in code!!!
                    const OPENAI_API_KEY = "sk-svcacct-JHSMzMYNZRVwWuQk3kJ3d0K0F3EuJZP7XbCoI9lB6A6Q6zxbzL4F7PSjumV923F1uMqitGWgjuFV-sDsT3BlbkFJ2YGDJYbL73J-FXGLAZf_DgLACHHlJgH8OiWDTOnXPKyIjtCGUdPALJ3e4g5iIigyHoceAjm_yVgKGbcA";

                    // TODO half of these are string for no reason?
                    let gptRequest = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + OPENAI_API_KEY
                        },
                        body: JSON.stringify({
                            'model': 'gpt-4o-mini',
                            'messages': [
                                {
                                    'role': 'system',
                                    'content': 'You are a helpful assistant.'
                                },
                                {
                                    'role': 'user',
                                    'content': query
                                },
                                response.choices[0].message,
                                function_call_result_message
                            ],
                            'tools': [
                                {
                                    'type': 'function',
                                    'strict': true,
                                    'function': {
                                        'name': 'search_for_information',
                                        'description': 'Call this to search online for information related to the user\'s query',
                                        'parameters': {
                                            'type': 'object',
                                            'properties': {
                                                'query_to_search': {
                                                    'type': 'string',
                                                    'description': 'A query that will be searched online for relevant information',
                                                },
                                            },
                                            'required': ['query_to_search'],
                                            'additionalProperties': false,
                                        },
                                    }
                                }
                            ],
                            'tool_choice': 'none',
                        })
                    };

                    fetch('https://api.openai.com/v1/chat/completions', gptRequest)
                            .then((response) => response.json())
                            .then(function(data) {
                                console.log(data);

                            });

                });
    }

    // TODO put button in form? I think this is better practice?
    return (
        <>
            <ul style={{ minWidth: "700px" }}>
                <li>Current URL: {currentURL}</li>
                <li>Current Time: {new Date().toLocaleTimeString()}</li>
            </ul>
            {/*
            <button
                onClick={() => setCount(count + 1)}
                style={{ marginRight: "5px" }}
            >
                count up
            </button>
            <button onClick={changeBackground}>change background</button>
            */}
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" onClick={(_) => handleUserQuery(queryText)}>Query</button>
            <button onClick={authenticationButton}>Authentication</button>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
