import * as vscode from 'vscode';
import { Tool } from '../tools';

export class ToolsTreeProvider implements vscode.TreeDataProvider<Tool> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<Tool | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly toolList: readonly Tool[]) {}

  getTreeItem(tool: Tool): vscode.TreeItem {
    const item = new vscode.TreeItem(tool.name, vscode.TreeItemCollapsibleState.None);
    item.id = tool.id;
    item.description = tool.description;
    item.tooltip = tool.description;
    item.iconPath = tool.icon ?? new vscode.ThemeIcon('tools');
    item.contextValue = 'tool';
    item.command = {
      command: tool.commandId,
      title: tool.name,
      arguments: [tool],
    };
    return item;
  }

  getChildren(element?: Tool): Tool[] {
    return element ? [] : [...this.toolList];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}
