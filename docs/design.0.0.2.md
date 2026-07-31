# CodeKit For VSCode 设计文档 v0.0.2

## 目标

添加JSON解析工具：

- 在工具列表中添加"JSON Parser"工具
- 点击工具打开WebView页面，提供JSON解析与可视化功能
- 左侧为JSON输入区，实时解析
- 右侧为结果展示区：解析成功显示可编辑的树状结构，解析失败显示错误信息

## 界面结构

- 工具树形列表新增节点："JSON Parser"，图标使用`json`图标
- 点击节点打开WebView编辑器标签页，标题为"JSON Parser"
- WebView页面布局：
  - 左侧：多行文本输入框（textarea），用于输入JSON字符串
  - 右侧：结果展示区
    - 解析成功：展示可折叠/展开的树状结构，支持编辑值
    - 解析失败：展示红色错误提示信息
  - 左右区域使用flex布局，可调整分割线比例（使用CSS resize）

## 架构

```
src/
  tools/
    jsonParser.ts             # JSON解析工具（新增）
    index.ts                  # 工具注册表（修改：添加jsonParserTool）
  webviews/
    jsonParserWebview.ts      # JSON解析WebView页面（新增）
```

### 新增文件

1. **src/tools/jsonParser.ts**
   - 实现`Tool`接口
   - `id: 'json-parser'`
   - `name: 'JSON Parser'`
   - `description: 'JSON解析工具：实时解析JSON字符串，可视化展示'`
   - `commandId: 'codeKit.jsonParser'`
   - `icon: new vscode.ThemeIcon('json')`
   - `run()`方法：创建WebView面板，加载HTML内容

2. **src/webviews/jsonParserWebview.ts**
   - 导出`getJsonParserWebviewContent()`函数
   - 返回完整的HTML页面字符串
   - 包含CSS样式和JavaScript逻辑

### 修改文件

1. **src/tools/index.ts**
   - 在tools数组中添加`jsonParserTool`

## 功能细节

### JSON输入区（左侧）

- 使用`<textarea>`元素
- 实时监听输入事件（`input`事件）
- 每次输入尝试解析JSON
- 提供示例JSON按钮（可选）

### 结果展示区（右侧）

#### 解析成功

- 展示树状结构，使用`<ul>`和`<li>`元素
- 每个节点可折叠/展开（对象和数组）
- 显示类型标签（string/number/boolean/null/object/array）
- 值可编辑（双击或点击编辑按钮）
- 支持添加/删除属性（可选）

#### 解析失败

- 显示错误信息（红色文本）
- 包含错误位置和原因
- 提供修复建议（可选）

### 实时解析

- 使用防抖机制（debounce），避免频繁解析
- 防抖延迟时间：300ms
- 使用`try-catch`捕获解析错误

### 样式设计

- 使用VSCode主题色（通过CSS变量）
- 左右分区使用深色背景区分
- 树状结构使用缩进和连接线
- 成功状态：绿色主题
- 错误状态：红色主题