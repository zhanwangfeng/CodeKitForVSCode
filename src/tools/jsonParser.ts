/** JSON Parser 工具：打开实时解析 JSON 的 WebView（双窗口、可编辑树、Prism 高亮）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../i18n';
import { getJsonParserI18n, getJsonParserUI, getJsonParserWebviewContent } from '../webviews/jsonParserWebview';
import { Tool } from './tool';

export const jsonParserTool: Tool = {
  id: 'json-parser',
  get name() {
    return t('tool.jsonParser.name');
  },
  get description() {
    return t('tool.jsonParser.description');
  },
  commandId: 'codeKit.jsonParser',
  icon: new vscode.ThemeIcon('json'),
  run() {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.jsonParser',
      t('tool.jsonParser.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getJsonParserWebviewContent();
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({
      type: 'localeChanged',
      locale: getLocale(),
      ui: getJsonParserUI(),
      i18n: getJsonParserI18n(),
    });
  },
};