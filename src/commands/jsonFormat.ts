/** 编辑器右键命令：对选中文本做 JSON 展开（格式化）或收起（压缩），原地替换。 */
import * as vscode from 'vscode';
import { t } from '../i18n';

/** 将选中文本格式化为 2 空格缩进的 JSON，替换选区 */
export function expandSelection(editor: vscode.TextEditor): void {
  const { selection, document } = editor;
  const text = document.getText(selection);
  if (!text) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    vscode.window.showErrorMessage(t('jsonFormat.error.parse'));
    return;
  }
  const formatted = JSON.stringify(parsed, null, 2);
  editor.edit((builder) => builder.replace(selection, formatted));
}

/** 将选中文本压缩为单行 JSON，替换选区 */
export function collapseSelection(editor: vscode.TextEditor): void {
  const { selection, document } = editor;
  const text = document.getText(selection);
  if (!text) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    vscode.window.showErrorMessage(t('jsonFormat.error.parse'));
    return;
  }
  const minified = JSON.stringify(parsed);
  editor.edit((builder) => builder.replace(selection, minified));
}
