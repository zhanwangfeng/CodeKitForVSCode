# CodeKit 设计文档 v0.0.6

## 一、目标

新增 7 个独立的格式化/转换工具，与 HelloWorld、JSON Parser 并列为 Tree View 菜单项（共 9 个工具）：

1. **Unix 时间** — Unix 时间戳与人类可读日期互转
2. **Base64** — Base64 编码/解码（UTF-8 安全）
3. **Unicode** — 文本与 `\uXXXX` 转义互转
4. **UUID** — 生成 RFC 4122 v4 UUID（可批量、大小写）
5. **MD5** — 计算输入文本的 MD5 哈希
6. **URL 编码** — URL 组件编码/解码
7. **变量名转换** — camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE 互转

## 二、设计原则

- **统一框架、强扩展性**：7 个工具形态一致（输入 → 选操作 → 输出），用一个通用 Converter 框架承载。新增同类工具只需写一个 spec 文件 + 加 i18n 键，零框架改动。
- **沿用 0.0.5 的 i18n 体系**：所有文案经 `src/i18n` 的 `t()` 渲染，工具名/描述用 getter，切换语言后刷新 Tree View 即变。
- **不混 package.json**：参考 jsonParser 先例，工具启动命令不写入 `contributes.commands`，由 `extension.ts` 从 `tools` 数组自动注册；仅更新版本号。
- **转换逻辑在 WebView 内运行**：实时转换、零网络往返。算法以纯函数形式定义在 TS 侧，通过 `convert.toString()` 内联进 WebView（保留嵌套函数与正则字面量，规避模板字符串转义坑）。MD5 等外部算法以独立资源文件在构建期内联。

## 三、Converter 框架

### 3.1 数据结构

`src/tools/converters/types.ts`：

```ts
export interface ConverterOperation {
  id: string;            // 'encode' | 'decode' | ...
  labelKey: string;      // i18n 键，按钮文案
  isDefault?: boolean;
}

export interface ConverterSpec {
  id: string;
  nameKey: string;       // 工具名 i18n 键
  descKey: string;       // 工具描述 i18n 键
  commandId: string;
  icon: vscode.ThemeIcon;
  placeholderKey: string;// 输入框 placeholder i18n 键
  operations: ConverterOperation[];
  /** 转换函数（自包含，在 WebView 内运行）。通过 toString() 内联。 */
  convert: (input: string, op: string) => string;
  /** 可选：算法资源相对路径（相对 resources/），构建期内联为 <script>，在 convert 之前执行 */
  helperFile?: string;
}
```

### 3.2 工具工厂

`src/tools/converters/converterTool.ts` 的 `makeConverterTool(spec)`：把 spec 包装成 `Tool`（name/description 用 getter 走 `t()`），`run()` 创建 WebView 并填充 `getConverterWebviewContent(spec)`。

### 3.3 WebView 构建器

`src/webviews/converterWebview.ts` 的 `getConverterWebviewContent(spec)`：

- **布局**（单列，VS Code 主题变量着色，与 JSON Parser 视觉一致）：
  - 顶部工具条：左侧操作按钮组（互斥单选，默认操作高亮），右侧「复制」按钮
  - 输入区：`<textarea>`，placeholder 来自 `t(spec.placeholderKey)`
  - 输出区：只读 `<textarea>`
- **内联脚本**：先内联 `helperFile`（若有，如 MD5），再注入 `const convert = ${spec.convert.toString()};`，再注入操作列表（含本地化 label）。
- **交互**：输入变更防抖 200ms 自动转换；切换操作立即转换；转换异常时输出区显示错误信息；复制按钮复制输出文本并给出已复制提示。
- **i18n**：通用 UI（输入/输出/复制/已复制/错误）走 `t()`；操作 label 走 `t(op.labelKey)`。

## 四、7 个工具的 spec

| 工具 | id / commandId | 操作 | 说明 |
| --- | --- | --- | --- |
| Unix 时间 | `unix-time` / `codeKit.unixTime` | `toDate`（→日期）、`toStamp`（→时间戳） | 时间戳秒/毫秒自动识别；→日期输出 ISO/UTC/本地/秒/毫秒多行 |
| Base64 | `base64` / `codeKit.base64` | `encode`、`decode` | 用 TextEncoder/TextDecoder 保证 UTF-8 安全 |
| Unicode | `unicode` / `codeKit.unicode` | `encode`、`decode` | 编码仅转义非 ASCII；解码还原 `\uXXXX`（含代理对） |
| UUID | `uuid` / `codeKit.uuid` | `lower`、`upper` | 输入框为生成数量（默认 1，上限 1000），优先用 `crypto.randomUUID()` |
| MD5 | `md5` / `codeKit.md5` | `lower`、`upper` | `helperFile: 'md5/md5.min.js'`（blueimp-md5，已验证 UTF-8），convert 调用全局 `md5()` |
| URL 编码 | `url-encode` / `codeKit.urlEncode` | `encode`、`decode` | `encodeURIComponent` / `decodeURIComponent` |
| 变量名转换 | `var-name` / `codeKit.varName` | `camel`、`snake`、`kebab`、`pascal`、`constant` | 先按 `_`/`-`/空格/驼峰边界拆词，再按目标格式拼接 |

## 五、i18n 扩充

在 `src/i18n/index.ts` 的 `messages` 中新增：

- 通用：`converter.input` / `converter.output` / `converter.copy` / `converter.copied` / `converter.error`
- 每个工具：`tool.<key>.name`、`tool.<key>.description`、`<key>.placeholder`、每个操作的 `<key>.<op>` label 键

变量名操作 label（camelCase 等）为代码风格名称，中英相同。

## 六、注册与产物

- `src/tools/converters/index.ts`：导出 `converterTools: readonly Tool[]`（7 个，顺序按上表）。
- `src/tools/index.ts`：`tools = [helloWorldTool, jsonParserTool, ...converterTools]`。
- `extension.ts`：无需改动（自动注册）。
- `package.json`：版本号 → `0.0.6`；不动 `contributes.commands`。
- 新增文件：`src/tools/converters/{types,converterTool,index,unixTime,base64,unicode,uuid,md5,urlEncode,varName}.ts`、`src/webviews/converterWebview.ts`、`resources/md5/md5.min.js`。

## 七、测试方式

`F5` 启动扩展宿主：
1. Tree View 出现 9 个工具，名称随当前语言（英文/简体）切换变化。
2. 逐个打开 7 个工具，验证各操作编码/解码往返正确（Base64/Unicode/URL 编码后再解码应还原原文；Unix 时间双向往返；UUID 合规；MD5 与已知值对照，如 `md5('test')=098f6bcd4621d373cade4e832627b4f6`；变量名各格式互转）。
3. 在 Hello World 切语言后重开工具，文案随之变化。
