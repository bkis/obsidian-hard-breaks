import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

/**
 * Interface defining the plugins settings
 */
interface HardBreaksPluginSettings {
  hardBreakFormat: string;
}

// default plugin settings
const DEFAULT_SETTINGS: HardBreaksPluginSettings = {
	hardBreakFormat: '  '
}

// pattern for recognizing soft line breaks
const LB = / *(?<!(\\|\n))\n/g

/**
 * Class representing the plugin
 */
export default class HardBreaksPlugin extends Plugin {

  settings: HardBreaksPluginSettings;

  async onload() {
    console.log('hard-breaks plugin loading...');

    // load pluging settings
    await this.loadSettings();

    // add settings tab to Obsidian settings panel
    this.addSettingTab(new PluginSettingsTab(this.app, this));

		// add command to replace all soft breaks in the current document with hard breaks
		this.addCommand({
			id: 'replace-all-soft-breaks',
			name: 'Replace all soft breaks with hard breaks',
			editorCallback: (editor: Editor, view: MarkdownView) => {
        // if nothing is selected, select all text in the editor
        editor.somethingSelected() || this.selectAll(editor)
        // replace line breaks in selection
				editor.replaceSelection(
          editor.getSelection().replace(LB, `${this.settings.hardBreakFormat}\n`)
        )
			}
		});
  }

  /**
   * Selects all text in the editor
   * @param editor editor instance
   */
  selectAll(editor: Editor) {
    editor.setSelection(
      { line: 0, ch: 0 },
      {
        line: editor.lastLine(),
        ch: editor.getLine(editor.lastLine()).length - 1
      }
    )
  }

  onunload() {
    console.log('hard-breaks plugin unloading...');
  }

  async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


/**
 * Class representing plugin settings tab
 */
class PluginSettingsTab extends PluginSettingTab {
  plugin: HardBreaksPlugin;

  constructor(app: App, plugin: HardBreaksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    const settings = this.plugin.settings;

    // This is just an example of a setting controll.
    new Setting(containerEl)
      .setName('Hard Break Format')
      .setDesc('The format of hard breaks to use')
      .addText((text) =>
        text.setValue(String(settings.hardBreakFormat)).onChange(async (value) => {
          settings.hardBreakFormat = String(value);
          await this.plugin.saveSettings();
        })
      );
  }
}
