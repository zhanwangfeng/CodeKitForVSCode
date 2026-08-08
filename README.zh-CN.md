# CodeKit

[![VS Marketplace](https://vsmarketplacebadges.dev/version-short/zhanwangfeng.code-kit-for-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode)
[![Installs](https://vsmarketplacebadges.dev/installs/zhanwangfeng.code-kit-for-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode)

[English](README.md) | **中文**

一个 VSCode 扩展工具箱：把常用的开发小工具收进侧边栏，随时取用。

- GitHub: https://github.com/zhanwangfeng/CodeKitForVSCode
- VSCode: https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode

## 演示

![Usage Show](docs/usage_show.gif)

## 快速开始

1. 点击 Activity Bar 中的 CodeKit 图标，打开 Tools 工具列表
2. 点击任意工具（如 JSON Parser），在编辑器主区域打开 WebView 标签页
3. 在编辑器中选中文本，右键打开 **CodeKit** 菜单，直接执行编码解码、格式化等操作

## 内置工具

| 工具 | 说明 |
|------|------|
| Hello World | 动画示例工具，内置语言切换与右键菜单开关 |
| JSON Parser | 实时解析 JSON，双窗口切换，可编辑树状结构，行号显示，Prism 语法高亮 |
| Unix 时间 | Unix 时间戳与日期互转（秒/毫秒自动识别，全球时区） |
| Base64 | Base64 编码/解码（UTF-8 安全，双向编辑） |
| Unicode | 文本与 `\uXXXX` 转义互转 |
| UUID | 批量生成 RFC 4122 v4 UUID（大小写，逐行复制） |
| MD5 | 计算输入文本的 MD5 哈希 |
| URL 编码 | URL 组件编码/解码 |
| 变量名转换 | camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE 互转 |
| SHA 哈希 | 计算 SHA-1 / SHA-256 / SHA-512 哈希 |
| JWT 解码 | 解码 JWT 的 header 与 payload（base64url，UTF-8 安全） |
| 颜色转换 | HEX / RGB / HSL 互转，实时色块预览 |
| 正则测试 | 正则表达式测试，实时显示匹配结果与高亮 |
| HTML 实体 | HTML 特殊字符实体编码与解码（`&amp; &lt; &gt; &quot; &#39;`，双向编辑） |
| 文本统计 | 实时统计字符数、UTF-8 字节数、单词数、行数与去空白字符数 |

## 编辑器右键菜单

编辑器内右键可直接对选中文本执行操作，原地替换：

| 分类 | 始终可用 | 需选中文本 |
|------|----------|------------|
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

- **Open xxx**：打开 WebView 并填充选中文本到输入窗
- **原地替换**：取选中文本 → 转换 → 替换选区，失败时提示错误
- **Insert Current Time / Insert UUID**：有选中则替换，无选中则插入光标位置
- **禁用状态**：需选中文本的命令在无选中时显示为灰色不可点击（带"需选中文字"后缀）
- **开关**：Hello World WebView 左上角 checkbox，默认启用，通过 VS Code 配置持久化

## 特性

- **Activity Bar 入口**：专属 CodeKit 图标，一键进入工具面板
- **WebView 展示**：工具在编辑器主区域打开标签页，支持动画与交互
- **面板复用**：点击工具复用已打开的面板，右键"打开新窗口"可强制新建
- **多语言**：英文 / 简体中文双语，Hello World 内切换，所有已打开面板实时响应
- **编辑器右键菜单**：选中文本原地替换，HelloWorld 内可一键开关
- **轻量依赖**：原生 HTML/CSS/JS，仅内联 Prism.js（~8KB）用于 JSON 语法高亮

## 使用说明

### 侧边栏工具

1. 点击 Activity Bar 中的 CodeKit 图标
2. 在 Tools 列表中点击工具，在编辑器主区域打开 WebView 标签页
3. 使用工具的输入/输出窗 — 所有转换实时更新
4. 再次点击同一工具会跳转到已打开的面板；右键"打开新窗口"可强制新建

### 编辑器右键菜单

1. 在编辑器中选中文本
2. 右键 → **CodeKit** → 选择分类（Json / Base64 / URL / Unicode / Unix Time / MD5 / UUID / Variable Name / SHA / JWT / Color / Regex / HTML Encode / Text Counter）
3. 选择操作：
   - **Open xxx** — 打开工具 WebView 并填充选中文本到输入窗
   - **编码/解码/格式化** — 将选中文本转换后原地替换
   - **Insert Current Time / Insert UUID** — 有选中则替换，无选中则插入光标位置

### 语言切换

- 打开 Hello World，点击右上角的 **English** 或 **简体中文**
- 所有已打开的 WebView 面板实时更新文案，无需重新加载

### 右键菜单开关

- 打开 Hello World，使用左上角的 **右键菜单** checkbox
- 取消勾选可隐藏编辑器右键菜单中的 CodeKit 入口
- 设置通过 VS Code 配置持久化，跨会话保留

## 安装

从 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=zhanwangfeng.code-kit-for-vscode) 安装。

或在 VS Code 扩展面板（`Ctrl+Shift+X`）中搜索 "CodeKit"。

## 版本

- **0.0.1**：活动栏图标入口 + Tree View 工具列表 + Hello World 动画工具
- **0.0.2**：JSON Parser 工具（实时解析、可编辑树状图、展开/单行/示例按钮、自动换行）
- **0.0.3**：JSON 编辑器优化（重叠双窗口切换、共用工具栏、行号显示、错误指示灯泡）
- **0.0.4**：JSON 语法高亮（Prism.js 文本窗高亮 + 编辑窗类型着色）
- **0.0.5**：多语言支持（英文 / 简体中文，Hello World 内切换）
- **0.0.6**：新增 7 个转换工具 + Converter 通用框架 + 面板复用 + 语言实时切换
- **0.0.7**：编辑器右键菜单（9 分类 24 命令，选中文本原地替换）+ HelloWorld 右键菜单开关
- **0.0.8**：扩展图标
- **0.0.9**：新增 SHA 哈希 / JWT 解码 / 颜色转换 / 正则测试 4 个工具 + 右键菜单入口
- **0.0.10**：新增 HTML 实体编码/解码 / 文本统计 2 个工具 + 右键菜单入口

## License

MIT
