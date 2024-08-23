import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Style from "./style";




const Options = () => {
    const [queryText, setQueryText] = useState<string>();
    const [queryResult, setQueryResult] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const handleUserQuery = (query: string | undefined) => {
        if (query === undefined) {
            return;
        }
        setIsLoading(true);
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

    // !!!! NOTE !!!! This uses outdated, very messy code for querying chatGPT. 
    // The updated code can be seen in './popup.tsx'.
    // This code was only copied over to let another developer work on this page
    // while the code was being fixed. Obviously, the code for querying chatGPT
    // will only be in one place soon.
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
                        setQueryResult(data.choices[0].message.content);
                        setIsLoading(false);
                    });

            });
    }

    return (
        <>
            <Style/>
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} onClick={(_) => handleUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon"></div>}
            <p>{queryResult}</p>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
