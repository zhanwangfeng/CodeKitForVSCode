/** Unicode 工具：打开专用 WebView（左右布局，左 \uXXXX 密文右明文，双向实时同步）。 */
import * as vscode from 'vscode';
import { getLocale, t } from '../../i18n';
import { DualPaneConfig, getDualPaneUI, getDualPaneWebviewContent } from '../../webviews/dualPaneWebview';
import { Tool } from '../tool';

function getConfig(): DualPaneConfig {
  return {
    title: t('tool.unicode.name'),
    leftLabelKey: 'unicode.encoded',
    rightLabelKey: 'unicode.plaintext',
    placeholderLeftKey: 'unicode.placeholder.right',
    placeholderRightKey: 'unicode.placeholder.left',
    errorDecodeKey: 'unicode.error.decode',
    keyPrefix: 'unicode',
    reversed: true,
    encodeFn: `function encode(input) {
      var out = '';
      for (var i = 0; i < input.length; i++) {
        var code = input.charCodeAt(i);
        if (code > 127) {
          out += '\\\\u' + code.toString(16).padStart(4, '0');
        } else {
          out += input.charAt(i);
        }
      }
      return out;
    }`,
    decodeFn: `function decode(input) {
      return input.replace(/\\\\u([0-9a-fA-F]{4})/g, function (m, hex) {
        return String.fromCharCode(parseInt(hex, 16));
      });
    }`,
    sampleText: 'Hello, 世界！\nUnicode 测试 / Test',
  };
}

export const unicodeTool: Tool = {
  id: 'unicode',
  get name() {
    return t('tool.unicode.name');
  },
  get description() {
    return t('tool.unicode.description');
  },
  commandId: 'codeKit.unicode',
  icon: new vscode.ThemeIcon('symbol-string'),
  run(context: vscode.ExtensionContext, initialText?: string) {
    const panel = vscode.window.createWebviewPanel(
      'codeKit.unicode',
      t('tool.unicode.name'),
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
