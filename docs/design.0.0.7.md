# 0.0.7 设计文档

## 目标

在 VS Code 编辑器右键菜单中增加 CodeKit 子菜单，对当前选中的文本做各类转换操作，原地替换选中内容。同时支持直接打开 JSON Parser WebView 并填充选中文本。HelloWorld 中增加右键菜单开关 checkbox，可一键启用/禁用编辑器右键菜单。

## HelloWorld 右键菜单开关

- HelloWorld WebView 增加一个 checkbox「右键菜单 / Context Menu」
- 默认勾选（启用右键菜单）
- 状态持久化到 `context.globalState`（key: `contextMenuEnabled`）
- 扩展启动时读取状态，调用 `vscode.commands.executeCommand('setContext', 'codeKit.contextMenuEnabled', enabled)` 设置上下文
- checkbox 变化时，通过 `postMessage({ type: 'toggleContextMenu', enabled })` 通知扩展，扩展更新 `setContext` 并持久化
- package.json 中 CodeKit 顶级菜单的 `when` 条件追加 `&& codeKit.contextMenuEnabled`
- 语言切换时 checkbox 标签走 i18n（`hello.contextMenu`）

## 菜单结构

```
CodeKit（编辑器焦点时始终显示）
  ├─ Json
  │    ├─ Open JSON Parser      （打开 WebView，填充选中文本；始终可用）
  │    ├─ JSON Expand           （格式化为 2 空格缩进，原地替换；需选中文本）
  │    └─ JSON Collapse         （压缩为单行，原地替换；需选中文本）
  ├─ Base64
  │    ├─ Open Base64           （打开 WebView，填充选中文本到明文窗；始终可用）
  │    ├─ Base64 Encode         （选中文本 → Base64，原地替换；需选中文本）
  │    └─ Base64 Decode         （选中 Base64 → 文本，原地替换；需选中文本）
  ├─ URL
  │    ├─ Open URL Encoder      （打开 WebView，填充选中文本到明文窗；始终可用）
  │    ├─ URL Encode            （选中文本 → URL 编码，原地替换；需选中文本）
  │    └─ URL Decode            （选中 URL 编码 → 文本，原地替换；需选中文本）
  ├─ Unicode
  │    ├─ Open Unicode          （打开 WebView，填充选中文本到明文窗；始终可用）
  │    ├─ Unicode Escape        （选中文本 → \uXXXX 转义，原地替换；需选中文本）
  │    └─ Unicode Unescape      （选中 \uXXXX → 文本，原地替换；需选中文本）
  ├─ Unix Time
  │    ├─ Open Unix Time        （打开 WebView；始终可用）
  │    └─ Insert Current Time   （插入当前时间 YYYY-MM-DD HH:MM:SS，替换选中文本或插入光标位置；始终可用）
  ├─ MD5
  │    ├─ Open MD5              （打开 WebView，填充选中文本到输入窗；始终可用）
  │    └─ MD5 Hash              （选中文本 → MD5 哈希，原地替换；需选中文本）
  ├─ UUID
  │    ├─ Open UUID             （打开 WebView；始终可用）
  │    └─ Insert UUID           （生成新 UUID，替换选中文本或插入光标位置；始终可用）
  └─ Variable Name
       ├─ Open Variable Name    （打开 WebView，填充选中文本到输入窗；始终可用）
       ├─ camelCase             （需选中文本）
       ├─ snake_case            （需选中文本）
       ├─ kebab-case            （需选中文本）
       ├─ PascalCase            （需选中文本）
       └─ CONSTANT_CASE         （需选中文本）
```

### 显示规则

- **CodeKit 顶级菜单**：`when: editorTextFocus && codeKit.contextMenuEnabled`，编辑器有焦点且开关启用时显示
- **所有 Open xxx 命令 + Insert Current Time + Insert UUID**：始终可用，不要求选中文本
  - Open xxx：无选中时打开空 WebView，有选中时填充到对应输入窗（UUID/Unix Time 无文本输入窗则仅打开）
  - Insert Current Time / Insert UUID：有选中时替换选中文本，无选中时插入到光标位置
- **其余命令**：`when: editorHasSelection`，要求选中文本，操作后原地替换

### 错误处理

- 解析/解码失败时，通过 `vscode.window.showErrorMessage` 提示，不做任何编辑
- 错误消息走 i18n（中英双语）

## 不纳入右键菜单的工具

| 工具 | 原因 |
|------|------|
| Hello World | 入口工具，无文本处理逻辑 |

## 实现方案

### 1. package.json

- 新增命令（共 24 个，含已有的 3 个 JSON 命令）：
  - `codeKit.jsonExpand` / `codeKit.jsonCollapse` / `codeKit.openJsonParser`（已实现）
  - `codeKit.openBase64` / `codeKit.base64Encode` / `codeKit.base64Decode`
  - `codeKit.openUrlEncode` / `codeKit.urlEncode` / `codeKit.urlDecode`
  - `codeKit.openUnicode` / `codeKit.unicodeEscape` / `codeKit.unicodeUnescape`
  - `codeKit.openUnixTime` / `codeKit.insertCurrentTime`
  - `codeKit.openMd5` / `codeKit.md5Hash`
  - `codeKit.openUuid` / `codeKit.insertUuid`
  - `codeKit.openVarName` / `codeKit.varNameCamel` / `codeKit.varNameSnake` / `codeKit.varNameKebab` / `codeKit.varNamePascal` / `codeKit.varNameConstant`
- 新增子菜单：`codeKit.editor`（CodeKit）、`codeKit.json`（Json）、`codeKit.base64`（Base64）、`codeKit.url`（URL）、`codeKit.unicode`（Unicode）、`codeKit.unixTime`（Unix Time）、`codeKit.md5`（MD5）、`codeKit.uuid`（UUID）、`codeKit.varName`（Variable Name）
- 命令标题走 package.nls 双语机制（VS Code 菜单标题不支持运行时动态切换）

### 2. 命令实现 `src/commands/`

- `jsonFormat.ts`（已实现）：`expandSelection` / `collapseSelection`
- `textConvert.ts`（新增）：Base64/URL/Unicode 编码解码 + MD5 哈希 + 变量名转换 + 插入当前时间 + 插入 UUID
  - 原地替换类操作统一模式：取选中文本 → 转换 → `editor.edit()` 替换选区
  - 插入类操作（当前时间/UUID）：有选中则替换选区，无选中则 `editor.edit()` 在光标位置插入
  - 失败时 `showErrorMessage`

### 2.5 Open xxx 命令实现

每个工具的 `Open xxx` 命令逻辑统一：
1. 获取当前选中文本（可能为空）
2. 检查 `panelRegistry` 是否已有该工具面板
3. 已有面板：`reveal` 跳转，若有选中文本则 `postMessage({ type: 'setInput', text })` 填充
4. 无面板：调用 `tool.run(context, selectedText)` 新建（`initialText` 由各 WebView 处理填充）

各 WebView 需新增 `setInput` 消息监听器，接收文本后填充到对应输入窗并触发解析/转换：
- JSON Parser → 文本窗（已实现）
- Base64 → 明文窗（左）
- URL → 明文窗（左）
- Unicode → 明文窗（右，中文字符侧）
- MD5 → 输入窗
- Variable Name → 输入窗
- Unix Time / UUID → 无文本输入窗，仅打开 WebView

### 3. i18n

新增键：
- `hello.contextMenu`（HelloWorld 右键菜单开关标签）
- `command.jsonExpand.name` / `command.jsonCollapse.name` / `command.openJsonParser.name`
- `command.openBase64.name` / `command.base64Encode.name` / `command.base64Decode.name`
- `command.openUrlEncode.name` / `command.urlEncode.name` / `command.urlDecode.name`
- `command.openUnicode.name` / `command.unicodeEscape.name` / `command.unicodeUnescape.name`
- `command.openUnixTime.name` / `command.insertCurrentTime.name`
- `command.openMd5.name` / `command.md5Hash.name`
- `command.openUuid.name` / `command.insertUuid.name`
- `command.openVarName.name` / `command.varNameCamel.name` / `command.varNameSnake.name` / `command.varNameKebab.name` / `command.varNamePascal.name` / `command.varNameConstant.name`
- `convert.error.decode`（通用解码失败提示）

### 4. extension.ts

在 `activate` 中注册所有命令，回调调用对应实现函数。

## 转换逻辑明细

| 命令 | 输入 | 输出 | 失败条件 |
|------|------|------|----------|
| Base64 Encode | 任意文本 | Base64 编码（UTF-8 安全） | 几乎不会失败 |
| Base64 Decode | Base64 字符串 | 原始文本 | 非法 Base64 |
| URL Encode | 任意文本 | `encodeURIComponent` 结果 | 不会失败 |
| URL Decode | URL 编码字符串 | `decodeURIComponent` 结果 | 非法 URL 编码 |
| Unicode Escape | 任意文本 | `\uXXXX` 转义（仅非 ASCII 字符） | 不会失败 |
| Unicode Unescape | `\uXXXX` 转义字符串 | 原始文本 | 不会失败（正则替换） |
| Insert Current Time | 无需输入 | `YYYY-MM-DD HH:MM:SS` 当前时间 | 不会失败 |
| MD5 Hash | 任意文本 | 32 位十六进制 MD5 | 不会失败 |
| Insert UUID | 无需输入 | RFC 4122 v4 UUID | 不会失败 |
| camelCase | 变量名 | `camelCase` | 不会失败 |
| snake_case | 变量名 | `snake_case` | 不会失败 |
| kebab-case | 变量名 | `kebab-case` | 不会失败 |
| PascalCase | 变量名 | `PascalCase` | 不会失败 |
| CONSTANT_CASE | 变量名 | `CONSTANT_CASE` | 不会失败 |

### Unix Time 插入逻辑

- 获取当前时间 `new Date()`，格式化为 `YYYY-MM-DD HH:MM:SS`（本地时区，月/日/时/分/秒补零）
- 有选中文本时替换选区，无选中文本时在光标位置插入

### UUID 生成逻辑

- 生成 RFC 4122 v4 UUID（小写），通过 `crypto.randomUUID()`（Node 16.7+ 可用）
- 有选中文本时替换选区，无选中文本时在光标位置插入

### 变量名转换逻辑

以选中字符串为单位，按非字母数字字符分词，各词转小写后按目标风格拼接：
- camelCase：首词小写，后续词首字母大写
- snake_case：全小写，下划线连接
- kebab-case：全小写，短横线连接
- PascalCase：每词首字母大写
- CONSTANT_CASE：全大写，下划线连接
