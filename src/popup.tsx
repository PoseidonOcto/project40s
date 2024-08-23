import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";


// Attribution: Alot of this code is inspired by the offical ChatGPT manual that tells you how to do this stuff.

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

    const queryJina = async (query: string): Promise<string> => {
        // Encode the raw query into a URL-like format.
        const queryAsUrl = encodeURIComponent(query);

        // Search for related articles, and give to chatgpt.
        return fetch('https://s.jina.ai/' + queryAsUrl, {method: "GET",})
                .then((response) => response.text())
    }

    const queryChatGPT2 = async (query: string, prevMsgs: any, forceResearch: boolean): Promise<any> => {

        // TODO make secure!!! Should not be in code!!!
        const OPENAI_API_KEY = "sk-svcacct-JHSMzMYNZRVwWuQk3kJ3d0K0F3EuJZP7XbCoI9lB6A6Q6zxbzL4F7PSjumV923F1uMqitGWgjuFV-sDsT3BlbkFJ2YGDJYbL73J-FXGLAZf_DgLACHHlJgH8OiWDTOnXPKyIjtCGUdPALJ3e4g5iIigyHoceAjm_yVgKGbcA";

        const gptRequestBody: any = {
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
            ].concat(prevMsgs),
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
        };

        if (forceResearch) {
            gptRequestBody['tool_choice'] = {'type': 'function', 'function': {'name': 'search_for_information'}};
        }

        // TODO half of these are string for no reason?
        const gptRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + OPENAI_API_KEY
            },
            body: JSON.stringify(gptRequestBody)
        };
        console.log(gptRequestBody);

        return fetch('https://api.openai.com/v1/chat/completions', gptRequest)
                .then((response) => response.json())
    }



    const main2 = async (query: string | undefined): Promise<void> => {
        if (query === undefined) {
            return;
        }

        const previousMessages: any[] = [];

        // TODO: Could force the first request to do a tool call. In this casae, the response code needs to
        // handle the case: "finish_reason == 'stop' && 'we forced a tool call'"

        while (true) {
            const response = await queryChatGPT2(query, previousMessages, false);
            console.log(response);

            // Check if the conversation was too long for the context window
            if (response.choices[0].finish_reason === "length") {
                console.log("Error: The conversation was too long for the context window.");
                // Handle the error as needed, e.g., by truncating the conversation or asking for clarification
                break;
            } else if (response.choices[0].finish_reason === "content_filter") {
                // The model's output included copyrighted material (or similar)
                console.log("Error: The content was filtered due to policy violations.");
                // Handle the error as needed, e.g., by modifying the request or notifying the user
                break;
            } else if (response.choices[0].finish_reason === "tool_calls") {
                // The model has made a tool_call
                console.log("Model made a tool call.");
                // Your code to handle tool calls
                const toolCall = response.choices[0].message.tool_calls[0];
                const args = JSON.parse(toolCall.function.arguments);

                const jinaQuery = args.query_to_search;
                const sourceInfo = await queryJina(jinaQuery);

                // Create a message containing the result of the function call
                // TODO: Uneeded strings
                const function_call_result_message = {
                    role: "tool",
                    content: JSON.stringify({
                        'query_to_search': query,
                        'information_related_to_user_query': sourceInfo
                    }),
                    tool_call_id: response.choices[0].message.tool_calls[0].id
                };

                previousMessages.push(response.choices[0].message);
                previousMessages.push(function_call_result_message);

            } else if (response.choices[0].finish_reason === "stop") {
                // The model was just responding directly to the user
                console.log("Model responded directly to the user.");
                console.log(response);
                break;
            } else {
                // Catch any other case, this is unexpected
                console.log("Unexpected finish_reason:", response.choices[0].message.finish_reason);
                // Handle unexpected cases as needed
                break;
            }
        }
    }



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
            <button type="submit" onClick={(_) => main2(queryText)}>Query</button>
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
