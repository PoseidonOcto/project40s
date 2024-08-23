import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Style from "./style";




const Options = () => {
    const [queryText, setQueryText] = useState<string>();
    const [queryResult, setQueryResult] = useState<string>();
    const [color, setColor] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [like, setLike] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Restores select box and checkbox state using the preferences
        // stored in chrome.storage.
        chrome.storage.sync.get(
            {
                favoriteColor: "red",
                likesColor: true,
            },
            (items) => {
                setColor(items.favoriteColor);
                setLike(items.likesColor);
            }
        );
    }, []);

    const saveOptions = () => {
        // Saves options to chrome.storage.sync.
        chrome.storage.sync.set(
            {
                favoriteColor: color,
                likesColor: like,
            },
            () => {
                // Update status to let user know options were saved.
                setStatus("Options saved.");
                const id = setTimeout(() => {
                    setStatus("");
                }, 1000);
                return () => clearTimeout(id);
            }
        );
    };
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
                        setQueryResult(data.choices[0].message.content);
                        setIsLoading(false);
                    });

            });
    }

    return (
        <>
            <Style/>
            <div>
                Favorite color: <select
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                >
                    <option value="red">red</option>
                    <option value="green">green</option>
                    <option value="blue">blue</option>
                    <option value="yellow">yellow</option>
                </select>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={like}
                        onChange={(event) => setLike(event.target.checked)}
                    />
                    I like colors.
                </label>
            </div>
            <div>{status}</div>
            <button onClick={saveOptions}>Save</button>
            <input name="query" onChange={(e) => setQueryText(e.target.value)}/>
            <button type="submit" className={isLoading ? "loadingButton" : "notLoadingButton"} onClick={(_) => handleUserQuery(queryText)}>Query</button>
            {isLoading && <div className="loadingIcon">bruh</div>}
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
