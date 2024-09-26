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
