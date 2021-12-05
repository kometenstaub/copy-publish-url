import type {Command} from "obsidian";

export interface CopyPublishUrlSettings {
    homeNote: string;
    publishPath: string;
    enableContext: boolean;
    enableOpenUrl: boolean;
}

declare module 'obsidian' {
    interface App {
        commands: {
            removeCommand(id: string): void;
        }
    }
}