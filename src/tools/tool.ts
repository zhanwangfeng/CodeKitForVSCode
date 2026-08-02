/** Tool 接口定义：每个工具需提供 id/name/description/commandId/icon/run。 */
import * as vscode from 'vscode';

export interface Tool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly commandId: string;
  readonly icon?: vscode.ThemeIcon;
  run(context: vscode.ExtensionContext, initialText?: string): vscode.WebviewPanel;
  /** 语言切换时通知已打开的 WebView 原地更新文案（postMessage）；未实现则仅更新面板标签标题 */
  onLocaleChange?(panel: vscode.WebviewPanel): void;
}
