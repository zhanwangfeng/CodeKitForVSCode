/** UUID 工具：打开专用 WebView（输入数量批量生成 v4 UUID，大小写切换）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { getUuidUI, getUuidWebviewContent } from '../../webviews/uuidWebview';
import { Tool } from '../tool';

export const uuidTool: Tool = {
  id: 'uuid',
  get name() {
    return t('tool.uuid.name');
  },
  get description() {
    return t('tool.uuid.description');
  },
  commandId: 'codeKit.uuid',
  icon: new vscode.ThemeIcon('key'),
  run(context: vscode.ExtensionContext, _initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.uuid',
      t('tool.uuid.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getUuidWebviewContent();
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getUuidUI() });
  },
};
