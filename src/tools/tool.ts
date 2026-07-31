import * as vscode from 'vscode';

export interface Tool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly commandId: string;
  readonly icon?: vscode.ThemeIcon;
  run(context: vscode.ExtensionContext): void;
}
