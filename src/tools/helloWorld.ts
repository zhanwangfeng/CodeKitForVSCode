import * as vscode from 'vscode';
import { getHelloWorldWebviewContent } from '../webviews/helloWorldWebview';
import { Tool } from './tool';

export const helloWorldTool: Tool = {
  id: 'hello-world',
  name: 'Hello World',
  description: '第一个工具：打开 Hello World 动画',
  commandId: 'codeKit.helloWorld',
  icon: new vscode.ThemeIcon('smiley'),
  run() {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.helloWorld',
      'Hello World',
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getHelloWorldWebviewContent();
  },
};
