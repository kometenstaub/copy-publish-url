export interface CopyPublishUrlSettings {
    homeNote: string;
    publishPath: string;
    enableContext: boolean;
}

declare module 'obsidian' {
    interface App {
        plugins: {
            disablePlugin(id: string): Promise<void>;
            enablePlugin(id: string): Promise<void>;
        };
        setting: {
            openTabById(id: string): void;
        };
    }
}
