export interface PopupData {
    title: string;
    message: string;
}

export interface ContentScriptResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export type EventListener = (event: Event) => void;