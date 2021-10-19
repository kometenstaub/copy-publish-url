import { Command, Plugin } from 'obsidian';
import type { CopyPublishUrlSettings } from './interfaces';
import CopyPublishUrlSettingTab from './settings';

const DEFAULT_SETTINGS: CopyPublishUrlSettings = {
    homeNote: '',
    publishPath: '',
};

export default class CopyPublishUrlPlugin extends Plugin {
    //@ts-ignore
    settings: CopyPublishUrlSettings;

    async copyPublishUrl(path: string) {
        let url = this.settings.publishPath;
        let publishedNote = path.slice(0, -3);
        // the index note is at the root level of the publish vault
        if (publishedNote === this.settings.homeNote) {
            if (publishedNote.includes('/')) {
                //@ts-ignore
                publishedNote = publishedNote.split('/').last();
            }
        }
        let encodedPath = encodeURIComponent(publishedNote);
        encodedPath = encodedPath.replace(/%20/g, '+');
        url += encodedPath;
        await navigator.clipboard.writeText(url);
    }

    async onload() {
        console.log('loading Copy Publish URL plugin');

        await this.loadSettings();

        this.addCommand({
            id: 'copy-publish-url',
            name: 'Copy URL',
            callback: async () => {
                const tfile = this.app.workspace.getActiveFile();
                if (tfile !== null) {
                    const path = tfile.path;
                    await this.copyPublishUrl(path);
                }
            },
        });

        this.addSettingTab(new CopyPublishUrlSettingTab(this.app, this));
    }

    onunload() {
        console.log('unloading Copy Publish URL plugin');
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
