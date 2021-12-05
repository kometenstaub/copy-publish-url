import { App, TFile, PopoverSuggest } from 'obsidian';
import type CopyPublishUrlPlugin from './main';

export default class FileSuggester extends PopoverSuggest<TFile> {
    app: App;
    plugin: CopyPublishUrlPlugin;

    constructor(app: App, plugin: CopyPublishUrlPlugin) {
        super(app);
        this.app = app;
        this.plugin = plugin;
    }
    getSuggestions() {
        this.app.vault.getMarkdownFiles();
    }

    renderSuggestion(file: TFile, el: HTMLElement) {
        el.appendText(file.name);
    }

    async selectSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent) {
        this.plugin.settings.publishPath = file.path;
        await this.plugin.saveSettings();
    }
}
