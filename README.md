# CodeKit

[![VS Marketplace](https://vsmarketplacebadges.dev/version-short/zhanwangfeng.code-kit-for-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode)
[![Installs](https://vsmarketplacebadges.dev/installs/zhanwangfeng.code-kit-for-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode)

**English** | [中文](README.zh-CN.md)

A VSCode extension toolbox: collect common dev utilities into the sidebar, always within reach.

- GitHub: https://github.com/zhanwangfeng/CodeKitForVSCode
- VSCode: https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode

## Quick Start

1. Click the CodeKit icon in the Activity Bar to open the Tools list
2. Click any tool (e.g. JSON Parser) to open a WebView tab in the editor area
3. Select text in the editor, right-click to open the **CodeKit** menu, and run encode/decode/format operations in place

## Built-in Tools

| Tool | Description |
|------|-------------|
| Hello World | Animated demo tool with language switcher and context menu toggle |
| JSON Parser | Real-time JSON parsing, dual-window toggle, editable tree, line numbers, Prism syntax highlighting |
| Unix Time | Unix timestamp ↔ human-readable date (auto-detect seconds/milliseconds, global timezones) |
| Base64 | Base64 encode/decode (UTF-8 safe, dual-pane editing) |
| Unicode | Text ↔ `\uXXXX` escape conversion |
| UUID | Batch generate RFC 4122 v4 UUIDs (upper/lower case, per-line copy) |
| MD5 | Compute MD5 hash of input text |
| URL Encode | URL component encode/decode |
| Variable Name | camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE conversion |
| SHA Hash | Compute SHA-1 / SHA-256 / SHA-512 hashes |
| JWT Decoder | Decode JWT header and payload (base64url, UTF-8 safe) |
| Color Converter | Convert between HEX, RGB and HSL with live preview |
| Regex Tester | Test regular expressions with match count and highlighting |
| HTML Encode/Decode | Encode/decode HTML entities (`&amp; &lt; &gt; &quot; &#39;`), dual-pane editing |
| Text Counter | Count characters, UTF-8 bytes, words, lines and non-whitespace chars |

## Editor Context Menu

Right-click in the editor to run operations on selected text, replacing it in place:

| Category | Always Available | Requires Selection |
|----------|------------------|--------------------|
| Json | Open JSON Parser | JSON Expand / JSON Collapse |
| Base64 | Open Base64 | Base64 Encode / Base64 Decode |
| URL | Open URL Encoder | URL Encode / URL Decode |
| Unicode | Open Unicode | Unicode Escape / Unicode Unescape |
| Unix Time | Open Unix Time / Insert Current Time | — |
| MD5 | Open MD5 | MD5 Hash |
| UUID | Open UUID / Insert UUID | — |
| Variable Name | Open Variable Name | camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE |
| SHA | Open SHA Hash | SHA-256 Hash |
| JWT | Open JWT Decoder | — |
| Color | Open Color Converter | — |
| Regex | Open Regex Tester | — |
| HTML Encode | Open HTML Encode/Decode | HTML Encode / HTML Decode |
| Text Counter | Open Text Counter | — |

- **Open xxx**: Opens WebView and fills the input pane with selected text
- **In-place replace**: Takes selected text → transforms → replaces selection; shows error on failure
- **Insert Current Time / Insert UUID**: Replaces selection if any, otherwise inserts at cursor
- **Disabled state**: Commands requiring selection appear grayed out with "(requires selection)" suffix when no text is selected
- **Toggle**: Checkbox in Hello World WebView (top-left), enabled by default, persisted via VS Code configuration

## Features

- **Activity Bar entry**: Dedicated CodeKit icon for one-click access to the tool panel
- **WebView panels**: Tools open as tabs in the editor area with animations and interactions
- **Panel reuse**: Clicking a tool reuses an open panel; right-click "Open New Window" forces a new instance
- **i18n**: English / Simplified Chinese, switchable in Hello World, all open panels update in real time
- **Editor context menu**: In-place text transformation on selected text, toggleable from Hello World
- **Lightweight**: Native HTML/CSS/JS, only inlines Prism.js (~8KB) for JSON syntax highlighting

## Usage

### Sidebar Tools

1. Click the CodeKit icon in the Activity Bar
2. Click a tool in the Tools list to open it as a WebView tab
3. Use the tool's input/output panes — all transformations update in real time
4. Click the same tool again to jump to the existing panel; right-click → "Open New Window" to force a new instance

### Editor Context Menu

1. Select text in the editor
2. Right-click → **CodeKit** → choose a category (Json / Base64 / URL / Unicode / Unix Time / MD5 / UUID / Variable Name / SHA / JWT / Color / Regex / HTML Encode / Text Counter)
3. Pick an action:
   - **Open xxx** — Opens the tool's WebView and fills the input pane with selected text
   - **Encode/Decode/Format** — Replaces the selected text with the transformed result in place
   - **Insert Current Time / Insert UUID** — Replaces selection if any, otherwise inserts at cursor

### Language Switching

- Open Hello World, click **English** or **简体中文** in the top-right corner
- All open WebView panels update their text in real time without reloading

### Context Menu Toggle

- Open Hello World, use the **Context Menu** checkbox in the top-left corner
- Uncheck to hide the CodeKit entry from the editor right-click menu
- Setting persists across sessions via VS Code configuration

## Install

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode).

Or search "CodeKit" in the VS Code Extensions panel (`Ctrl+Shift+X`).

## Versions

- **0.0.1**: Activity Bar icon + Tree View tool list + Hello World animation
- **0.0.2**: JSON Parser (real-time parsing, editable tree, expand/collapse/sample buttons, word wrap)
- **0.0.3**: JSON editor overhaul (overlapping dual-window toggle, shared toolbar, line numbers, error indicator)
- **0.0.4**: JSON syntax highlighting (Prism.js text pane + tree type coloring)
- **0.0.5**: i18n support (English / Simplified Chinese, switch in Hello World)
- **0.0.6**: 7 converter tools + Converter framework + panel reuse + real-time language switching
- **0.0.7**: Editor context menu (9 categories, 24 commands, in-place text replacement) + HelloWorld toggle
- **0.0.8**: Extension icon
- **0.0.9**: SHA Hash / JWT Decoder / Color Converter / Regex Tester tools + context menu entries
- **0.0.10**: HTML Encode/Decode + Text Counter tools + context menu entries

## License

MIT
