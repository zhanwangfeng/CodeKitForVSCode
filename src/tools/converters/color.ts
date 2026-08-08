/** 颜色转换工具：打开专用 WebView（输入任意格式颜色，实时输出 HEX/RGB/HSL 与色块预览）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getColorUI, getColorWebviewContent } from '../../webviews/colorWebview';
import { Tool } from '../tool';

export const colorTool: Tool = {
  id: 'color',
  get name() {
    return t('tool.color.name');
  },
  get description() {
    return t('tool.color.description');
  },
  commandId: 'codeKit.color',
  icon: new vscode.ThemeIcon('symbol-color'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.color',
      t('tool.color.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getColorWebviewContent(initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getColorUI() });
  },
};
