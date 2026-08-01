import * as vscode from 'vscode';
import { t } from '../i18n';
import { getJsonParserWebviewContent } from '../webviews/jsonParserWebview';
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
      'JSON Parser',
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getJsonParserWebviewContent();
  },
};