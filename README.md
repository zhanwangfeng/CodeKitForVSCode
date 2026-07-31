# CodeKit For VSCode

> 一个 VSCode 扩展工具箱：把常用的开发小工具收进侧边栏，随时取用。

CodeKit For VSCode 是一款基于 VSCode Extension API 打造的工具集扩展。它通过 **Activity Bar（活动栏）的自定义图标入口** 进入主侧边栏的 **Tree View 树形列表**，将各种开发场景中反复出现的小需求沉淀为一个个可即点即用的工具。

## 特性

- **自定义活动栏入口**：Activity Bar 专属 CodeKit 图标，一键进入工具面板
- **树形工具列表**：主侧边栏 "Tools" 视图集中展示全部工具，点击即用
- **WebView 展示**：工具可在编辑器主区域打开 WebView 标签页，支持炫酷的动画与交互
- **易于扩展**：新增工具只需实现 `Tool` 接口并在注册表中登记，即可出现在列表
- **零运行时依赖**：WebView 页面基于原生 HTML/CSS/JS，无外部依赖

## 内置工具

| 工具 | 说明 |
| --- | --- |
| Hello World | 打开一个带动画效果的 WebView 标签页，作为首个示例工具 |
| JSON Parser | 实时解析 JSON 字符串，左右分栏展示可编辑的树状结构 |

## 项目结构

```
CodeKitForVSCode/
├── src/
│   ├── extension.ts            # 扩展入口：注册命令与 Tree View
│   ├── tree/
│   │   └── toolsTreeProvider.ts # 树形列表数据提供者
│   ├── tools/
│   │   ├── tool.ts             # Tool 接口定义
│   │   ├── helloWorld.ts       # Hello World 工具
│   │   ├── jsonParser.ts       # JSON Parser 工具
│   │   └── index.ts            # 工具注册表
│   └── webviews/
│       ├── helloWorldWebview.ts # WebView 页面内容
│       └── jsonParserWebview.ts # JSON 解析 WebView 页面
├── resources/
│   └── icon.svg                # 活动栏自定义图标
└── docs/
    └── ai-workflow.md          # 开发流程规范
```

## 开发

```bash
npm install
npm run compile
```

按 `F5` 打开 "Run Extension" 调试窗口进行测试。

### 新增一个工具

1. 在 `src/tools/` 下新建文件，实现 `Tool` 接口：

```ts
import * as vscode from 'vscode';
import { Tool } from './tool';

export const myTool: Tool = {
  id: 'my-tool',
  name: 'My Tool',
  description: '工具描述',
  commandId: 'codeKit.myTool',
  icon: new vscode.ThemeIcon('zap'),
  run() {
    vscode.window.showInformationMessage('Hello from My Tool!');
  },
};
```

2. 在 `src/tools/index.ts` 的 `tools` 数组中登记：

```ts
export const tools: readonly Tool[] = [helloWorldTool, myTool];
```

3. 重新编译并点击刷新按钮（或重载窗口）即可看到新工具。

## 打包

```bash
npm run package
```

产物为 `release/code-kit-for-vscode-<version>.vsix`，可安装到任意 VSCode。

## 版本

- **0.0.1**：活动栏图标入口 + Tree View 工具列表 + Hello World 动画工具
- **0.0.2**：JSON Parser 工具（实时解析、可编辑树状图、展开/单行/示例按钮、自动换行）

## License

MIT
