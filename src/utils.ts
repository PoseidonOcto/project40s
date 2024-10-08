import sentencize from "@stdlib/nlp-sentencize"

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

