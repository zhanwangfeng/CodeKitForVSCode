/** Base64 工具：打开专用 WebView（左右布局，左明文右密文，双向实时同步）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getBase64UI, getBase64WebviewContent } from '../../webviews/base64Webview';
import { Tool } from '../tool';

export const base64Tool: Tool = {
  id: 'base64',
  get name() {
    return t('tool.base64.name');
  },
  get description() {
    return t('tool.base64.description');
  },
  commandId: 'codeKit.base64',
  icon: new vscode.ThemeIcon('replace'),
  run() {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.base64',
      t('tool.base64.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getBase64WebviewContent();
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getBase64UI() });
  },
};
