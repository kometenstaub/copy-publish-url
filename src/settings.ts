import { App, PluginSettingTab, Setting } from 'obsidian';
import type CopyPublishUrlPlugin from './main';
//import FileSuggester from './suggester'

export default class CopyPublishUrlSettingTab extends PluginSettingTab {
    plugin: CopyPublishUrlPlugin;

    constructor(app: App, plugin: CopyPublishUrlPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const { settings } = this.plugin;

        containerEl.empty();

        containerEl.createEl('h2', {
            text: 'Copy Publish URL Settings',
        });

        // keys for YAML
        new Setting(containerEl)
            .setName('Index note of your published vault')
            .setDesc(
                'Please use the relative path from the vault root. You do not need to include the .md extension.'
            )
            .addText((text) => {
                text.setPlaceholder('Index')
                    .setValue(settings.homeNote)
                    .onChange(async (value) => {
                        //const modal =  new FileSuggester(this.app, this.plugin)
                        //return modal.open()
                        if (value.trim().slice(-3) === '.md') {
                            settings.homeNote = value.trim().slice(0, -3);
                        } else {
                            settings.homeNote = value.trim();
                        }
                        await this.plugin.saveSettings();
                    });
            });
        new Setting(containerEl)
            .setName('Publish base path')
            .setDesc('Please enter the base path of your publish site.')
            .addText((text) => {
                text.setPlaceholder('https://publish.obsidian.md/help/')
                    .setValue(settings.publishPath)
                    .onChange(async (value) => {
                        if (value.trim().slice(-1) === '/') {
                            settings.publishPath = value.trim();
                        } else {
                            settings.publishPath = value.trim() + '/';
                        }
                        await this.plugin.saveSettings();
                    });
            });
        new Setting(containerEl)
            .setName('Show in file menu')
            .setDesc(
                'Enable it to show the Copy Publish URL action in the file menu.'
            )
            .addToggle((toggle) => {
                toggle.setValue(settings.enableContext);
                toggle.onChange(async (value) => {
                    settings.enableContext = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        this.plugin.fileMenuEvent(true);
                    } else {
                        this.plugin.fileMenuEvent(false);
                    }
                });
            });

        new Setting(containerEl)
            .setName('Open current note in browser')
            .setDesc(
                'Enable it to get a command to open the current note on the Obsidian Publish site.'
            )
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.enableOpenUrl);
                toggle.onChange(async (value) => {
                    this.plugin.settings.enableOpenUrl = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        this.plugin.addCommand(this.plugin.returnOpenCommand());
                    } else {
                        this.app.commands.removeCommand(
                            `${this.plugin.manifest.id}:open-publish-url`
                        );
                    }
                });
            });

        new Setting(containerEl)
            .setName('GitHub History Command')
            .setDesc(
                'Enable it to add the command for opening the GitHub commit history of the current note.'
            )
            .addToggle((toggle) => {
                toggle.setValue(settings.enableGithub);
                toggle.onChange(async (value) => {
                    settings.enableGithub = value;
                    await this.plugin.saveSettings();
                    this.display()
                });
            });

        if (this.plugin.settings.enableGithub) {
            new Setting(containerEl)
                .setName('GitHub repository URL')
                .setDesc('Please enter the URL of your GitHub repository.')
                .addText((text) => {
                    text.setPlaceholder('https://github.com/obsidian-community/obsidian-hub')
                        .setValue(settings.remoteUrl)
                        .onChange(async (value) => {
                            if (value.trim().slice(-1) === '/') {
                                settings.remoteUrl = value.trim();
                            } else {
                                settings.remoteUrl = value.trim() + '/';
                            }
                            await this.plugin.saveSettings();
                        });
                });

            new Setting(containerEl)
                .setName('Branch name')
                .setDesc('Please enter the branch name.')
                .addText((text) => {
                    text.setPlaceholder('main')
                        .setValue(settings.branch)
                        .onChange(async (value) => {
                            settings.branch = value.trim();
                            await this.plugin.saveSettings();
                        });
                });

        }
    }
}
