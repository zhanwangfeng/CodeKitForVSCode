/** Hello World 工具：打开动画 WebView，右上角语言选择器，监听 setLocale 持久化并刷新 Tree View。 */
import * as vscode from 'vscode';
import { getLocale, setLocale, t } from '../i18n';
import { getHelloWorldLocalePayload, getHelloWorldWebviewContent } from '../webviews/helloWorldWebview';
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
  run(context: vscode.ExtensionContext, _initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.helloWorld',
      t('tool.helloWorld.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    const contextMenuEnabled = vscode.workspace.getConfiguration('codeKit').get<boolean>('contextMenuEnabled', true);
    panel.webview.html = getHelloWorldWebviewContent(contextMenuEnabled);

    // Hello World 内的语言选择器和右键菜单开关通过 postMessage 通知扩展
    context.subscriptions.push(
      panel.webview.onDidReceiveMessage((msg) => {
        if (msg && msg.type === 'setLocale' && (msg.locale === 'en' || msg.locale === 'zh-cn')) {
          if (getLocale() === msg.locale) {
            return;
          }
          setLocale(msg.locale);
          vscode.commands.executeCommand('codeKit.refreshTools');
          vscode.commands.executeCommand('codeKit.updatePanelTitles');
        } else if (msg && msg.type === 'toggleContextMenu') {
          vscode.commands.executeCommand('codeKit.toggleContextMenu', msg.enabled);
        }
      }),
    );
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage(getHelloWorldLocalePayload());
  },
};
