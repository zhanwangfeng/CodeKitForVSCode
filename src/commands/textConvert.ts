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

// —— SQL 格式化 ——

/** 将选中 SQL 格式化为单行规范输出（关键字大写、基础换行/缩进）。完整排版请用 SQL Formatter 面板。 */
export function sqlFormat(editor: vscode.TextEditor): void {
  const text = editor.document.getText(editor.selection).trim();
  if (!text) return;
  editor.edit((b) => b.replace(editor.selection, formatSqlInline(text)));
}

/** 轻量 SQL 格式化：压缩空白 + 关键字大写 + 子句换行缩进（就地替换版，逻辑与面板保持一致的简化版） */
function formatSqlInline(sql: string): string {
  // 保护字符串字面量
  const strings: string[] = [];
  const protectedSql = sql.replace(/'(?:''|[^'])*'|"(?:[^"]|"")*"/g, (m) => {
    strings.push(m);
    return '\u0000' + (strings.length - 1) + '\u0000';
  });
  const oneLine = protectedSql.replace(/\s+/g, ' ').replace(
    /\b(?:select|from|where|group\s+by|order\s+by|having|limit|offset|join|inner\s+join|left\s+join|right\s+join|full\s+join|left\s+outer\s+join|right\s+outer\s+join|cross\s+join|union\s+all|union|insert\s+into|values|update|set|delete\s+from|create\s+table|create\s+index|create\s+view|alter\s+table|drop\s+table|add\s+column|drop\s+column|primary\s+key|foreign\s+key|unique|not\s+null|default|references|on|as|and|or|not|in|is|null|between|like|exists|distinct|case|when|then|else|end|asc|desc)\b/gi,
    (m) => m.toUpperCase(),
  );
  const clauses = [
    'SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET',
    'INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','LEFT OUTER JOIN','RIGHT OUTER JOIN','CROSS JOIN','JOIN',
    'UNION ALL','UNION','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM',
  ];
  const joined = clauses
    .map((k) => k.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'))
    .join('|');
  let out = oneLine.replace(new RegExp('\\b(' + joined + ')\\b', 'gi'), '\n$1');
  out = out.replace(/^\n+/, '');
  const lines = out.split('\n');
  const result: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    result.push(line);
  }
  return result.join('\n').replace(/\u0000(\d+)\u0000/g, (_m, idx) => strings[parseInt(idx, 10)]);
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

// —— 密码生成 ——

/** 插入一个随机生成的强密码（16 位，含大小写/数字/符号）到光标或替换选中文本 */
export function insertPassword(editor: vscode.TextEditor): void {
  const charset =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*()-_=+[]{};:,.<>?/';
  let pw = '';
  for (let i = 0; i < 16; i++) {
    pw += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  replaceOrInsert(editor, pw);
}

// —— 进制转换 ——

/** 各进制的校验正则（不含前缀） */
const BASE_PATTERNS: Record<number, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

/** 解析指定进制的数字字符串；空串返回 0，非法返回 null（按 radix 逐位累加，避免 parseInt 处理非法字符） */
function parseBase(text: string, radix: number): number | null {
  const s = text.trim();
  if (s === '') return 0;
  const re = BASE_PATTERNS[radix];
  if (!re || !re.test(s)) return null;
  let value = 0;
  for (const ch of s) {
    const d = parseInt(ch, radix);
    value = value * radix + d;
  }
  return value;
}

/** 十进制 → 指定进制字符串（补 0x/0b/0o 前缀） */
function formatBase(value: number, radix: number): string {
  if (radix === 16) return '0x' + value.toString(16).toUpperCase();
  if (radix === 8) return '0o' + value.toString(8);
  if (radix === 2) return '0b' + value.toString(2);
  return value.toString(10);
}

/** 将选中文本从 fromRadix 进制原地转换为 toRadix 进制；失败弹错误提示 */
export function convertBase(editor: vscode.TextEditor, fromRadix: number, toRadix: number): void {
  const text = editor.document.getText(editor.selection);
  if (!text) return;
  const value = parseBase(text, fromRadix);
  if (value === null) {
    vscode.window.showErrorMessage(t('convert.error.decode'));
    return;
  }
  editor.edit((b) => b.replace(editor.selection, formatBase(value, toRadix)));
}
