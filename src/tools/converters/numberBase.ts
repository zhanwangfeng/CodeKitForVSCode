/** 进制转换工具：打开专用 WebView（输入任意进制数字，实时输出二进制/八进制/十进制/十六进制）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getNumberBaseUI, getNumberBaseWebviewContent } from '../../webviews/numberBaseWebview';
import { Tool } from '../tool';

export const numberBaseTool: Tool = {
  id: 'numberBase',
  get name() {
    return t('tool.numberBase.name');
  },
  get description() {
    return t('tool.numberBase.description');
  },
  commandId: 'codeKit.numberBase',
  icon: new vscode.ThemeIcon('symbol-numeric'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.numberBase',
      t('tool.numberBase.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getNumberBaseWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getNumberBaseUI() });
  },
};
