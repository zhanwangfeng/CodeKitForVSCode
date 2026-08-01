# CodeKit 设计文档 v0.0.5

## 目标

为 CodeKit 实现**插件内部自管理的多语言（i18n）**，覆盖 **英文（默认）** 与 **简体中文**。

### 设计决策（用户明确要求）

- **不与 package 混合**：不使用 `package.nls.*.json` / `vscode.l10n`。`package.json` 贡献项（活动栏标题、视图名、命令标题）保持现有英文不动。所有可翻译文案集中在一个内部 TS 模块里管理。
- **语言设置入口在 Hello World**：Hello World WebView 内放语言选择器（English / 简体中文）。
- **JSON Parser 打开时按设置显示**：JSON Parser 在打开构建 HTML 时读取当前语言，按该语言渲染。
- **只支持两种语言**：`en`、`zh-cn`。

### 本地化范围

1. Hello World WebView 全部文案 + 语言选择器
2. JSON Parser WebView 全部文案（HTML 静态文本 + `<script>` 动态提示）
3. 工具元数据 `Tool.name` / `Tool.description`（侧边栏 Tree View 显示）

## 架构与文件布局

```
CodeKitForVSCode/
├── package.json                      # 不改（贡献项保持英文）
├── src/
│   ├── i18n/
│   │   └── index.ts                  # 新增：内部 i18n 模块（字典 + 状态 + 持久化）
│   ├── extension.ts                  # 改：activate 调 initI18n(context)
│   ├── tools/
│   │   ├── tool.ts                   # 不改（name/description 仍为 readonly string，由 getter 满足）
│   │   ├── helloWorld.ts             # 改：name/description 走 t()；run 监听 setLocale 消息
│   │   ├── jsonParser.ts             # 改：name/description 走 t()
│   │   └── index.ts                  # 不改
│   └── webviews/
│       ├── helloWorldWebview.ts      # 改：注入语言选择器 + 文案走 t()
│       └── jsonParserWebview.ts      # 改：静态文案走 t()；动态文案注入已解析 i18n 对象
```

## i18n 模块设计（src/i18n/index.ts）

单一真相源：所有文案双语字典 + 当前语言状态 + 持久化读写。

```ts
import * as vscode from 'vscode';

export type Locale = 'en' | 'zh-cn';
export const LOCALES: readonly Locale[] = ['en', 'zh-cn'];

const messages: Record<string, Record<Locale, string>> = {
  // —— 工具元数据（Tree View）——
  'tool.helloWorld.name':        { en: 'Hello World',  'zh-cn': 'Hello World' },
  'tool.helloWorld.description': { en: 'Welcome animation demo tool',
                                   'zh-cn': '第一个工具：打开 Hello World 动画' },
  'tool.jsonParser.name':        { en: 'JSON Parser',  'zh-cn': 'JSON Parser' },
  'tool.jsonParser.description': { en: 'Parse JSON in real time with an editable tree view',
                                   'zh-cn': 'JSON解析工具：实时解析JSON字符串，可视化展示' },
  // —— Hello World WebView ——
  'hello.title':      { en: 'CodeKit', 'zh-cn': 'CodeKit' },
  'hello.intro':      { en: 'A VS Code toolkit that tucks handy dev tools into the sidebar, ready when you need them.',
                        'zh-cn': '一个把常用开发小工具收进侧边栏的 VSCode 扩展工具箱，随时取用。' },
  'hello.feature.1':  { en: 'Custom Activity Bar icon entry — one click to the tools panel',
                        'zh-cn': 'Activity Bar 自定义图标入口，一键进入工具面板' },
  'hello.feature.2':  { en: 'Sidebar Tree View listing all tools in one place',
                        'zh-cn': '主侧边栏 Tree View 树形列表，集中展示全部工具' },
  'hello.feature.3':  { en: 'Tools open as WebView tabs in the editor area, with animation and interaction',
                        'zh-cn': '工具可在编辑器主区域打开 WebView 标签页，支持动画与交互' },
  'hello.feature.4':  { en: 'Add a tool by implementing the Tool interface and registering it — zero runtime deps',
                        'zh-cn': '新增工具只需实现 Tool 接口并登记，零运行时依赖' },
  'hello.lang.label': { en: 'Language', 'zh-cn': '语言' },
  'hello.lang.en':    { en: 'English',  'zh-cn': 'English' },
  'hello.lang.zh':    { en: '简体中文',  'zh-cn': '简体中文' },
  // —— JSON Parser WebView ——
  'json.tabText':      { en: 'Text',                 'zh-cn': '文本窗' },
  'json.tabTree':      { en: 'Tree',                 'zh-cn': '编辑窗' },
  'json.wrap':         { en: 'Word Wrap',            'zh-cn': '自动换行' },
  'json.lineNumbers':  { en: 'Line Numbers',         'zh-cn': '行号' },
  'json.expand':       { en: 'Expand',               'zh-cn': '展开' },
  'json.minify':       { en: 'Collapse',             'zh-cn': '收起' },
  'json.example':      { en: 'Example',              'zh-cn': '示例' },
  'json.clear':        { en: 'Clear',                'zh-cn': '清空' },
  'json.copy':         { en: 'Copy',                 'zh-cn': '复制' },
  'json.placeholder':  { en: 'Type JSON here...',    'zh-cn': '在此输入 JSON 字符串...' },
  'json.waiting':      { en: 'Waiting for JSON input...', 'zh-cn': '等待输入 JSON...' },
  'json.synced':       { en: 'Synced',               'zh-cn': '已同步' },
  'json.noData':       { en: 'Nothing to copy',      'zh-cn': '无数据可复制' },
  'json.copied':       { en: 'Copied to clipboard',  'zh-cn': '已复制到剪贴板' },
  'json.parseFailed':  { en: 'JSON parse failed',    'zh-cn': 'JSON 解析失败' },
  'json.location':     { en: 'Location',             'zh-cn': '位置' },
  'json.error':        { en: 'Error',                'zh-cn': '错误' },
  'json.changeNullPrompt': { en: 'Change null to:',  'zh-cn': 'null 改为:' },
};

const STATE_KEY = 'codeKit.locale';
let currentLocale: Locale = 'en';
let store: vscode.Memento | null = null;

export function initI18n(context: vscode.ExtensionContext): void {
  store = context.globalState;
  const saved = context.globalState.get<Locale>(STATE_KEY);
  if (saved === 'en' || saved === 'zh-cn') currentLocale = saved;
}

export function getLocale(): Locale { return currentLocale; }

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  store?.update(STATE_KEY, locale);
}

export function t(key: string): string {
  return messages[key]?.[currentLocale] ?? key;
}
```

### 持久化

- 用 `context.globalState`（跨会话、跨工作区）保存语言选择，key = `codeKit.locale`。
- `initI18n(context)` 在 `activate` 中调用一次，读取已存语言。
- WebView 无法直接访问 `globalState`，通过 `postMessage` 通知扩展写入。

## Hello World：语言选择器 + 设置流程

### UI

Hello World 页面右上角加语言选择器（两个按钮，高亮当前语言）：

```
[ English ] [ 简体中文 ]   ← 当前语言高亮
```

### 文案

静态文案构建时用 `t()` 渲染（如 `<h2>${t('hello.title')}</h2>`）。

### 切换流程

Hello World WebView 内 `acquireVsCodeApi()` 后，点击语言按钮：

```js
function selectLocale(locale) {
  vscode.postMessage({ type: 'setLocale', locale });
}
```

扩展端 `helloWorldTool.run()` 设置消息监听：

```ts
panel.webview.onDidReceiveMessage((msg) => {
  if (msg?.type === 'setLocale' && (msg.locale === 'en' || msg.locale === 'zh-cn')) {
    setLocale(msg.locale);
    panel.webview.html = getHelloWorldWebviewContent(); // 用新语言重建（动画重启，无状态损失）
    vscode.commands.executeCommand('codeKit.refreshTools'); // 刷新 Tree View 工具名
  }
});
```

> 重建而非客户端切换：Hello World 是纯展示动画，无输入状态，重建最简单且无 `data-i18n` 维护负担。

## JSON Parser：打开时按设置语言显示

### 静态文案

构建 HTML 时用 `t()` 渲染（按钮、标签、placeholder）：

```ts
<button class="tab active" id="tabText">${t('json.tabText')}</button>
<button class="btn btn-ghost" id="expandBtn">${t('json.expand')}</button>
<textarea placeholder="${t('json.placeholder')}"></textarea>
```

### 动态文案（`<script>` 内）

构建一个**已按当前语言解析好**的 i18n 对象并注入：

```ts
const i18n = {
  synced:      t('json.synced'),
  waiting:     t('json.waiting'),
  noData:      t('json.noData'),
  copied:      t('json.copied'),
  parseFailed: t('json.parseFailed'),
  location:    t('json.location'),
  error:       t('json.error'),
  changeNullPrompt: t('json.changeNullPrompt'),
};
// <script> 内：const i18n = ${JSON.stringify(i18n).replace(/</g, '\\u003c')};
```

`<script>` 内原本写死中文处改用 `i18n.xxx`：
- `showSyncIndicator('已同步')` → `showSyncIndicator(i18n.synced)`
- `'<div class="placeholder">等待输入 JSON...</div>'` → `i18n.waiting`
- 错误标题 `'JSON 解析失败'` → `i18n.parseFailed`
- `prompt('null 改为:', ...)` → `prompt(i18n.changeNullPrompt, ...)`
- 等

> JSON Parser 不放语言选择器，也不做实时切换——打开时按当前语言构建即可（符合「打开 json 时，根据设置的语言显示」）。

### `<` 转义

`JSON.stringify(i18n)` 注入 `<script>` 时，值中若含 `</script>` 会截断。统一转义 `<` 为 `\u003c`（用 `.replace(/</g, '\\u003c')`，避免在模板字符串里写复杂正则，沿用 v0.0.4 教训）。

## Tool 元数据本地化（Tree View）

`Tool` 接口不变（`readonly name: string`）。各工具用 **getter** 动态返回 `t()`：

```ts
export const helloWorldTool: Tool = {
  id: 'hello-world',
  get name() { return t('tool.helloWorld.name'); },
  get description() { return t('tool.helloWorld.description'); },
  // ...
};
```

`ToolsTreeProvider.getTreeItem` 已读 `tool.name` / `tool.description`，getter 每次取最新语言。语言变更时扩展执行 `codeKit.refreshTools` 触发 `treeProvider.refresh()`，Tree View 即刷新为新语言。

## 数据流总览

```
用户在 Hello World 点语言按钮
   │  postMessage({type:'setLocale', locale})
   ▼
helloWorldTool.run() 的 onDidReceiveMessage
   │  setLocale(locale)  → 写 globalState
   │  panel.webview.html = getHelloWorldWebviewContent()  → Hello World 重建为新语言
   │  executeCommand('codeKit.refreshTools')              → Tree View 刷新工具名
   ▼
之后打开 JSON Parser → getJsonParserWebviewContent() 读 getLocale() → 按该语言构建
```

## 测试方式

1. `npm run compile`
2. `F5` 启动 Extension Development Host
3. 打开 Hello World → 点「简体中文」→ 验证页面文案变中文、Tree View 工具描述变中文
4. 点「English」→ 验证回英文
5. 打开 JSON Parser → 验证按钮/提示/错误文案为当前语言
6. 关闭窗口重开（验证持久化）：重开 Hello World / JSON Parser 仍为上次选择的语言

## 新增/修改文件清单

| 文件 | 操作 |
| --- | --- |
| `src/i18n/index.ts` | 新增：i18n 模块（字典 + 状态 + 持久化 + t()） |
| `src/extension.ts` | 改：`activate` 调 `initI18n(context)` |
| `src/tools/helloWorld.ts` | 改：name/description 走 getter + t()；run 监听 setLocale |
| `src/tools/jsonParser.ts` | 改：name/description 走 getter + t() |
| `src/webviews/helloWorldWebview.ts` | 改：文案走 t()；加语言选择器 + postMessage |
| `src/webviews/jsonParserWebview.ts` | 改：静态走 t()；动态注入已解析 i18n 对象 |
| `CHANGELOG.md` / `README.md` | 改：版本说明 |

`package.json` 不改（贡献项保持英文，版本号除外 → 0.0.5）。

## 不在本次范围

- 不本地化 `package.json` 贡献项（命令标题/视图名保持英文）。
- 不支持两种以外的语言（架构可扩展，但首期只做 en + zh-cn）。
- JSON Parser 不做打开后的实时语言切换。
