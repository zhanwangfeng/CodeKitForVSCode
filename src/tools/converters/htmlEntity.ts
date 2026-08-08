/** HTML 实体编码工具：打开专用 WebView（左右布局，左明文右 HTML 实体，双向实时同步）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { DualPaneConfig, getDualPaneUI, getDualPaneWebviewContent } from '../../webviews/dualPaneWebview';
import { Tool } from '../tool';

function getConfig(): DualPaneConfig {
  return {
    title: t('tool.htmlEntity.name'),
    leftLabelKey: 'htmlEntity.plaintext',
    rightLabelKey: 'htmlEntity.encoded',
    placeholderLeftKey: 'htmlEntity.placeholder.left',
    placeholderRightKey: 'htmlEntity.placeholder.right',
    errorDecodeKey: 'htmlEntity.error.decode',
    keyPrefix: 'htmlEntity',
    // 编码按序替换以避免二次转义：& 必须最先处理
    encodeFn: `function encode(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}`,
    // 解码：注入 textarea 的 innerHTML，浏览器自动还原命名/数字实体
    decodeFn: `function decode(input) {
  var el = document.createElement('textarea');
  el.innerHTML = input.trim();
  return el.value;
}`,
    sampleText: '<a href="https://example.com?a=1&b=2">Hello & welcome</a>',
  };
}

export const htmlEntityTool: Tool = {
  id: 'html-entity',
  get name() {
    return t('tool.htmlEntity.name');
  },
  get description() {
    return t('tool.htmlEntity.description');
  },
  commandId: 'codeKit.htmlEntity',
  icon: new vscode.ThemeIcon('code'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.htmlEntity',
      t('tool.htmlEntity.name'),
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
