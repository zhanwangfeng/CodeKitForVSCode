# CodeKit 设计文档 v0.0.1

## 目标

开发第一个版本：

- Activity Bar（活动栏）添加自定义图标入口
- 点击图标，在主侧边栏打开 Tree View 树形列表
- 展示工具列表，第一个工具为 Hello World

## 界面结构

- `viewsContainers.activitybar`：`codeKit` 容器，图标 `resources/icon.svg`
- `views.codeKit`：`codeKit.views.tools`，名称 "Tools"
- 树形列表项：每个工具一个节点，点击执行工具命令
- Hello World 工具：点击后在编辑器主区域打开 WebView 标签页，展示动画效果

## 架构

```
src/
  extension.ts                # 入口：注册工具命令与 Tree View
  tree/
    toolsTreeProvider.ts      # TreeView 数据提供者
  tools/
    tool.ts                   # Tool 接口定义
    helloWorld.ts             # 第一个工具（打开 WebView）
    index.ts                  # 工具注册表（后续工具在此扩展）
  webviews/
    helloWorldWebview.ts      # Hello World 动画页面内容
resources/
  icon.svg                    # 活动栏自定义图标
```

- 工具通过 `Tool` 接口描述（id / name / description / commandId / icon / run）
- 工具列表在 `src/tools/index.ts` 中集中注册，新增工具只需添加文件并在此登记
- 点击树形节点触发对应命令，命令回调调用 `tool.run(context)`
- WebView 页面使用 `enableScripts` 与 CSP 内联脚本，无外部依赖
