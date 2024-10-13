/* 
 * Must be in a seperate file as contentScript 
 * can't import from background due to missing APIs.
 */
export enum MessageMode {
    Authentication,
    Testing,
    FactCheck,
    AddingToDatabase,
    OpenOptionsPage,
    LogClick,
    UrlChange,
    DeleteUserData,
}

// Message handlers should return a boolean with value
// true if and only if they will call sendResponse asynchronously.
export type MessageHandler = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean;

export type FactCheckData = {
    claim: string,
    triggers: {
        text: string,
        url: string,
        earliest_trigger_date: number,
    }[],
    author_name: string,
    author_url: string,
    review: string,
    url: string,
}

export type FactCheckIndex = Map<number, FactCheckData>;

export type WebsiteInteractionEntry = {
    url: string,
    duration: number,
    date: number,
    clicks: number
    leaning: string | null,
};

export type APIResponse<T> = {
    status: 'success',
    data: T
} | {
    status: 'error',
    message: string,
}

export const isDeveloperMode: boolean = false;
