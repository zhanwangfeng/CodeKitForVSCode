/** 内部 i18n 模块：en/zh-cn 双语字典、当前语言状态、globalState 持久化与 t() 取文案。 */
import * as vscode from 'vscode';

export type Locale = 'en' | 'zh-cn';

export const LOCALES: readonly Locale[] = ['en', 'zh-cn'];

/** 所有可翻译文案的双语字典（单一真相源，不与 package.json 混合） */
const messages: Record<string, Record<Locale, string>> = {
  // —— 工具元数据（Tree View）——
  'tool.helloWorld.name': { en: 'Hello World', 'zh-cn': 'Hello World' },
  'tool.helloWorld.description': {
    en: 'Welcome animation demo tool',
    'zh-cn': '第一个工具：打开 Hello World 动画',
  },
  'tool.jsonParser.name': { en: 'JSON Parser', 'zh-cn': 'JSON Parser' },
  'tool.jsonParser.description': {
    en: 'Parse JSON in real time with an editable tree view',
    'zh-cn': 'JSON解析工具：实时解析JSON字符串，可视化展示',
  },

  // —— Hello World WebView ——
  'hello.title': { en: 'CodeKit', 'zh-cn': 'CodeKit' },
  'hello.intro': {
    en: 'A VS Code toolkit that tucks handy dev tools into the sidebar, ready when you need them.',
    'zh-cn': '一个把常用开发小工具收进侧边栏的 VSCode 扩展工具箱，随时取用。',
  },
  'hello.feature.1': {
    en: 'Custom Activity Bar icon entry — one click to the tools panel',
    'zh-cn': 'Activity Bar 自定义图标入口，一键进入工具面板',
  },
  'hello.feature.2': {
    en: 'Sidebar Tree View listing all tools in one place',
    'zh-cn': '主侧边栏 Tree View 树形列表，集中展示全部工具',
  },
  'hello.feature.3': {
    en: 'Tools open as WebView tabs in the editor area, with animation and interaction',
    'zh-cn': '工具可在编辑器主区域打开 WebView 标签页，支持动画与交互',
  },
  'hello.feature.4': {
    en: 'Add a tool by implementing the Tool interface and registering it — zero runtime deps',
    'zh-cn': '新增工具只需实现 Tool 接口并登记，零运行时依赖',
  },
  'hello.lang.label': { en: 'Language', 'zh-cn': '语言' },
  'hello.lang.en': { en: 'English', 'zh-cn': 'English' },
  'hello.lang.zh': { en: '简体中文', 'zh-cn': '简体中文' },
  'hello.contextMenu': { en: 'Context Menu', 'zh-cn': '右键菜单' },

  // —— 通用文案（多工具共用）——
  'common.wrap': { en: 'Wrap', 'zh-cn': '自动换行' },
  'common.lineNumbers': { en: 'Line Numbers', 'zh-cn': '行号' },
  'common.sample': { en: 'Sample', 'zh-cn': '示例' },
  'common.clear': { en: 'Clear', 'zh-cn': '清空' },
  'common.copy': { en: 'Copy', 'zh-cn': '复制' },
  'common.copied': { en: 'Copied', 'zh-cn': '已复制' },
  'common.generate': { en: 'Generate', 'zh-cn': '生成' },
  'common.copyAll': { en: 'Copy All', 'zh-cn': '全部复制' },
  'common.lowercase': { en: 'Lowercase', 'zh-cn': '小写' },
  'common.uppercase': { en: 'Uppercase', 'zh-cn': '大写' },

  // —— JSON Parser WebView ——
  'json.tabText': { en: 'Text', 'zh-cn': '文本窗' },
  'json.tabTree': { en: 'Tree', 'zh-cn': '编辑窗' },
  'json.wrap': { en: 'Word Wrap', 'zh-cn': '自动换行' },
  'json.lineNumbers': { en: 'Line Numbers', 'zh-cn': '行号' },
  'json.expand': { en: 'Expand', 'zh-cn': '展开' },
  'json.minify': { en: 'Collapse', 'zh-cn': '收起' },
  'json.example': { en: 'Example', 'zh-cn': '示例' },
  'json.clear': { en: 'Clear', 'zh-cn': '清空' },
  'json.copy': { en: 'Copy', 'zh-cn': '复制' },
  'json.placeholder': { en: 'Type JSON here...', 'zh-cn': '在此输入 JSON 字符串...' },
  'json.waiting': { en: 'Waiting for JSON input...', 'zh-cn': '等待输入 JSON...' },
  'json.synced': { en: 'Synced', 'zh-cn': '已同步' },
  'json.noData': { en: 'Nothing to copy', 'zh-cn': '无数据可复制' },
  'json.copied': { en: 'Copied to clipboard', 'zh-cn': '已复制到剪贴板' },
  'json.parseFailed': { en: 'JSON parse failed', 'zh-cn': 'JSON 解析失败' },
  'json.location': { en: 'Location', 'zh-cn': '位置' },
  'json.error': { en: 'Error', 'zh-cn': '错误' },
  'json.line': { en: 'Line', 'zh-cn': '行' },
  'json.column': { en: 'Column', 'zh-cn': '列' },
  'json.changeNullPrompt': { en: 'Change null to:', 'zh-cn': 'null 改为:' },
  'json.editKey': { en: 'Click to edit key', 'zh-cn': '点击编辑键名' },
  'json.editString': { en: 'Click to edit string', 'zh-cn': '点击编辑字符串' },
  'json.editNumber': { en: 'Click to edit number', 'zh-cn': '点击编辑数字' },
  'json.toggleBool': { en: 'Click to toggle true/false', 'zh-cn': '点击切换 true/false' },
  'json.changeType': { en: 'Click to change type', 'zh-cn': '点击改为其他类型' },
  'json.delete': { en: 'Delete', 'zh-cn': '删除' },
  'json.addProperty': { en: 'Add property', 'zh-cn': '添加属性' },
  'json.addElement': { en: 'Add element', 'zh-cn': '添加元素' },

  // —— Converter 框架通用 UI ——
  'converter.input': { en: 'Input', 'zh-cn': '输入' },
  'converter.output': { en: 'Output', 'zh-cn': '输出' },
  'converter.copy': { en: 'Copy', 'zh-cn': '复制' },
  'converter.copied': { en: 'Copied to clipboard', 'zh-cn': '已复制到剪贴板' },
  'converter.error': { en: 'Error', 'zh-cn': '错误' },

  // —— Unix 时间 ——
  'tool.unixTime.name': { en: 'Unix Time', 'zh-cn': 'Unix 时间' },
  'tool.unixTime.description': {
    en: 'Convert between Unix timestamps and human-readable dates',
    'zh-cn': 'Unix 时间戳与日期互转',
  },
  'unix.current': { en: 'Current Timestamp (Unix)', 'zh-cn': '当前时间戳(Unix timestamp)' },
  'unix.seconds': { en: 'Seconds (10-digit)', 'zh-cn': '10位(秒级)' },
  'unix.millis': { en: 'Milliseconds (13-digit)', 'zh-cn': '13位(毫秒级)' },
  'unix.toDate': { en: 'Timestamp → Date', 'zh-cn': '时间戳 → 日期' },
  'unix.toStamp': { en: 'Date → Timestamp (Individual)', 'zh-cn': '日期 → 时间戳 (逐项输入)' },
  'unix.toStampQuick': {
    en: 'Date → Timestamp (Quick format: YYYYMMDDHHMMSS)',
    'zh-cn': '日期 → 时间戳 (快速输入格式：YYYYMMDDHHMMSS)',
  },
  'unix.timezone': { en: 'Time Zone', 'zh-cn': '时区' },
  'unix.convert': { en: 'Convert', 'zh-cn': '转换' },
  'unix.year': { en: 'Year', 'zh-cn': '年' },
  'unix.month': { en: 'Month', 'zh-cn': '月' },
  'unix.day': { en: 'Day', 'zh-cn': '日' },
  'unix.hour': { en: 'Hour', 'zh-cn': '时' },
  'unix.minute': { en: 'Minute', 'zh-cn': '分' },
  'unix.second': { en: 'Second', 'zh-cn': '秒' },
  'unix.result': { en: 'Result', 'zh-cn': '结果' },
  'unix.copy': { en: 'Copy', 'zh-cn': '复制' },
  'unix.copied': { en: 'Copied', 'zh-cn': '已复制' },
  'unix.invalid': { en: 'Invalid input', 'zh-cn': '输入无效' },

  // —— Base64 ——
  'tool.base64.name': { en: 'Base64', 'zh-cn': 'Base64' },
  'tool.base64.description': {
    en: 'Encode and decode Base64 (UTF-8 safe)',
    'zh-cn': 'Base64 编码与解码（UTF-8 安全）',
  },
  'base64.plaintext': { en: 'Plaintext', 'zh-cn': '明文' },
  'base64.ciphertext': { en: 'Ciphertext (Base64)', 'zh-cn': '密文 (Base64)' },
  'base64.placeholder.left': { en: 'Enter plaintext to encode...', 'zh-cn': '输入明文，自动编码为 Base64...' },
  'base64.placeholder.right': { en: 'Enter Base64 to decode...', 'zh-cn': '输入 Base64 密文，自动解码...' },
  'base64.copy': { en: 'Copy', 'zh-cn': '复制' },
  'base64.copied': { en: 'Copied', 'zh-cn': '已复制' },
  'base64.error.decode': { en: 'Base64 decode failed', 'zh-cn': 'Base64 解码失败' },
  'base64.wrap': { en: 'Wrap', 'zh-cn': '自动换行' },
  'base64.lineNumbers': { en: 'Line Numbers', 'zh-cn': '行号' },
  'base64.sample': { en: 'Sample', 'zh-cn': '示例' },
  'base64.clear': { en: 'Clear', 'zh-cn': '清空' },

  // —— Unicode ——
  'tool.unicode.name': { en: 'Unicode', 'zh-cn': 'Unicode' },
  'tool.unicode.description': {
    en: 'Convert between text and \\uXXXX escapes',
    'zh-cn': '文本与 \\uXXXX 转义互转',
  },
  'unicode.plaintext': { en: 'Chinese Text', 'zh-cn': '中文字符串' },
  'unicode.encoded': { en: 'Escape String', 'zh-cn': '转义字符串' },
  'unicode.placeholder.left': { en: 'Enter text to encode...', 'zh-cn': '输入文本，自动转义为 \\uXXXX...' },
  'unicode.placeholder.right': { en: 'Enter \\uXXXX escapes to decode...', 'zh-cn': '输入 \\uXXXX 转义，自动解码...' },
  'unicode.error.decode': { en: 'Unicode decode failed', 'zh-cn': 'Unicode 解码失败' },

  // —— UUID ——
  'tool.uuid.name': { en: 'UUID', 'zh-cn': 'UUID' },
  'tool.uuid.description': { en: 'Generate RFC 4122 v4 UUIDs', 'zh-cn': '生成 RFC 4122 v4 UUID' },
  'uuid.placeholder': {
    en: 'Number of UUIDs to generate (default 1)...',
    'zh-cn': '生成数量（默认 1）...',
  },
  'uuid.count': { en: 'Count', 'zh-cn': '数量' },
  'uuid.output': { en: 'Output', 'zh-cn': '输出' },

  // —— MD5 ——
  'tool.md5.name': { en: 'MD5', 'zh-cn': 'MD5' },
  'tool.md5.description': { en: 'Compute the MD5 hash of input text', 'zh-cn': '计算输入文本的 MD5 哈希' },
  'md5.input': { en: 'Input', 'zh-cn': '输入' },
  'md5.output': { en: 'Hash', 'zh-cn': '哈希值' },
  'md5.placeholder': { en: 'Enter text to hash...', 'zh-cn': '输入要计算哈希的文本...' },

  // —— URL 编码 ——
  'tool.urlEncode.name': { en: 'URL Encode', 'zh-cn': 'URL 编码' },
  'tool.urlEncode.description': { en: 'Encode and decode URL components', 'zh-cn': 'URL 组件编码与解码' },
  'url.plaintext': { en: 'Original (decode)', 'zh-cn': '原文(decode)' },
  'url.encoded': { en: 'Encoded (encode)', 'zh-cn': '编码(encode)' },
  'url.placeholder.left': { en: 'Enter text to encode...', 'zh-cn': '输入文本，自动编码为 URL 编码...' },
  'url.placeholder.right': { en: 'Enter URL-encoded text to decode...', 'zh-cn': '输入 URL 编码文本，自动解码...' },
  'url.error.decode': { en: 'URL decode failed', 'zh-cn': 'URL 解码失败' },

  // —— 变量名转换 ——
  'tool.varName.name': { en: 'Variable Name', 'zh-cn': '变量名转换' },
  'tool.varName.description': {
    en: 'Convert between camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE',
    'zh-cn': '驼峰/下划线/短横线等命名互转',
  },
  'varName.placeholder': { en: 'Enter a variable name...', 'zh-cn': '输入变量名...' },
  'varName.camel': { en: 'camelCase', 'zh-cn': 'camelCase' },
  'varName.snake': { en: 'snake_case', 'zh-cn': 'snake_case' },
  'varName.kebab': { en: 'kebab-case', 'zh-cn': 'kebab-case' },
  'varName.pascal': { en: 'PascalCase', 'zh-cn': 'PascalCase' },
  'varName.constant': { en: 'CONSTANT_CASE', 'zh-cn': 'CONSTANT_CASE' },

  // —— 编辑器右键命令 ——
  'jsonFormat.error.parse': { en: 'JSON parse failed', 'zh-cn': 'JSON 解析失败' },
  'convert.error.decode': { en: 'Decode failed', 'zh-cn': '解码失败' },
};

const STATE_KEY = 'codeKit.locale';
let currentLocale: Locale = 'en';
let store: vscode.Memento | null = null;

/** 在 activate 中调用一次，从 globalState 读取已存语言 */
export function initI18n(context: vscode.ExtensionContext): void {
  store = context.globalState;
  const saved = context.globalState.get<Locale>(STATE_KEY);
  if (saved === 'en' || saved === 'zh-cn') {
    currentLocale = saved;
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  store?.update(STATE_KEY, locale);
}

/** 取当前语言下的文案；未命中返回 key 本身 */
export function t(key: string): string {
  return messages[key]?.[currentLocale] ?? key;
}
