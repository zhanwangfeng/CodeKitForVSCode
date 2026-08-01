import * as vscode from 'vscode';
import { initI18n } from './i18n';
import { ToolsTreeProvider } from './tree/toolsTreeProvider';
import { tools } from './tools';

export function activate(context: vscode.ExtensionContext): void {
  initI18n(context);

  for (const tool of tools) {
    context.subscriptions.push(
      vscode.commands.registerCommand(tool.commandId, () => tool.run(context)),
    );
  }

  const treeProvider = new ToolsTreeProvider(tools);
  context.subscriptions.push(
    vscode.window.createTreeView('codeKit.views.tools', { treeDataProvider: treeProvider }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.refreshTools', () => treeProvider.refresh()),
  );
}

export function deactivate(): void {}
