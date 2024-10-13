import sentencize from "@stdlib/nlp-sentencize"
import { FactCheckIndex2, APIResponse } from "./types"


export const DATA_USAGE_MESSAGE = (isHtml: boolean) => "The 'Stop the cap' extension will " +
    "scrape your screen for text, " +
    "track the websites you visit, and the duration you spend on these websites. " +
    "All of this data may be stored in our database. " +
    (isHtml ? "<strong>" : "") + 
    "Every bit of data we store is displayed to you on the dashboard. " +
    "No user data is ever provided to any third parties." +
    (isHtml ? "</strong>" : "")

/*
 * Queue related code is written under the assumption
 * that there is only one thread handling this code.
 */
export class TaskQueue {
    tasks: (() => Promise<void>)[];
    isRunning: boolean

    constructor() {
        this.tasks = [];
        this.isRunning = false;
    }

    async runQueue(): Promise<void> {
        console.assert(!this.isRunning);
        this.isRunning = true;
        while (true) {
            if (this.tasks.length === 0) {
                break;
            }

            const nextTask = this.tasks.shift();
            await nextTask!();
        }
        this.isRunning = false;
    }

    enqueue(task: () => Promise<void>) {
        this.tasks.push(task);
        if (!this.isRunning) {
            this.runQueue();
        }
    }
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Splitting into sentences isn't necessarily the best way of
// separating into seperate claims, as claims could be split
// over sentences.
export const getClaims = (text: string): string[] => {
    const paragraph = text.split("\n")
        .filter(hasEnoughWords)
        .join(". ");

    return sentencize(paragraph).filter(hasEnoughWords);
}

const hasEnoughWords = (text: string): boolean => {
    const smallestSentenceLength = 5;
    return text.trim().split(/\s+/).length >= smallestSentenceLength;
}

export async function fetchFromAPI<T>(endpoint: string, data: Object): Promise<APIResponse<T>> {
    let results;
    try {
        const url = `https://project40s-embedding-server-production.up.railway.app/${endpoint}`;
        const response =  await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        results = await response.json();
    } catch (error) {
        return {
            status: 'error',
            message: (error as Error).message
        }
    }

    if (results.status != 'success') {
        return results;
    }

    return results;
}
