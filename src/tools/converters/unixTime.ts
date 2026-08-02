/** Unix 时间工具：打开专用 WebView（当前时间戳 + 时间戳↔日期互转）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getUnixTimeUI, getUnixTimeWebviewContent } from '../../webviews/unixTimeWebview';
import { Tool } from '../tool';

export const unixTimeTool: Tool = {
  id: 'unix-time',
  get name() {
    return t('tool.unixTime.name');
  },
  get description() {
    return t('tool.unixTime.description');
  },
  commandId: 'codeKit.unixTime',
  icon: new vscode.ThemeIcon('clock'),
  run() {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.unixTime',
      t('tool.unixTime.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getUnixTimeWebviewContent();
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getUnixTimeUI() });
  },
};
