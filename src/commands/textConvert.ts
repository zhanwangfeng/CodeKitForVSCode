/** 编辑器右键命令：Base64/URL/Unicode 编码解码、MD5 哈希、变量名转换、插入当前时间/UUID。 */
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { t } from '../i18n';

// —— 通用工具 ——

/** 替换选中文本；无选中时在光标位置插入 */
function replaceOrInsert(editor: vscode.TextEditor, text: string): void {
  const { selection } = editor;
  editor.edit((builder) => {
    if (selection.isEmpty) {
      builder.insert(selection.active, text);
    } else {
      builder.replace(selection, text);
    }
  });
}

// —— Base64 ——

export function base64Encode(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const encoded = Buffer.from(text, 'utf-8').toString('base64');
  editor.edit((b) => b.replace(editor.selection, encoded));
}

export function base64Decode(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection).trim();
  if (!text) return;
  try {
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    editor.edit((b) => b.replace(editor.selection, decoded));
  } catch {
    vscode.window.showErrorMessage(t('convert.error.decode'));
  }
}

// —— URL ——

export function urlEncode(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  editor.edit((b) => b.replace(editor.selection, encodeURIComponent(text)));
}

export function urlDecode(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection).trim();
  if (!text) return;
  try {
    editor.edit((b) => b.replace(editor.selection, decodeURIComponent(text)));
  } catch {
    vscode.window.showErrorMessage(t('convert.error.decode'));
  }
}

// —— Unicode ——

export function unicodeEscape(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 127) {
      out += '\\u' + code.toString(16).padStart(4, '0');
    } else {
      out += text.charAt(i);
    }
  }
  editor.edit((b) => b.replace(editor.selection, out));
}

export function unicodeUnescape(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const decoded = text.replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  editor.edit((b) => b.replace(editor.selection, decoded));
}

// —— MD5 ——

export function md5Hash(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const hash = crypto.createHash('md5').update(text, 'utf-8').digest('hex');
  editor.edit((b) => b.replace(editor.selection, hash));
}

// —— SHA ——

export function sha256Hash(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const hash = crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
  editor.edit((b) => b.replace(editor.selection, hash));
}

// —— 插入当前时间 ——

export function insertCurrentTime(editor: vscode.TextEditor): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  replaceOrInsert(editor, formatted);
}

// —— 插入 UUID ——

export function insertUuid(editor: vscode.TextEditor): void {
  const uuid = crypto.randomUUID();
  replaceOrInsert(editor, uuid);
}

// —— 变量名转换 ——

/** 按非字母数字字符分词，各词转小写 */
function tokenize(input: string): string[] {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter((w) => w.length > 0)
    .map((w) => w.toLowerCase());
}

export function toCamelCase(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const words = tokenize(text);
  const result = words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('');
  editor.edit((b) => b.replace(editor.selection, result));
}

export function toSnakeCase(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  editor.edit((b) => b.replace(editor.selection, tokenize(text).join('_')));
}

export function toKebabCase(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  editor.edit((b) => b.replace(editor.selection, tokenize(text).join('-')));
}

export function toPascalCase(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const result = tokenize(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  editor.edit((b) => b.replace(editor.selection, result));
}

export function toConstantCase(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  editor.edit((b) => b.replace(editor.selection, tokenize(text).join('_').toUpperCase()));
}

// —— HTML 实体 ——

export function htmlEncode(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const encoded = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  editor.edit((b) => b.replace(editor.selection, encoded));
}

export function htmlDecode(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection).trim();
  if (!text) return;
  // 替换命名与数字实体为对应字符
  const decoded = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(parseInt(code, 10)));
  editor.edit((b) => b.replace(editor.selection, decoded));
}
