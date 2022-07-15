import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface HardBreaksPluginSettings {
  format: string
  autoHardBreaks: boolean
}

const DEFAULT_SETTINGS: HardBreaksPluginSettings = {
	format: 'spaces',
  autoHardBreaks: true
}

// hard line breaks options
const HB: Record<string, any> = {
  spaces: {
    literal: '  ',
    label: 'Double Whitespace (recommended)'
  },
  backslash: {
    literal: '\\',
    label: 'Backslash',
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
    await this.loadSettings()

    // add settings tab to Obsidian settings panel
    this.addSettingTab(new HardBreaksPluginSettingsTab(this.app, this))

		// add command to replace all soft breaks in the current document with hard breaks
		this.addCommand({
			id: 'replace-all-soft-breaks',
			name: 'Replace all soft line breaks with hard ones',
			editorCallback: (editor: Editor, view: MarkdownView) => {
        editor.setValue(this.replaceSoftBreaks(editor.getValue()))
			}
		})

    // register editor change event...
    // it would be nice to only register this event listener if the
    // "auto replace" setting is activated - unfortunately the Obsidian API
    // doesn't seem to offer an event for a change in the plugin settings :(
    this.registerEvent(this.app.workspace.on('editor-change', (editor, md) => {
      this.settings.autoHardBreaks && this.processEditorChange(editor)
    }))
  }

  /**
   * Checks if the last change in the editor qualifies for a line break
   * replacing operation. If so, the previous line will be altered accordingly. 
   * @param editor The editor instance the plugin got from the change event
   * @returns sweet FA
   */
  processEditorChange(editor: Editor): void {
    // check if this event was triggered by this plugin itself
    if (this.lastChangeByPlugin){
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
class HardBreaksPluginSettingsTab extends PluginSettingTab {
  plugin: HardBreaksPlugin

  constructor(app: App, plugin: HardBreaksPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this;
    const commandHint = 'Hint: This plugin adds an editor command to replace all ' +
                        'existing soft line breaks in a document with hard line breaks.'
    containerEl.empty();
    containerEl.createEl('h3', {text: 'Hard Breaks'});
    containerEl.createEl('small', {text: commandHint});

    const settings = this.plugin.settings;

    // automatic soft line break replacement
    new Setting(containerEl)
      .setName('Auto Hard Breaks')
      .setDesc('Automatically replace soft line breaks while writing')
      .addToggle(t => t
        .setValue(settings.autoHardBreaks)
        .onChange(async (value: boolean) => {
          settings.autoHardBreaks = value
          await this.plugin.saveSettings()
      })
    )
    
    // hard line break format setting
    new Setting(containerEl)
      .setName('Hard Break Format')
      .setDesc('The type of Markdown notation to use for hard breaks')
      .addDropdown((dd) => {
        Object.keys(HB).forEach((k: string) => 
          dd.addOption(k, HB[k].label)
        )
        dd.setValue(settings.format)
        dd.onChange(async (value: string) => {
          settings.format = value
          await this.plugin.saveSettings()
        })
      }
    )

  }
}
