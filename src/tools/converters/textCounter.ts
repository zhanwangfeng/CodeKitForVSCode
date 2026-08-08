/** 文本统计工具：打开专用 WebView（实时统计字符数/字节数/单词数/行数/去空白字符数）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getTextCounterUI, getTextCounterWebviewContent } from '../../webviews/textCounterWebview';
import { Tool } from '../tool';

export const textCounterTool: Tool = {
  id: 'text-counter',
  get name() {
    return t('tool.textCounter.name');
  },
  get description() {
    return t('tool.textCounter.description');
  },
  commandId: 'codeKit.textCounter',
  icon: new vscode.ThemeIcon('symbol-number'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.textCounter',
      t('tool.textCounter.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getTextCounterWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getTextCounterUI() });
  },
};
