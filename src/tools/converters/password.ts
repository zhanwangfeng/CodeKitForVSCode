/** 密码生成器工具：打开专用 WebView（长度/数量/字符集可配，批量生成强密码）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getPasswordUI, getPasswordWebviewContent } from '../../webviews/passwordWebview';
import { Tool } from '../tool';

export const passwordTool: Tool = {
  id: 'password',
  get name() {
    return t('tool.password.name');
  },
  get description() {
    return t('tool.password.description');
  },
  commandId: 'codeKit.password',
  icon: new vscode.ThemeIcon('lock'),
  run(context: vscode.ExtensionContext, _initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.password',
      t('tool.password.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getPasswordWebviewContent();
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getPasswordUI() });
  },
};
