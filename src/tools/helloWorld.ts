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
  run(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.helloWorld',
      t('tool.helloWorld.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getHelloWorldWebviewContent();

    // Hello World 内的语言选择器通过 postMessage 通知扩展
    // 必须存储 disposable，否则监听器可能被 GC 回收导致语言切换失效
    context.subscriptions.push(
      panel.webview.onDidReceiveMessage((msg) => {
        if (msg && msg.type === 'setLocale' && (msg.locale === 'en' || msg.locale === 'zh-cn')) {
          if (getLocale() === msg.locale) {
            return;
          }
          setLocale(msg.locale);
          // 刷新 Tree View 工具名/描述，并通过 onLocaleChange 通知所有已打开面板（含自身）更新文案
          vscode.commands.executeCommand('codeKit.refreshTools');
          vscode.commands.executeCommand('codeKit.updatePanelTitles');
        }
      }),
    );
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage(getHelloWorldLocalePayload());
  },
};
