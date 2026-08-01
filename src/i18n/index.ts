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
