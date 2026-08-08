/** JWT 解码工具：打开专用 WebView（粘贴 token，展示解码后的 header / payload / signature）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getJwtUI, getJwtWebviewContent } from '../../webviews/jwtWebview';
import { Tool } from '../tool';

export const jwtTool: Tool = {
  id: 'jwt',
  get name() {
    return t('tool.jwt.name');
  },
  get description() {
    return t('tool.jwt.description');
  },
  commandId: 'codeKit.jwt',
  icon: new vscode.ThemeIcon('lock'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.jwt',
      t('tool.jwt.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getJwtWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getJwtUI() });
  },
};
