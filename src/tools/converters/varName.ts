/** 变量名转换工具：打开专用 WebView（输入变量名，实时输出 5 种命名风格）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getVarNameUI, getVarNameWebviewContent } from '../../webviews/varNameWebview';
import { Tool } from '../tool';

export const varNameTool: Tool = {
  id: 'var-name',
  get name() {
    return t('tool.varName.name');
  },
  get description() {
    return t('tool.varName.description');
  },
  commandId: 'codeKit.varName',
  icon: new vscode.ThemeIcon('case-sensitive'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.varName',
      t('tool.varName.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getVarNameWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getVarNameUI() });
  },
};
