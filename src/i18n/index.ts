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

  // —— 工具列表筛选 ——
  'tools.filter.title': { en: 'Filter Tools', 'zh-cn': '筛选工具' },
  'tools.filter.placeholder': {
    en: 'Type to filter tools...',
    'zh-cn': '输入以筛选工具...',
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
  'hello.siteLink': { en: 'Web Version', 'zh-cn': '网页版' },

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

  // —— HTML 实体 ——
  'tool.htmlEntity.name': { en: 'HTML Encode/Decode', 'zh-cn': 'HTML 实体' },
  'tool.htmlEntity.description': {
    en: 'Encode and decode HTML entities (&amp; &lt; &gt; &quot; &#39;)',
    'zh-cn': 'HTML 特殊字符实体编码与解码',
  },
  'htmlEntity.plaintext': { en: 'Plaintext', 'zh-cn': '明文' },
  'htmlEntity.encoded': { en: 'Encoded (HTML Entities)', 'zh-cn': '实体(encode)' },
  'htmlEntity.placeholder.left': { en: 'Enter text to encode...', 'zh-cn': '输入文本，自动编码为 HTML 实体...' },
  'htmlEntity.placeholder.right': { en: 'Enter HTML entities to decode...', 'zh-cn': '输入 HTML 实体，自动解码...' },
  'htmlEntity.error.decode': { en: 'HTML entity decode failed', 'zh-cn': 'HTML 实体解码失败' },

  // —— 文本统计 ——
  'tool.textCounter.name': { en: 'Text Counter', 'zh-cn': '文本统计' },
  'tool.textCounter.description': {
    en: 'Count characters, bytes, words, lines and non-whitespace chars',
    'zh-cn': '统计字符数、字节数、单词数、行数与去空白字符数',
  },
  'textCounter.input': { en: 'Input', 'zh-cn': '输入' },
  'textCounter.placeholder': { en: 'Type or paste text to count...', 'zh-cn': '输入或粘贴要统计的文本...' },
  'textCounter.characters': { en: 'Characters', 'zh-cn': '字符数' },
  'textCounter.bytes': { en: 'Bytes (UTF-8)', 'zh-cn': '字节数 (UTF-8)' },
  'textCounter.words': { en: 'Words', 'zh-cn': '单词数' },
  'textCounter.lines': { en: 'Lines', 'zh-cn': '行数' },
  'textCounter.noWhitespace': { en: 'Non-whitespace', 'zh-cn': '去空白' },

  // —— SQL 格式化 ——
  'tool.sql.name': { en: 'SQL Formatter', 'zh-cn': 'SQL 格式化' },
  'tool.sql.description': {
    en: 'Format SQL statements with keyword case and indentation options',
    'zh-cn': 'SQL 语句格式化，支持关键字大小写与缩进设置',
  },
  'sql.input': { en: 'Input', 'zh-cn': '输入' },
  'sql.output': { en: 'Formatted', 'zh-cn': '格式化结果' },
  'sql.placeholder.left': { en: 'Paste your SQL here...', 'zh-cn': '在此粘贴 SQL...' },
  'sql.placeholder.right': { en: 'Formatted SQL appears here...', 'zh-cn': '格式化后的 SQL 显示在此...' },
  'sql.keywordCase': { en: 'Keyword Case', 'zh-cn': '关键字大小写' },
  'sql.keywordUpper': { en: 'UPPER', 'zh-cn': '大写' },
  'sql.keywordLower': { en: 'lower', 'zh-cn': '小写' },
  'sql.indent': { en: 'Indent', 'zh-cn': '缩进' },

  // —— 字母大小写转换 ——
  'tool.letterCase.name': { en: 'Letter Case', 'zh-cn': '字母大小写转换' },
  'tool.letterCase.description': {
    en: 'Convert text to UPPERCASE or lowercase',
    'zh-cn': '将文本整体转换为大写或小写',
  },
  'letterCase.placeholder': { en: 'Enter text to convert...', 'zh-cn': '输入要转换的文本...' },
  'letterCase.upper': { en: 'UPPERCASE', 'zh-cn': '全大写' },
  'letterCase.lower': { en: 'lowercase', 'zh-cn': '全小写' },

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

  // —— SHA 哈希 ——
  'tool.sha.name': { en: 'SHA Hash', 'zh-cn': 'SHA 哈希' },
  'tool.sha.description': {
    en: 'Compute SHA-1 / SHA-256 / SHA-512 hashes',
    'zh-cn': '计算 SHA-1 / SHA-256 / SHA-512 哈希',
  },
  'sha.algorithm': { en: 'Algorithm', 'zh-cn': '算法' },
  'sha.input': { en: 'Input', 'zh-cn': '输入' },
  'sha.output': { en: 'Hash', 'zh-cn': '哈希值' },
  'sha.placeholder': { en: 'Enter text to hash...', 'zh-cn': '输入要计算哈希的文本...' },

  // —— JWT 解码 ——
  'tool.jwt.name': { en: 'JWT Decoder', 'zh-cn': 'JWT 解码' },
  'tool.jwt.description': {
    en: 'Decode JWT header and payload',
    'zh-cn': '解码 JWT 的 header 与 payload',
  },
  'jwt.input': { en: 'Token', 'zh-cn': 'Token' },
  'jwt.placeholder': { en: 'Paste a JWT here...', 'zh-cn': '在此粘贴 JWT...' },
  'jwt.header': { en: 'Header', 'zh-cn': 'Header' },
  'jwt.payload': { en: 'Payload', 'zh-cn': 'Payload' },
  'jwt.signature': { en: 'Signature', 'zh-cn': 'Signature' },
  'jwt.invalid': {
    en: 'Invalid JWT: expected 3 dot-separated segments',
    'zh-cn': '无效 JWT：应为三段点分结构',
  },
  'jwt.decodeError': { en: 'Segment base64url decode failed', 'zh-cn': '分段 base64url 解码失败' },

  // —— 颜色转换 ——
  'tool.color.name': { en: 'Color Converter', 'zh-cn': '颜色转换' },
  'tool.color.description': {
    en: 'Convert between HEX, RGB and HSL',
    'zh-cn': 'HEX / RGB / HSL 颜色互转',
  },
  'color.input': { en: 'Color', 'zh-cn': '颜色' },
  'color.placeholder': {
    en: 'Type a color, e.g. #ff0000, rgb(255,0,0), hsl(0,100%,50%)',
    'zh-cn': '输入颜色，如 #ff0000、rgb(255,0,0)、hsl(0,100%,50%)',
  },
  'color.preview': { en: 'Preview', 'zh-cn': '预览' },
  'color.hex': { en: 'HEX', 'zh-cn': 'HEX' },
  'color.rgb': { en: 'RGB', 'zh-cn': 'RGB' },
  'color.hsl': { en: 'HSL', 'zh-cn': 'HSL' },
  'color.invalid': { en: 'Unrecognized color format', 'zh-cn': '无法识别的颜色格式' },

  // —— 正则测试 ——
  'tool.regex.name': { en: 'Regex Tester', 'zh-cn': '正则测试' },
  'tool.regex.description': {
    en: 'Test regular expressions with match highlighting',
    'zh-cn': '正则表达式测试，实时显示匹配结果与高亮',
  },
  'regex.pattern': { en: 'Pattern', 'zh-cn': '正则' },
  'regex.flags': { en: 'Flags', 'zh-cn': '标志' },
  'regex.testText': { en: 'Test Text', 'zh-cn': '测试文本' },
  'regex.patternPlaceholder': { en: 'e.g. \\b\\w+@\\w+\\.\\w+', 'zh-cn': '例如 \\b\\w+@\\w+\\.\\w+' },
  'regex.testPlaceholder': { en: 'Enter text to test against...', 'zh-cn': '输入用于测试的文本...' },
  'regex.matches': { en: 'Matches', 'zh-cn': '匹配结果' },
  'regex.matchCount': { en: '{count} matches', 'zh-cn': '共 {count} 个匹配' },
  'regex.noMatch': { en: 'No matches', 'zh-cn': '无匹配' },
  'regex.invalid': { en: 'Invalid regular expression', 'zh-cn': '正则表达式无效' },

  // —— 密码生成器 ——
  'tool.password.name': { en: 'Password Generator', 'zh-cn': '密码生成器' },
  'tool.password.description': {
    en: 'Generate strong passwords with configurable length and character sets',
    'zh-cn': '生成强密码，可配置长度与字符集',
  },
  'password.length': { en: 'Length', 'zh-cn': '长度' },
  'password.count': { en: 'Count', 'zh-cn': '数量' },
  'password.uppercase': { en: 'Uppercase (A-Z)', 'zh-cn': '大写字母 (A-Z)' },
  'password.lowercase': { en: 'Lowercase (a-z)', 'zh-cn': '小写字母 (a-z)' },
  'password.digits': { en: 'Digits (0-9)', 'zh-cn': '数字 (0-9)' },
  'password.symbols': { en: 'Symbols (!@#$...)', 'zh-cn': '特殊符号 (!@#$...)' },
  'password.excludeSimilar': { en: 'Exclude similar chars (Il1O0)', 'zh-cn': '排除相似字符 (Il1O0)' },
  'password.generate': { en: 'Generate', 'zh-cn': '生成' },
  'password.output': { en: 'Passwords', 'zh-cn': '密码列表' },
  'password.placeholder': { en: 'Generated passwords appear here...', 'zh-cn': '生成的密码显示在此...' },
  'password.noCharset': { en: 'Select at least one character set', 'zh-cn': '请至少选择一种字符集' },
  'password.insert': { en: 'Insert Password', 'zh-cn': '插入密码' },

  // —— 进制转换器 ——
  'tool.numberBase.name': { en: 'Number Base Converter', 'zh-cn': '进制转换' },
  'tool.numberBase.description': {
    en: 'Convert between binary, octal, decimal and hexadecimal',
    'zh-cn': '二进制/八进制/十进制/十六进制互转',
  },
  'numberBase.binary': { en: 'Binary (2)', 'zh-cn': '二进制 (2)' },
  'numberBase.octal': { en: 'Octal (8)', 'zh-cn': '八进制 (8)' },
  'numberBase.decimal': { en: 'Decimal (10)', 'zh-cn': '十进制 (10)' },
  'numberBase.hex': { en: 'Hexadecimal (16)', 'zh-cn': '十六进制 (16)' },
  'numberBase.invalid': { en: 'Invalid number in the selected base', 'zh-cn': '输入数字与所选进制不匹配' },

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
