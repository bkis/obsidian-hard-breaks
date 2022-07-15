# Obsidian Hard Breaks Plugin <!-- omit in toc -->

A plugin for [Obsidian](https://obsidian.md/) that brings automatic [*hard* line breaks](https://spec.commonmark.org/0.17/#hard-line-breaks) (while writing) and adds an editor command to replace all [*soft* line breaks](https://spec.commonmark.org/0.17/#soft-line-breaks) in a document with hard line breaks.

- [Do I need this plugin?](#do-i-need-this-plugin)
- [What are soft vs. hard line breaks?](#what-are-soft-vs-hard-line-breaks)
- [Why automatic hard line breaks?](#why-automatic-hard-line-breaks)
- [Installation](#installation)
- [Known Issues](#known-issues)
- [Development](#development)
- [Acknowledgements](#acknowledgements)



## Do I need this plugin?

Maybe. Maybe not. If you already know the [difference between soft and hard line breaks in Markdown](#what-are-soft-vs-hard-line-breaks), jump right to "[Why automatic hard line breaks?](#why-automatic-hard-line-breaks)" to understand the rationale of this plugin.

Long story short: If you...

- ... need actual line breaks (e.g. for writing Poems)-
- ... never use *soft* line breaks in Obsidian (because [why should you?](#why-automatic-hard-line-breaks))
- ... don't want to type *hard* line breaks manually but still want portable Markdown documents

..., you might linke this.


## What are soft vs. hard line breaks?

In Markdown, a simple line break in the Markdown source is considered a [*soft line break*](https://spec.commonmark.org/0.17/#soft-line-breaks). When parsing the Markdown to HTML, it will be parsed as a whitespace character or, again, a normal line break (which makes no difference in HTML). See this example:

```md
foo
bar
```

... will be parsed to one of these (which are the same, because any spaces in HTML will be rendered as one single whitespace):

```html
<p>foo bar</p>

<p>foo
bar</p>
```

For a common text flow with paragraphs, this is fine. But sometimes you need a line break without breaking the whole paragraph. This is what [*hard line breaks*](https://spec.commonmark.org/0.17/#hard-line-breaks) are for. In Markdown, *hard* line breaks are line breaks that are preceded by two whitespace characters (`  `). See this example (select the text to see the whitespaces):

```md
foo  
bar
```

This will be parsed to:

```html
<p>foo<br/>bar</p>
```

... with an *actual* line break.


## Why automatic hard line breaks?

Why should one use *soft* line breaks at all? They don't make any difference in how the document is parsed/rendered. There is only one reason to use them (prove me wrong!): Manually wrapping paragraphs in Markdown source text. This *might* be desirable in an environment where long lines aren't wrapped automatically (e.g. in a shell) or where the editor is so wide that the long lines become hard to read.

But Obsidian is **not** such an environment. It wraps text. The editor has a nice, reduced width. **There is no need for soft line breaks in Obsidian.**

Obsidian has a setting called "Strict line breaks". If you turn it off, it makes *soft* line breaks visible as actual line breaks in "Reading Mode". It renders them as if they were *hard* line breaks. That's a nice feature for its convenience, but try giving the Haiku you wrote in Obsidian without manually adding *hard* line breaks ...

```md
An ancient pond!
With a sound from the water
Of the frog as it plunges in.
```

... to a friend who uses a software that strictly obeys the [CommonMark specification](https://spec.commonmark.org) (like Obsidian with "Strict line breaks" in "Reading View"). Your Haiku will look like this:

> An ancient pond! With a sound from the water Of the frog as it plunges in.

You need hard line breaks to write actual Markdown in such cases. But typing two whitespaces at the end of each line just to get an actual line break isn't fun for everyone. Especially if you *never need soft line breaks* for the reasons mentioned above.


## Installation

There are two ways:

- Using [Obsidians community plugin browser](https://obsidian.md/plugins) (recommended!)
- Installing the plugin manually (why though?): Unpack the downloaded archive file into Obsidians plugin directory. Warning: You won't get automatic updates this way!


## Known Issues

- With "Auto Hard Breaks" turned on, hard line breaks are added in place of *every* soft line break (except on empty lines) - *even inside of code blocks* and HTML code! This is not a huge problem, but it's also not pretty.


## Development

First, install the dependencies with

```bash
npm i
```

Then, you can compile the plugin with:

```bash
npm run build
```

This will create a `main.js` file in the project root, which is the entry point of the plugin.

For testing it, the `main.js` and the `manifest.json` have to be placed in a `.obsidian/plugins/hard-breaks/` folder (within your vault) to be picked up by Obsidian on the next start.


## Acknowledgements

Thanks to [THeK3nger](https://github.com/THeK3nger) for the nice [project template](https://github.com/THeK3nger/obsidian-plugin-template). It made things easier.