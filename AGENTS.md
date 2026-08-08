# AGENTS.md

VS Code extension "CodeKit": sidebar WebView tools + editor context-menu text transformations. TypeScript, CommonJS, no bundler, no runtime deps (Prism.js inlined only).

## Commands

- `npm run compile` — `tsc -p ./` (strict). Only verification available: **there are no tests and no lint**; compile is the gate.
- `npm run watch` — incremental compile for dev.
- `npm run package` — `vsce package --out release/`. Requires Node 20+. Bump `version` in `package.json` first; outputs `release/code-kit-for-vscode-{ver}.vsix` (gitignored). Ship only compiled `out/` — `.vscodeignore` excludes `src/`, `docs/`, `.ts`, `.map`.
- Dev/debug: F5 (`Run Extension` launch config compiles first).

## Release workflow (repo convention, see docs/ai-workflow.md)

Per version: branch `dev0.0.X` → write `docs/design.{ver}.md` → code → PR to `main` → tag `v{ver}` → `npm run package` → GitHub Release with vsix attachment, notes from `CHANGELOG.md`. On `main`, keep docs/CHANGELOG/README version notes in sync with the merged commits.

## Architecture

- `src/extension.ts` — entry. Registers every command, owns `panelRegistry` (toolId → open panels) for **panel reuse**: clicking a tool reveals an existing panel instead of creating one; only `codeKit.openNewWindow` forces a new one.
- `src/tools/tool.ts` — `Tool` interface (id, name, description, commandId, icon, `run(ctx, initialText?)`, optional `onLocaleChange`).
- `src/tools/index.ts` — `tools` array = `[helloWorld, jsonParser, ...converterTools]`; **array order is the Tree View display order**. `src/tools/converters/index.ts` holds the 7 converters.
- `src/tools/converters/*.ts` — one file per converter tool; each has `name`/`description` as **getters calling `t()`** so locale switches live, plus `onLocaleChange` posting `{type:'localeChanged', locale, ui}` to the panel.
- `src/webviews/*.ts` — WebView HTML builders. `dualPaneWebview.ts` is the shared two-pane builder used by base64/url/unicode (left=plaintext unless `reversed: true`, e.g. Unicode). Other converters have dedicated builders but the same `getXxxUI()`/`getXxxWebviewContent()` shape.
- `src/i18n/index.ts` — all UI strings, single source of truth `messages` dict (en/zh-cn). **No package.nls files** — UI i18n lives here, not package.json. Locale persisted in `globalState` (`codeKit.locale`).
- `src/commands/textConvert.ts`, `jsonFormat.ts` — in-place selection transforms (selected text → `editor.edit()` replace).

## Conventions

- **Comments, design docs, CHANGELOG entries are written in Simplified Chinese**; code identifiers in English.
- Adding a tool = Tool impl + entry in a registry + `contributes.commands` entry in `package.json` + i18n keys + (if context menu) a submenu. Every context-menu command needs a disabled placeholder variant (`…Disabled` command, `enablement: "editorHasSelection"`, hidden from palette via `"when": "false"`) — titles like "(需选中文字)" are **hardcoded Chinese in package.json**, not i18n.
- Every WebView must handle `{type:'setInput', text}` (fill input pane from selection via Open xxx) and `{type:'localeChanged'}`; WebView inline JS is `'unsafe-inline'` under a `default-src 'none'` CSP.
- Context menu gated by config `codeKit.contextMenuEnabled` (default true), toggled from Hello World WebView.
