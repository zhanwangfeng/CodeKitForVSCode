/** MD5 工具：打开专用 WebView（左输入右哈希，大小写切换，实时计算）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getMd5UI, getMd5WebviewContent } from '../../webviews/md5Webview';
import { Tool } from '../tool';

export const md5Tool: Tool = {
  id: 'md5',
  get name() {
    return t('tool.md5.name');
  },
  get description() {
    return t('tool.md5.description');
  },
  commandId: 'codeKit.md5',
  icon: new vscode.ThemeIcon('lock'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.md5',
      t('tool.md5.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getMd5WebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getMd5UI() });
  },
};
