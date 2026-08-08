/** 正则测试工具：打开专用 WebView（输入正则与测试文本，实时显示匹配结果与高亮预览）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getRegexUI, getRegexWebviewContent } from '../../webviews/regexWebview';
import { Tool } from '../tool';

export const regexTool: Tool = {
  id: 'regex',
  get name() {
    return t('tool.regex.name');
  },
  get description() {
    return t('tool.regex.description');
  },
  commandId: 'codeKit.regex',
  icon: new vscode.ThemeIcon('regex'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.regex',
      t('tool.regex.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getRegexWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getRegexUI() });
  },
};
