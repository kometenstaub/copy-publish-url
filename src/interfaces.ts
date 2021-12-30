import type { Command } from 'obsidian';

export interface CopyPublishUrlSettings {
    homeNote: string;
    publishPath: string;
    enableContext: boolean;
    enableOpenUrl: boolean;
    enableGithub: boolean;
    remoteUrl: string;
    branch: string;
}

declare module 'obsidian' {
    interface App {
        commands: {
            removeCommand(id: string): void;
        };
    }
}
