/* 
 * Must be in a seperate file as contentScript 
 * can't import from background due to missing APIs.
 */
export enum MessageMode {
    Authentication,
    Testing,
    FactCheck,
    AddingToDatabase,
}

// Message handlers should return a boolean with value
// true if and only if they will call sendResponse asynchronously.
export type MessageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean;

export type FactCheckData = {
    triggeringText: Set<string>,
} & FactCheckResultEntry['entity']

export type FactCheckIndex = Map<number, FactCheckData>;

export type FactCheckResults = {
    status: 'success',
    data: {
        claim: string,
        responses: FactCheckResultEntry[]
    }[],
} | {
    status: 'error',
    message: string,
};

export type FactCheckResultEntry = {
    distance: number,
    entity: {
        claim: string,
        author_name: string,
        author_url: string,
        review: string,
        url: string,
    },
    id: number,
};

export type WebsiteInteractionEntry = {
    user_id: number,
    url: string,
    duration: number,
    date: number,
    clicks: number
};
