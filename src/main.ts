import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {unified} from 'unified';
import {selectAll} from 'unist-util-select';
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';

const selectNodes = selectAll;

const range = (start: number, stop: number, step: number = 1) =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step);

interface HardBreaksPluginSettings {
  hardBreakFormat: '  ' | '\\';
}

const DEFAULT_SETTINGS: HardBreaksPluginSettings = {
	hardBreakFormat: '  '
}

/**
 * Class representing the plugin
 */
export default class HardBreaksPlugin extends Plugin {

  settings: HardBreaksPluginSettings;

  async onload() {
    // load pluging settings
    await this.loadSettings();

    // add settings tab to Obsidian settings panel
    this.addSettingTab(new HardBreaksPluginSettingsTab(this.app, this));

		// add command to replace all soft breaks in the current document with hard breaks
		this.addCommand({
			id: 'replace-all-soft-breaks',
			name: 'Force hard line breaks in current document',
			editorCallback: (editor: Editor, view: MarkdownView) => {
        this.forceHardBreaks(editor);
			}
		})

  }

  forceHardBreaks(editor: Editor){
    /**
     * It would be much more elegant (and easy!) to use Obsidian editor's replaceRange()
     * function to replace each range that represents a target text node, but that'd
     * result in multiple editor changes. So if the user wanted to undo what the command
     * did, they'd have to undo a change for every text node we inserted hard breaks
     * into. The solution below is more clunky (and probably more costly), but only
     * created a single change event.
     * A better solution has yet to be found...
     */
    let text = editor.getValue();
    this.getTextRanges(text).forEach(range => {
      const replacement = text
        .substring(range.from + this.settings.hardBreakFormat.length, range.to)
        .replace(
          /[ \t]*(?=\r\n|\r|\n)/gm,
          this.settings.hardBreakFormat
        );
      text = text.substring(0, range.from + this.settings.hardBreakFormat.length)
        + replacement
        + text.substring(range.to);
    });
    editor.setValue(text);
  }

  getTextRanges(md: string){
    return selectNodes(
      'root > paragraph > text, root > blockquote > paragraph > text',
      unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkGfm)
        .parse(md)
    )
    .filter(n => n.position.start.line < n.position.end.line)
    .map(n => ({
      'from': n.position.start.offset,
      'to': n.position.end.offset
    }))
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

  plugin: HardBreaksPlugin;

  constructor(app: App, plugin: HardBreaksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl(
      'h3',
      {text: 'Hard Breaks'}
    );
    containerEl.createEl(
      'small',
      {text: 'Hint: Access this plugin\'s command via the editor\'s command palette.'}
    );

    const settings = this.plugin.settings;
    
    // hard line break format setting
    new Setting(containerEl)
      .setName('Hard Line Break Format')
      .setDesc('The type of Markdown notation to use for hard line breaks')
      .addDropdown(dropdown => dropdown
        .addOptions({
          '  ': 'Double Whitespace',
          '\\': 'Backslash'
        })
        .setValue(settings.hardBreakFormat)
        .onChange(async (value: HardBreaksPluginSettings["hardBreakFormat"]) => {
          settings.hardBreakFormat = value;
          await this.plugin.saveSettings();
        })
      );
  }

}
