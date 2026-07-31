import * as vscode from 'vscode';
import { getJsonParserWebviewContent } from '../webviews/jsonParserWebview';
import { Tool } from './tool';

export const jsonParserTool: Tool = {
  id: 'json-parser',
  name: 'JSON Parser',
  description: 'JSON解析工具：实时解析JSON字符串，可视化展示',
  commandId: 'codeKit.jsonParser',
  icon: new vscode.ThemeIcon('json'),
  run() {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.jsonParser',
      'JSON Parser',
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getJsonParserWebviewContent();
  },
};