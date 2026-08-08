# 0.0.10 设计文档

## 目标

新增 2 个工具页面（HTML 实体编码/解码、文本统计 Text Counter），并为其补齐与现有工具一致的编辑器右键菜单入口。本版本只新增，不修改任何现有功能。

## 新增工具

| 工具 | 功能 | WebView 模式 |
|------|------|-------------|
| HTML Encode/Decode | 左明文右实体，双向实时同步；编码 `& < > " '` 等 HTML 特殊字符，支持解码还原 | 复用通用双栏 `dualPaneWebview`（仿 URL Encode） |
| Text Counter | 输入文本实时统计：字符数、UTF-8 字节数、单词数、行数、去空白字符数 | 专用单输入 + 统计卡片区（仿 SHA 纵向布局） |

### 实现说明

- **HTML Encode**：复用 `dualPaneWebview`，通过 `DualPaneConfig` 传入 `encodeFn`/`decodeFn`（JS 源码字符串内联进 WebView）。编码按序替换 `& → &amp;`、`< → &lt;`、`> → &gt;`、`" → &quot;`、`' → &#39;` 以避免二次转义；解码用 `textarea` 注入 innerHTML 还原实体。
- **Text Counter**：新增专用 `textCounterWebview.ts`，采用与 SHA 一致的 `getXxxUI()/getXxxWebviewContent()` 模式。统计在浏览器端同步完成：字符数（`length`）、UTF-8 字节数（`TextEncoder`）、单词数（`\S+` 分词）、行数（`split('\n')`）、去空白字符数；输入防抖 150ms 实时刷新。
- 两个工具均实现 `onLocaleChange` postMessage 原地更新文案，均支持 `{type:'setInput'}` 填充选中文本。

## 文件变更

- `src/tools/converters/htmlEntity.ts` — HTML 实体工具（getConfig() 返回 DualPaneConfig + onLocaleChange）
- `src/tools/converters/textCounter.ts` — 文本统计工具（getter 式 name/description + onLocaleChange）
- `src/webviews/textCounterWebview.ts` — 文本统计 WebView 构建器（getTextCounterUI / getTextCounterWebviewContent）
- `src/tools/converters/index.ts` — converterTools 尾部追加 2 个工具（Tree View 展示顺序）
- `src/i18n/index.ts` — `tool.htmlEntity/textCounter.*` 与 `htmlEntity.*/textCounter.*` 双语文案
- `src/commands/textConvert.ts` — 新增 `htmlEncode / htmlDecode` 原地替换函数
- `src/extension.ts` — 注册 `openHtmlEntity / htmlEncode / htmlDecode / openTextCounter`，disabled 列表追加 `htmlEncodeDisabled / htmlDecodeDisabled`
- `package.json` — 新增命令、2 个新 submenu、菜单挂载与图标（ThemeIcon：code / symbol-number）
- `CHANGELOG.md`、`README.md`、`README.zh-CN.md` — 记录 0.0.10 变更

## 右键菜单结构（CodeKit 末尾追加 2 个分类）

```
CodeKit（编辑器焦点时始终显示）
  ├─ HTML Encode
  │    ├─ Open HTML Encode/Decode   （打开 WebView；始终可用）
  │    ├─ HTML Encode               （选中文本 → HTML 实体，原地替换；需选中文本）
  │    └─ HTML Decode               （选中文本 → 原文，原地替换；需选中文本）
  └─ Text Counter
       └─ Open Text Counter         （打开 WebView，填充选中文本到输入窗；始终可用）
```

- `HTML Encode / HTML Decode` 需 `editorHasSelection`，无选中时显示 `(需选中文字)` disabled 占位（硬编码中文标题，与现有命令一致）
- 其余 `Open xxx` 命令不要求选中文本；面板已打开时 `reveal` 跳转并 `postMessage({type:'setInput'})` 填充

## 版本号

`package.json` version 由 `0.0.9` 升至 `0.0.10`。
