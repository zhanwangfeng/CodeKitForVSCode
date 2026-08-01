# CodeKit 设计文档 v0.0.4

## 目标

给文本窗和编辑窗都加上 JSON 语法高亮，高亮规则与 VSCode 内置 JSON 高亮一致。

## 最终实现

### 文本窗：Prism.js 高亮

**原理**：textarea 文字透明 + 下方 `<pre>` 高亮层渲染 Prism.highlight() 生成的带颜色 span 的 HTML。

**Prism.js 集成方式**：
- `resources/prism/prism-core.min.js`（7.4KB）+ `resources/prism/prism-json.min.js`（0.4KB）
- 在 `getJsonParserWebviewContent()` 中用 `fs.readFileSync` 读取并内联到 `<script>` 标签
- `highlightJSON(text)` 简化为一行：`Prism.highlight(text, Prism.languages.json, 'json')`
- 弃用手写正则方案（模板字符串转义 `\b`/`\d`/`\s` 问题导致正则失效）

**HTML 结构**：
```
text-editor
├── line-numbers           (行号列)
├── text-area-wrapper      (新增，包裹高亮层和 textarea)
│   ├── highlight-layer (pre)  (高亮层，pointer-events: none)
│   └── textarea              (文字透明，caret 可见)
```

**CSS 关键点**：
- `textarea`：`color: transparent; caret-color: var(--vscode-editor-foreground); background: transparent`
- `.highlight-layer`：绝对定位，font/padding/line-height 与 textarea 完全一致，`z-index: 1`
- `textarea`：`z-index: 2`（在高亮层上方，透明文字让高亮层可见）
- `.text-area-wrapper`：`position: relative`，防止高亮层覆盖行号列

**Prism token → VSCode 主题变量映射**：
| Prism token class | CSS 变量 + fallback | 颜色 |
|---|---|---|
| `.token.property` | `--vscode-json-property-syntax, #9cdcfe` | 蓝色（属性名） |
| `.token.string` | `--vscode-json-string-syntax, #ce9178` | 橙色（字符串） |
| `.token.number` | `--vscode-json-number-syntax, #b5cea8` | 绿色（数字） |
| `.token.boolean` | `--vscode-json-boolean-syntax, #569cd6` | 蓝色（布尔值） |
| `.token.null` | `--vscode-json-null-foreground, #569cd6` | 蓝色（null） |
| `.token.punctuation` | `--vscode-editor-foreground, #d4d4d4` | 默认前景色 |
| `.token.operator` | `--vscode-editor-foreground, #d4d4d4` | 默认前景色 |

**调用时机**：在所有修改 `input.value` 的地方调用 `updateHighlight()`（展开/收起/示例/清空/同步/输入/初始化），scroll 事件同步高亮层滚动。

### 编辑窗：CSS 类型着色（修复 fallback）

编辑窗已有类型高亮（v0.0.2 实现），但 CSS 缺少 fallback 颜色。`--vscode-json-*` 变量在 WebView 中不存在（它们是 TextMate 语法作用域变量，只在编辑器上下文中定义），导致颜色回退为白色。

**修复**：给所有 `--vscode-json-*` 变量加上 fallback 颜色，与文本窗一致：

| CSS class | 修复前 | 修复后 |
|---|---|---|
| `.tree-key` | `var(--vscode-json-property-syntax)` | `var(--vscode-json-property-syntax, #9cdcfe)` |
| `.tree-value.string` | `var(--vscode-json-string-syntax)` | `var(--vscode-json-string-syntax, #ce9178)` |
| `.tree-value.number` | `var(--vscode-json-number-syntax)` | `var(--vscode-json-number-syntax, #b5cea8)` |
| `.tree-value.boolean` | `var(--vscode-json-boolean-syntax)` | `var(--vscode-json-boolean-syntax, #569cd6)` |
| `.tree-value.null` | `var(--vscode-json-null-foreground)` | `var(--vscode-json-null-foreground, #569cd6)` |

## 架构

```
src/
  webviews/
    jsonParserWebview.ts      # JSON 解析 WebView 页面（修改）
resources/
  prism/
    prism-core.min.js         # Prism.js 核心（新增，7.4KB）
    prism-json.min.js         # JSON 语言定义（新增，0.4KB）
```

### 修改文件

1. **src/webviews/jsonParserWebview.ts**
   - 顶部新增 `import * as fs` / `import * as path`，读取 Prism 文件并内联
   - HTML：新增 `text-area-wrapper` 包裹 `highlight-layer` (pre) 和 textarea
   - CSS：高亮层样式、textarea 透明文字、Prism token 样式、编辑窗 fallback 修复
   - JS：`highlightJSON()` 用 `Prism.highlight()`，`updateHighlight()` + 各调用点 + 滚动同步
2. **resources/prism/**（新增）：Prism.js 核心库 + JSON 语言定义
