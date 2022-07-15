import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

type HardBreakFormat = 'spaces' | 'backslash'

interface HardBreaksPluginSettings {
  format: HardBreakFormat
}

const DEFAULT_SETTINGS: HardBreaksPluginSettings = {
	format: 'spaces'
}

// hard line breaks profiles
const HB = {
  spaces: {
    label: 'Double Whitespace',
    literal: '  '
  },
  backslash: {
    label: 'Backslash',
    literal: '\\'
  }
}

// pattern for matching single soft line breaks globally
const SB_G: RegExp = /(?<!(?:  |[^\\]\\|\n))$/gm

/**
 * Class representing the plugin
 */
export default class HardBreaksPlugin extends Plugin {

  settings: HardBreaksPluginSettings
  lastChangeByPlugin: boolean = false

  async onload() {
    // console.log('hard-breaks plugin loading...')

    // load pluging settings
    await this.loadSettings();

    // add settings tab to Obsidian settings panel
    this.addSettingTab(new PluginSettingsTab(this.app, this))

		// add command to replace all soft breaks in the current document with hard breaks
		this.addCommand({
			id: 'replace-all-soft-breaks',
			name: 'Replace all soft breaks with hard breaks',
			editorCallback: (editor: Editor, view: MarkdownView) => {
        editor.setValue(this.replaceSoftBreaks(editor.getValue()))
			}
		});

    // register editor change event
    this.registerEvent(this.app.workspace.on('editor-change', (editor, markdownView) => {
      console.log("EDITOR CHANGE EVENT")
      // check if this event was triggered by this plugin itself
      if (this.lastChangeByPlugin){
        console.log('Last change was done by this plugin, exit')
        this.lastChangeByPlugin = false
        return
      }
      const cursor = editor.getCursor() // get current cursor position
      // check if the edit was a line break into a fresh line (not indented or prefixed)
      if (cursor && cursor.ch === 0 && cursor.line > 0){
        // get content of previous line
        let prevLine = editor.getLine(cursor.line - 1)
        // cancel if previous line is empty
        if (prevLine.length === 0) return
        // replace soft break with hard break
        prevLine = this.replaceSoftBreaks(prevLine)
        // remember that we are the ones changing the editor here
        this.lastChangeByPlugin = true
        editor.setLine(cursor.line - 1, prevLine)
      }
    }))
  }

  replaceSoftBreaks(input: string): string {
    return input.replace(
      SB_G,
      HB[this.settings.format].literal
    )
  }

  // onunload() {
  //   console.log('hard-breaks plugin unloading...');
  // }

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

    // This is just an example of a setting control
    new Setting(containerEl)
      .setName('Hard Break Format')
      .setDesc('The format of hard breaks to use')
      .addText((text) =>
        text.setValue(settings.format).onChange(async (value: HardBreakFormat) => {
          settings.format = value;
          await this.plugin.saveSettings();
        })
      );
  }
}
