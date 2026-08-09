# Change Log

## [0.0.12] - 2026-08-09

### Added

- 添加网页版链接

## [0.0.11] - 2026-08-08

### Added

- 添加筛选inputbox
- 筛选时包含工具名称与描述

## [0.0.10] - 2026-08-08

### Added

- **HTML 实体编码/解码工具**：左明文右实体，双向实时同步；编码 `& < > " '` 等 HTML 特殊字符，支持解码还原（复用通用双栏构建器，与 URL Encode 一致）
- **文本统计工具 (Text Counter)**：输入文本实时统计字符数、UTF-8 字节数、单词数、行数与去空白字符数（统计卡片网格 + 专用 WebView）
- **右键菜单补充**：CodeKit 子菜单新增 2 个分类
  - **HTML Encode**：Open HTML Encode/Decode / HTML Encode / HTML Decode（选中文本原地替换）
  - **Text Counter**：Open Text Counter（打开 WebView 并填充选中文本）
- **HTML 实体原地替换命令** `src/commands/textConvert.ts`：新增 `htmlEncode()` / `htmlDecode()`
- **HTML Encode / HTML Decode disabled 占位命令**：无选中文字时显示灰色 `(需选中文字)` 菜单项

## [0.0.9] - 2026-08-08

### Added

- **SHA 哈希工具**：选择 SHA-1 / SHA-256 / SHA-512 算法，实时计算输入文本哈希（WebView 内使用 Web Crypto，无运行时依赖）
- **JWT 解码工具**：粘贴 JWT，解码展示 header / payload 与 signature 十六进制，UTF-8 安全
- **颜色转换工具**：输入任意格式颜色（HEX/RGB/HSL），实时互转并输出色块预览
- **正则测试工具**：正则 + 标志（g/i/m/s/u）+ 测试文本，实时显示匹配数、匹配列表与高亮预览
- **右键菜单补充**：CodeKit 子菜单新增 4 个分类
  - **SHA**：Open SHA Hash / SHA-256 Hash（选中文本原地替换）
  - **JWT**：Open JWT Decoder（打开 WebView）
  - **Color**：Open Color Converter（打开 WebView 并填充选中文本）
  - **Regex**：Open Regex Tester（打开 WebView 并填充选中文本到测试窗）
- **SHA-256 原地替换命令** `src/commands/textConvert.ts`：新增 `sha256Hash()`，选中文本 → SHA-256 哈希，失败不编辑
- **SHA-256 Hash disabled 占位命令**：无选中文字时显示灰色 `(需选中文字)` 菜单项

## [0.0.8] - 2026-08-02

### Added

- **扩展图标**：新增 CodeKit 扩展图标（`</>` 代码括号 + 齿轮，青蓝渐变），在 VS Code 扩展市场和扩展列表中显示
  - 图标尺寸：128×128（打包）、256×256、512×512（源文件）
  - 仅 128×128 打入 vsix 包，其余通过 `.vscodeignore` 排除

## [0.0.7] - 2026-08-02

### Added

- **编辑器右键菜单**：在 VS Code 编辑器右键菜单中增加 CodeKit 子菜单，共 9 个分类、24 个命令
  - **Json**：Open JSON Parser（打开 WebView 填充选中文本）/ JSON Expand（格式化原地替换）/ JSON Collapse（压缩原地替换）
  - **Base64**：Open Base64（填充明文窗）/ Base64 Encode / Base64 Decode（原地替换）
  - **URL**：Open URL Encoder（填充明文窗）/ URL Encode / URL Decode（原地替换）
  - **Unicode**：Open Unicode（填充明文窗）/ Unicode Escape / Unicode Unescape（原地替换）
  - **Unix Time**：Open Unix Time / Insert Current Time（替换选中或插入光标位置）
  - **MD5**：Open MD5（填充输入窗）/ MD5 Hash（原地替换）
  - **UUID**：Open UUID / Insert UUID（替换选中或插入光标位置）
  - **Variable Name**：Open Variable Name（填充输入窗）/ camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE（原地替换）
- **HelloWorld 右键菜单开关**：HelloWorld WebView 左上角新增 checkbox，默认勾选，通过 VS Code `configuration`（`codeKit.contextMenuEnabled`）持久化
- **原地替换命令实现** `src/commands/textConvert.ts`：取选中文本 → 转换 → `editor.edit()` 替换选区，失败时 `showErrorMessage`
- **JSON 格式化命令** `src/commands/jsonFormat.ts`：选中文本原地展开/收起
- **需选中文本的命令在无选中时显示 disabled 状态**：带"(需选中文字)"后缀的灰色不可点击占位菜单项（通过命令级 `enablement: "editorHasSelection"` 实现）
- **Open xxx 命令填充选中文本**：打开 WebView 时将选中文本填充到对应输入窗并触发解析/转换；面板已存在时 `reveal` 跳转并 `postMessage` 填充
- 各 WebView 新增 `setInput` 消息监听器与 `initialText` 参数
- `activationEvents: onStartupFinished` 确保扩展启动时激活

### Changed

- `Tool.run()` 接口新增 `initialText?: string` 参数，所有 9 个工具实现已更新
- urlEncode 工具 commandId 从 `codeKit.urlEncode` 改为 `codeKit.urlEncoder`（避免与右键菜单编码命令重名）
- i18n 新增 `hello.contextMenu` / `jsonFormat.error.parse` / `convert.error.decode` 键

### Fixed

- urlEncode 工具 commandId 与右键菜单命令重名导致 `command already exists` 错误，扩展激活中断，后续命令全部未注册
- 缺少 `activationEvents` 导致扩展未在启动时激活，右键菜单不显示

## [0.0.6] - 2026-08-02

### Added

- **7 个格式化/转换工具**：与 Hello World、JSON Parser 并列，共 9 个工具
  - **Unix 时间**：Unix 时间戳与日期互转（秒/毫秒自动识别，全球时区下拉，默认填充当前时间）
  - **Base64**：Base64 编码/解码（左右布局双向编辑，UTF-8 安全，解码失败小灯泡提示）
  - **Unicode**：文本与 `\uXXXX` 转义互转（左转义右明文）
  - **UUID**：批量生成 RFC 4122 v4 UUID（大小写，逐行复制）
  - **MD5**：计算输入文本的 MD5 哈希（内联 blueimp-md5，UTF-8 安全）
  - **URL 编码**：URL 组件编码/解码
  - **变量名转换**：camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE 互转
- **Converter 通用框架**：所有转换工具共享一套 WebView 模板（操作按钮 + 输入 + 只读输出 + 实时转换）
  - 转换逻辑以纯函数定义在 TS 侧，通过 `convert.toString()` 内联进 WebView，保留正则字面量与转义
  - 外部算法（MD5）以资源文件在构建期内联为 `<script>`，在转换函数之前提供全局
  - 新增同类工具只需写一个 spec 文件 + 加 i18n 键，零框架改动
- **WebView 面板复用**：点击工具复用已打开的面板（跳转到第一个实例），右键菜单"打开新窗口"可强制新建
  - `panelRegistry: Map<string, Set<WebviewPanel>>` 管理各工具的已打开面板，面板关闭时自动移除
- **语言切换实时响应**：Hello World 切换语言后，所有已打开 WebView 原地更新全部文案（不重建页面）
  - `Tool.onLocaleChange` 接口：扩展通过 `postMessage` 通知 WebView 更新标题/按钮/占位符/动态内容
  - 各 WebView 按 `data-i18n*` 属性批量刷新 DOM，Unix Time 重建时区列表，UUID 重新渲染列表

### Changed

- `src/i18n` 新增 7 个工具的双语文案与 Converter 通用 UI 文案
- `tools` 注册表扩展为 9 个工具
- Tree View 工具项支持右键上下文菜单（`viewItem == tool` 时显示"打开新窗口"）

## [0.0.5] - 2026-08-01

### Added

- **多语言支持（i18n）**：插件内部自管理的英文 / 简体中文双语切换，不依赖 `package.nls`
  - 新增 `src/i18n/index.ts` 统一管理所有可翻译文案的双语字典 + 语言状态 + 持久化
  - 语言设置入口置于 Hello World WebView 右上角（English / 简体中文 按钮）
  - 选择经 `postMessage` 通知扩展，写入 `context.globalState`（跨会话持久化）
  - JSON Parser 打开时按当前语言构建：静态文案直接渲染，动态提示注入已解析 i18n 对象
  - 工具元数据（`Tool.name`/`Tool.description`）改用 getter 动态返回当前语言，切换后刷新 Tree View

### Changed

- Hello World / JSON Parser WebView 全部用户可见文案（标题、按钮、占位符、提示、错误信息、树节点 hover 提示）改为英文源串 + 中文翻译
- `package.json` 贡献项（命令标题/视图名）保持英文，不与内部 i18n 混合

## [0.0.4] - 2026-07-31

### Added

- **JSON 语法高亮**：
  - 文本窗：基于 Prism.js 的实时语法高亮，覆盖属性名/字符串/数字/布尔值/null/标点符号
  - 编辑窗：树形值按类型着色（修复 CSS 变量缺失 fallback 导致颜色不显示的问题）
  - 高亮颜色使用 VSCode 主题变量 + fallback，与 VSCode 内置 JSON 高亮规则一致
  - Prism.js 核心库 + JSON 语言定义内联到 WebView（共约 8KB，无外部依赖）

### Fixed

- 编辑窗 `.tree-value.*` CSS 缺少 fallback 颜色，导致 `--vscode-json-*` 变量在 WebView 中不存在时值显示为白色

## [0.0.3] - 2026-07-31

### Changed

- JSON Parser 编辑器重构为**重叠双窗口模式**：
  - 文本窗（textarea 输入区）与编辑窗（树形编辑区）重叠显示，通过顶部标签按钮切换
  - 两窗口共用工具栏按钮（展开/收起/示例/清空/复制/自动换行/行号）
  - 原左右分栏布局移除
- **展开/收起按钮**按当前激活窗口执行不同操作：
  - 文本窗：展开=格式化 JSON（2 空格缩进），收起=压缩为单行
  - 编辑窗：展开=展开所有树节点，收起=收起所有子节点
  - 原单行按钮重命名为"收起"
- **复制按钮**按当前窗口复制不同内容：
  - 文本窗：复制 textarea 当前内容（收起后是一行就复制一行）
  - 编辑窗：复制格式化的完整 JSON
- 树节点箭头位置优化：有 key 的节点箭头移到冒号后（`features: ▶ [...] array`）

### Added

- **行号显示**：新增"行号"复选框，勾选后文本窗和编辑窗均显示行号
  - 文本窗：左侧行号列，与文本同步滚动
  - 编辑窗：CSS counter 自动编号，absolute 定位左对齐，折叠/展开后自动重编号
- **错误指示器**：JSON 语法错误时左下角显示灯泡图标，鼠标悬停显示错误详情（行号/列号/原因）
  - 错误时不自动切换窗口，仅在文本窗提示

### Fixed

- 修复 × 删除按钮无效果的问题（移除 WebView 不支持的原生 confirm 弹窗）
- 修复点击示例按钮强制切回文本窗的问题

## [0.0.2] - 2026-07-31

### Added

- JSON Parser 工具：实时解析 JSON 字符串并可视化展示
- 左侧输入区支持实时输入 JSON 字符串（300ms 防抖）
- 右侧结果区：
  - 解析成功：展示可折叠/展开的树状结构，显示类型标签
  - 解析失败：展示详细的错误信息（包含行号和列号）
- 树状图可编辑功能：
  - 点击原始类型值（string/number）可编辑
  - 点击布尔值可切换 true/false
  - 点击 null 可改为其他类型
  - 点击对象键名可重命名
  - 数组/对象支持添加和删除子节点
  - 所有编辑操作后左侧 JSON 实时同步刷新
- 左侧工具栏按钮：
  - **展开**：格式化 JSON（2 空格缩进）
  - **单行**：压缩 JSON 为单行显示
  - **示例**：加载预设的示例 JSON 数据
  - **清空**：清空编辑区
- 右侧工具栏按钮：
  - **复制**：复制当前 JSON 到剪贴板
- 自动换行复选框：同时控制左右两侧的文本换行行为

### Fixed

- 修复键名编辑后按 Enter 无效的 Bug（改用全局 keyup 监听 + 修正父路径计算）
- 修复点击示例按钮后解析结果未实时更新的 Bug（编程式赋值后手动触发 parseJSON）
- 修复取消自动换行后右侧树状图仍自动换行的 Bug（添加 CSS 类切换与 JS inline style 双保险）

## [0.0.1] - 2026-07-31

### Added

- Activity Bar（活动栏）添加自定义 CodeKit 图标入口
- 点击图标在主侧边栏打开 "Tools" Tree View 树形列表
- 第一个工具：Hello World（点击在编辑器主区域打开 WebView 动画标签页）
- 视图标题栏刷新按钮
