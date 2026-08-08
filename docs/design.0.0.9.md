# 0.0.9 设计文档

## 目标

新增 4 个转换工具页面（SHA 哈希、JWT 解码、颜色转换、正则测试），并为其补齐与现有工具一致的编辑器右键菜单入口。本版本只新增，不修改任何现有功能。

## 新增工具

| 工具 | 功能 | WebView 模式 |
|------|------|-------------|
| SHA Hash | 选择 SHA-1 / SHA-256 / SHA-512 算法，实时计算输入文本哈希 | 类 MD5 纵向布局（算法下拉） |
| JWT Decoder | 粘贴 JWT，解码展示 header / payload / signature 十六进制 | Token 输入 + 三结果区 |
| Color Converter | 输入任意格式颜色（HEX/RGB/HSL），实时输出三种格式与色块预览 | 单输入 + 转换行 + 色块 |
| Regex Tester | 正则 + 标志 + 测试文本，实时显示匹配数、匹配列表与高亮预览 | 正则/标志/文本 + 结果区 |

### 实现说明

- **SHA**：WebView 内使用 Web Crypto `crypto.subtle.digest`（Chromium 内置，无运行时依赖），右侧哈希行的哈希值只读可复制；右键菜单提供 `SHA-256 Hash` 原地替换命令（`crypto.createHash('sha256')`）。
- **JWT**：纯浏览器端 base64url 解码（`atob` + `TextDecoder`），校验三段式结构，解码失败给出 i18n 错误提示。
- **Color**：纯 JS 解析 HEX（3/4/6/8 位）/ rgb()/rgba()/hsl()/hsla()，统一转为 {r,g,b,a} 后再格式化输出。
- **Regex**：`text.matchAll`（强制追加 `g`）收集匹配，`<mark>` 包裹生成高亮预览，非法正则捕获后提示。
- 4 个工具均实现 `onLocaleChange` postMessage 原地更新文案，均支持 `{type:'setInput'}` 填充。

## 文件变更

- `src/tools/converters/{sha,jwt,color,regex}.ts` — 4 个 Tool 实现（getter 式 name/description + onLocaleChange）
- `src/webviews/{shaWebview,jwtWebview,colorWebview,regexWebview}.ts` — 4 个 WebView 构建器（getXxxUI / getXxxWebviewContent 模式）
- `src/tools/converters/index.ts` — converterTools 尾部追加 4 个工具（Tree View 展示顺序）
- `src/i18n/index.ts` — `tool.sha/jwt/color/regex.*` 双语文案
- `src/commands/textConvert.ts` — 新增 `sha256Hash()`（SHA-256 原地哈希）
- `src/extension.ts` — 注册 `openSha / shaHash / openJwt / openColor / openRegex`，disabled 列表追加 `shaHashDisabled`
- `package.json` — 6 个新命令、4 个新 submenu、菜单挂载与图标（ThemeIcon：key / lock / symbol-color / regex）

## 右键菜单结构（CodeKit 末尾追加 4 个分类）

```
CodeKit（编辑器焦点时始终显示）
  ├─ SHA
  │    ├─ Open SHA Hash          （打开 WebView；始终可用）
  │    └─ SHA-256 Hash           （选中文本 → SHA-256，原地替换；需选中文本）
  ├─ JWT
  │    └─ Open JWT Decoder       （打开 WebView；始终可用）
  ├─ Color
  │    └─ Open Color Converter   （打开 WebView；始终可用）
  └─ Regex
       └─ Open Regex Tester      （打开 WebView，填充选中文本到测试窗；始终可用）
```

- `SHA-256 Hash` 需 `editorHasSelection`，无选中时显示 `(需选中文字)` disabled 占位（硬编码中文标题，与现有命令一致）
- 其余 `Open xxx` 命令不要求选中文本；面板已打开时 `reveal` 跳转并 `postMessage({type:'setInput'})` 填充
- Regex 的 setInput 填充到「测试文本」窗

## 版本号

`package.json` version 由 `0.0.8` 升至 `0.0.9`。