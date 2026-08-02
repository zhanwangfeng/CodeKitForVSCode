/** 扩展入口：初始化 i18n、注册各工具命令与 Tools Tree View，管理 WebView 面板复用。 */
import * as vscode from 'vscode';
import { initI18n } from './i18n';
import { ToolsTreeProvider } from './tree/toolsTreeProvider';
import { tools } from './tools';
import { Tool } from './tools/tool';

/** 面板注册表：toolId → 已打开的面板集合（保持插入顺序） */
const panelRegistry = new Map<string, Set<vscode.WebviewPanel>>();

/** 注册面板到注册表，并在面板关闭时自动移除 */
function registerPanel(toolId: string, panel: vscode.WebviewPanel): void {
  if (!panelRegistry.has(toolId)) {
    panelRegistry.set(toolId, new Set());
  }
  const set = panelRegistry.get(toolId)!;
  set.add(panel);
  panel.onDidDispose(() => {
    set.delete(panel);
    if (set.size === 0) {
      panelRegistry.delete(toolId);
    }
  });
}

export function activate(context: vscode.ExtensionContext): void {
  initI18n(context);

  // 每个工具注册命令：点击时复用已有面板，无则新建
  for (const tool of tools) {
    context.subscriptions.push(
      vscode.commands.registerCommand(tool.commandId, () => {
        const panels = panelRegistry.get(tool.id);
        if (panels && panels.size > 0) {
          // 已有面板：跳转到第一个
          const first = panels.values().next().value;
          if (first) {
            first.reveal(vscode.ViewColumn.Active, false);
          }
          return;
        }
        // 无已有面板：新建
        const panel = tool.run(context);
        registerPanel(tool.id, panel);
      }),
    );
  }

  // 右键菜单"打开新窗口"命令：始终新建面板
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openNewWindow', (tool?: Tool) => {
      if (!tool) {
        return;
      }
      const panel = tool.run(context);
      registerPanel(tool.id, panel);
    }),
  );

  const treeProvider = new ToolsTreeProvider(tools);
  context.subscriptions.push(
    vscode.window.createTreeView('codeKit.views.tools', { treeDataProvider: treeProvider }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.refreshTools', () => treeProvider.refresh()),
  );

  // 语言切换时更新所有已打开面板的标签标题，并通过 onLocaleChange 通知 WebView 原地更新全部文案
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.updatePanelTitles', () => {
      for (const tool of tools) {
        const panels = panelRegistry.get(tool.id);
        if (panels) {
          for (const panel of panels) {
            panel.title = tool.name;
            if (tool.onLocaleChange) {
              tool.onLocaleChange(panel);
            }
          }
        }
      }
    }),
  );
}

export function deactivate(): void {}
