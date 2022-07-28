import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {remark} from 'remark'
import remarkBreaks from 'remark-breaks'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'

interface HardBreaksPluginSettings {
  hardBreakFormat: string
}

const DEFAULT_SETTINGS: HardBreaksPluginSettings = {
	hardBreakFormat: '  '
}

/**
 * Class representing the plugin
 */
export default class HardBreaksPlugin extends Plugin {

  settings: HardBreaksPluginSettings

  async onload() {
    // console.log('hard-breaks plugin loading...')

    // load pluging settings
    await this.loadSettings()

    // add settings tab to Obsidian settings panel
    this.addSettingTab(new HardBreaksPluginSettingsTab(this.app, this))

		// add command to replace all soft breaks in the current document with hard breaks
		this.addCommand({
			id: 'replace-all-soft-breaks',
			name: 'Force hard line breaks in current document',
			editorCallback: (editor: Editor, view: MarkdownView) => {
        this.replaceBreaks(editor.getValue())
          .then(content => editor.setValue(content))
			}
		})

  }

  async replaceBreaks(input: string): Promise<string> {
    return await remark()
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkGfm)
        .use(remarkBreaks)
        .process(input)
        .then((doc) =>
          doc.value.toString()
          .replace(/\\$/gm, this.settings.hardBreakFormat)
        )
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
class HardBreaksPluginSettingsTab extends PluginSettingTab {
  plugin: HardBreaksPlugin

  constructor(app: App, plugin: HardBreaksPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this;
    const commandHint = 'Hint: This plugin adds a command to force hard line breaks ' +
                        'in the current document!'
    containerEl.empty();
    containerEl.createEl('h3', {text: 'Hard Breaks'});
    containerEl.createEl('small', {text: commandHint});

    const settings = this.plugin.settings;
    
    // hard line break format setting
    new Setting(containerEl)
      .setName('Hard Line Break Format')
      .setDesc('The type of Markdown notation to use for hard line breaks')
      .addDropdown((dd) => {
        dd.addOption('  ', 'Double Whitespace (recommended)')
        dd.addOption('\\', 'Backslash')
        dd.setValue(settings.hardBreakFormat)
        dd.onChange(async (value: string) => {
          settings.hardBreakFormat = value
          await this.plugin.saveSettings()
        })
      }
    )

  }
}
