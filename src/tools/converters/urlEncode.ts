/** URL 编码工具：打开专用 WebView（左右布局，左明文右 URL编码，双向实时同步）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { DualPaneConfig, getDualPaneUI, getDualPaneWebviewContent } from '../../webviews/dualPaneWebview';
import { Tool } from '../tool';

function getConfig(): DualPaneConfig {
  return {
    title: t('tool.urlEncode.name'),
    leftLabelKey: 'url.plaintext',
    rightLabelKey: 'url.encoded',
    placeholderLeftKey: 'url.placeholder.left',
    placeholderRightKey: 'url.placeholder.right',
    errorDecodeKey: 'url.error.decode',
    keyPrefix: 'url',
    encodeFn: `function encode(input) { return encodeURIComponent(input); }`,
    decodeFn: `function decode(input) { return decodeURIComponent(input.trim()); }`,
    sampleText: 'https://example.com/path?q=hello world&lang=zh',
  };
}

export const urlEncodeTool: Tool = {
  id: 'url-encode',
  get name() {
    return t('tool.urlEncode.name');
  },
  get description() {
    return t('tool.urlEncode.description');
  },
  commandId: 'codeKit.urlEncoder',
  icon: new vscode.ThemeIcon('link'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.urlEncode',
      t('tool.urlEncode.name'),
      vscode.ViewColumn.Active,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    panel.webview.html = getDualPaneWebviewContent(getConfig(), initialText);
    return panel;
  },
  onLocaleChange(panel) {
    panel.webview.postMessage({ type: 'localeChanged', locale: getLocale(), ui: getDualPaneUI(getConfig()) });
  },
};
