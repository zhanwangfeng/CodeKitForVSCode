import * as vscode from 'vscode';
import { getLocale, setLocale, t } from '../i18n';
import { getHelloWorldWebviewContent } from '../webviews/helloWorldWebview';
import { Tool } from './tool';

export const helloWorldTool: Tool = {
  id: 'hello-world',
  get name() {
    return t('tool.helloWorld.name');
  },
  get description() {
    return t('tool.helloWorld.description');
  },
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

    // Hello World 内的语言选择器通过 postMessage 通知扩展
    panel.webview.onDidReceiveMessage((msg) => {
      if (msg && msg.type === 'setLocale' && (msg.locale === 'en' || msg.locale === 'zh-cn')) {
        if (getLocale() === msg.locale) {
          return;
        }
        setLocale(msg.locale);
        // 用新语言重建页面（Hello World 无输入状态，重建最简单）
        panel.webview.html = getHelloWorldWebviewContent();
        // 刷新 Tree View 工具名/描述
        vscode.commands.executeCommand('codeKit.refreshTools');
      }
    });
  },
};
