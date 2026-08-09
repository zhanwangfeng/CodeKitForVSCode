/** SQL 格式化工具：打开专用 WebView（左输入右输出，实时格式化，支持关键字大写/缩进选项）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getSqlUI, getSqlWebviewContent } from '../../webviews/sqlWebview';
import { Tool } from '../tool';

export const sqlTool: Tool = {
  id: 'sql',
  get name() {
    return t('tool.sql.name');
  },
  get description() {
    return t('tool.sql.description');
  },
  commandId: 'codeKit.sql',
  icon: new vscode.ThemeIcon('database'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.sql',
      t('tool.sql.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getSqlWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getSqlUI() });
  },
};
