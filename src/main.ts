import {
    App,
    Command,
    Menu,
    Notice,
    Plugin,
    TAbstractFile,
    TFile,
} from 'obsidian';
import type { CopyPublishUrlSettings } from './interfaces';
import CopyPublishUrlSettingTab from './settings';

const DEFAULT_SETTINGS: CopyPublishUrlSettings = {
    homeNote: '',
    publishPath: '',
    enableContext: false,
    enableOpenUrl: true,
    enableGithub: false,
    remoteUrl: '',
    branch: 'main',
};

function publishState(app: App, file: TFile): boolean {
    const fileCache = app.metadataCache.getFileCache(file);
    const frontMatter = fileCache?.frontmatter;
    // the note has frontmatter
    if (frontMatter !== undefined) {
        try {
            // does it have a publish key-value pair
            const state: boolean | undefined = frontMatter.publish;
            if (state === false) {
                return false;
            } else {
                return true;
            }
        } catch {
            return true;
        }
    } else {
        return true;
    }
}

export default class CopyPublishUrlPlugin extends Plugin {
    //@ts-ignore
    settings: CopyPublishUrlSettings;

    getPublishUrl(path: string): string {
        let url = this.settings.publishPath;
        let publishedNote = path.slice(0, -3);
        // the index note is at the root level of the publish vault
        if (publishedNote === this.settings.homeNote) {
            if (publishedNote.includes('/')) {
                //@ts-ignore
                publishedNote = publishedNote.split('/').last();
            }
        }
        url = encodeURI(url + publishedNote);
        url = url.replace(/%20/g, '+');
        return url;
    }

    async copyPublishUrl(path: string): Promise<void> {
        const url = this.getPublishUrl(path);
        await navigator.clipboard.writeText(url);
        new Notice('Publish Url copied to your clipboard');
    }

    openPublishUrl(path: string): void {
        const url = this.getPublishUrl(path);
        window.open(url);
    }

    openGithubHistory(path: string): void {
        const baseUrl = this.settings.remoteUrl;
        const remoteUrl = baseUrl + `commits/${this.settings.branch}/${path}`;
        const encodedRemoteUrl = encodeURI(remoteUrl);
        window.open(encodedRemoteUrl);
    }

    giveCallback(
        fn: (path: string) => Promise<void> | void
    ): Command['checkCallback'] {
        return (checking: boolean): boolean => {
            const tfile: TFile | null = this.app.workspace.getActiveFile();
            if (tfile !== null) {
                if (!checking) {
                    (async () => {
                        const state = publishState(this.app, tfile);
                        if (!state) {
                            new Notice(
                                'This note contains the publish: false flag.'
                            );
                            return;
                        }
                        const path = tfile.path;
                        await fn(path);
                    })();
                }
                return true;
            } else {
                return false;
            }
        };
    }

    giveGithubCallback(
        fn: (path: string) => Promise<void> | void
    ): Command['checkCallback'] {
        return (checking: boolean): boolean => {
            const tfile: TFile | null = this.app.workspace.getActiveFile();
            if (tfile !== null) {
                if (!checking) {
                    (async () => {
                        // possible condition check could be added later; if condition not met, return;
                        const path = tfile.path;
                        await fn(path);
                    })();
                }
                return true;
            } else {
                return false;
            }
        };
    }

    returnOpenCommand = (): Command => {
        return {
            id: 'open-publish-url',
            name: 'Open Publish URL in browser',
            checkCallback: this.giveCallback(this.openPublishUrl.bind(this)),
        };
    };

    returnCopyCommand = (): Command => {
        return {
            id: 'copy-publish-url',
            name: 'Copy Publish URL',
            checkCallback: this.giveCallback(this.copyPublishUrl.bind(this)),
        };
    };

    returnGithubOpenCommand = (): Command => {
        return {
            id: 'open-git-history',
            name: 'Open Commit History on GitHub',
            checkCallback: this.giveGithubCallback(
                this.openGithubHistory.bind(this)
            ),
        };
    };

    /**
     * the same function needs to be passed, so that the reference is the same,
     * so that `.off` works; otherwise a new function reference would be generated
     */
    fileMenuCallbackFunc = (
        menu: Menu,
        file: TAbstractFile,
        source: string
    ) => {
        if (file instanceof TFile) {
            const publish = publishState(this.app, file);
            if (!publish) {
                return false;
            } else {
                menu.addSeparator();
                const path = file.path;
                menu.addItem((item) => {
                    item.setTitle('Copy Publish URL')
                        .setIcon('link')
                        .onClick(async () => {
                            await this.copyPublishUrl(path);
                        });
                });
            }
            menu.addSeparator();
        }
    };

    fileMenuEvent(toggle: boolean) {
        if (toggle) {
            this.registerEvent(
                this.app.workspace.on('file-menu', this.fileMenuCallbackFunc)
            );
        } else {
            this.app.workspace.off('file-menu', this.fileMenuCallbackFunc);
        }
    }

    async onload() {
        console.log('loading Copy Publish URL plugin');

        await this.loadSettings();

        this.addCommand(this.returnCopyCommand());

        if (this.settings.enableOpenUrl) {
            this.addCommand(this.returnOpenCommand());
        }

        if (this.settings.enableContext) {
            this.fileMenuEvent(true);
        }

        if (this.settings.enableGithub) {
            this.addCommand(this.returnGithubOpenCommand());
        }

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
