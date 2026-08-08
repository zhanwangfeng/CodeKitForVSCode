/** SHA 哈希工具：打开专用 WebView（选择 SHA-1/SHA-256/SHA-512 算法，实时计算哈希值）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getShaUI, getShaWebviewContent } from '../../webviews/shaWebview';
import { Tool } from '../tool';

export const shaTool: Tool = {
  id: 'sha',
  get name() {
    return t('tool.sha.name');
  },
  get description() {
    return t('tool.sha.description');
  },
  commandId: 'codeKit.sha',
  icon: new vscode.ThemeIcon('key'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.sha',
      t('tool.sha.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getShaWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getShaUI() });
  },
};
