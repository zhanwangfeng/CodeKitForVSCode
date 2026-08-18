/** 字母大小写转换工具：打开专用 WebView（输入文本，实时输出全大写/全小写）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getLetterCaseUI, getLetterCaseWebviewContent } from '../../webviews/letterCaseWebview';
import { Tool } from '../tool';

export const letterCaseTool: Tool = {
  id: 'letter-case',
  get name() {
    return t('tool.letterCase.name');
  },
  get description() {
    return t('tool.letterCase.description');
  },
  commandId: 'codeKit.letterCase',
  icon: new vscode.ThemeIcon('case-sensitive'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.letterCase',
      t('tool.letterCase.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getLetterCaseWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getLetterCaseUI() });
  },
};
