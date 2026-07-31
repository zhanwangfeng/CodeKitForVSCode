# CodeKit 设计文档 v0.0.2

## 目标

添加 JSON 解析工具：

- 在工具列表中添加 "JSON Parser" 工具
- 点击工具打开 WebView 页面，提供 JSON 解析与可视化功能
- 左侧为 JSON 输入区，实时解析
- 右侧为结果展示区：解析成功显示可编辑的树状结构，解析失败显示错误信息

## 界面结构

- 工具树形列表新增节点："JSON Parser"，图标使用 `json` 图标
- 点击节点打开 WebView 编辑器标签页，标题为 "JSON Parser"
- WebView 页面布局：
  - 左侧：多行文本输入框（textarea），用于输入 JSON 字符串
    - 工具栏：展开、单行、示例、清空
    - 自动换行复选框（控制左右两侧）
  - 右侧：结果展示区
    - 解析成功：展示可折叠/展开的树状结构，支持编辑值
    - 解析失败：展示红色错误提示信息
    - 工具栏：复制
  - 左右区域使用 flex 布局，各占 50% 宽度

## 架构

```
src/
  tools/
    jsonParser.ts             # JSON 解析工具（新增）
    index.ts                  # 工具注册表（修改：添加 jsonParserTool）
  webviews/
    jsonParserWebview.ts      # JSON 解析 WebView 页面（新增）
```

### 新增文件

1. **src/tools/jsonParser.ts**
   - 实现 `Tool` 接口
   - `id: 'json-parser'`
   - `name: 'JSON Parser'`
   - `description: 'JSON 解析工具：实时解析 JSON 字符串，可视化展示'`
   - `commandId: 'codeKit.jsonParser'`
   - `icon: new vscode.ThemeIcon('json')`
   - `run()` 方法：创建 WebView 面板，加载 HTML 内容

2. **src/webviews/jsonParserWebview.ts**
   - 导出 `getJsonParserWebviewContent()` 函数
   - 返回完整的 HTML 页面字符串
   - 包含 CSS 样式和 JavaScript 逻辑

### 修改文件

1. **src/tools/index.ts**
   - 在 tools 数组中添加 `jsonParserTool`

## 功能细节

### JSON 输入区（左侧）

- 使用 `<textarea>` 元素
- 实时监听输入事件（`input` 事件），300ms 防抖
- 按钮功能：
  - **展开**：格式化 JSON（2 空格缩进）
  - **单行**：压缩 JSON 为单行显示
  - **示例**：加载预设的示例 JSON 数据
  - **清空**：清空编辑区
- 自动换行复选框：开启时 textarea 自动换行，关闭时横向滚动

### 结果展示区（右侧）

#### 解析成功

- 展示树状结构，使用 `<div>` 元素
- 每个节点可折叠/展开（对象和数组）
- 显示类型标签（string/number/boolean/null/object/array）
- 树状图可编辑：
  - 点击 string/number 值 → 进入编辑模式，修改后按 Enter 或失焦提交
  - 点击 boolean 值 → 一键切换 true/false
  - 点击 null 值 → 弹窗选择改为其他类型
  - 点击键名 → 重命名对象属性键名
  - 悬停子节点显示 × 删除按钮
  - 悬停父节点显示 + 添加按钮
- 所有编辑操作同步更新数据模型，左侧 textarea 实时刷新
- 自动换行复选框：开启时树状图换行，关闭时横向滚动

#### 解析失败

- 显示错误信息（红色文本）
- 包含错误位置和原因

### 实时解析

- 使用防抖机制（debounce），避免频繁解析
- 防抖延迟时间：300ms
- 使用 `try-catch` 捕获解析错误
- 双向同步：左→右（输入事件触发解析），右→左（编辑操作触发同步）
- 使用 `isUpdatingFromTree` 标志位防止循环触发

### 样式设计

- 使用 VSCode 主题色（通过 CSS 变量）
- 左右分区使用深色背景区分
- 树状结构使用缩进和类型标签着色
- 成功状态：彩色类型标签
- 错误状态：红色主题
- 响应式布局：窗口尺寸变化时 textarea 自动调整
