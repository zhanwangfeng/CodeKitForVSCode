/** 扩展入口：初始化 i18n、注册各工具命令与 Tools Tree View，管理 WebView 面板复用。 */
import * as vscode from 'vscode';
import { initI18n } from './i18n';
import { ToolsTreeProvider } from './tree/toolsTreeProvider';
import { tools } from './tools';
import { Tool } from './tools/tool';
import { collapseSelection, expandSelection } from './commands/jsonFormat';
import {
  base64Decode,
  base64Encode,
  insertCurrentTime,
  insertUuid,
  md5Hash,
  sha256Hash,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  unicodeEscape,
  unicodeUnescape,
  urlDecode,
  urlEncode,
} from './commands/textConvert';
import { base64Tool } from './tools/converters/base64';
import { colorTool } from './tools/converters/color';
import { jsonParserTool } from './tools/jsonParser';
import { jwtTool } from './tools/converters/jwt';
import { md5Tool } from './tools/converters/md5';
import { regexTool } from './tools/converters/regex';
import { shaTool } from './tools/converters/sha';
import { unicodeTool } from './tools/converters/unicode';
import { unixTimeTool } from './tools/converters/unixTime';
import { urlEncodeTool } from './tools/converters/urlEncode';
import { uuidTool } from './tools/converters/uuid';
import { varNameTool } from './tools/converters/varName';

/** 面板注册表：toolId → 已打开的面板集合（保持插入顺序） */
const panelRegistry = new Map<string, Set<vscode.WebviewPanel>>();

/** 注册面板到注册表，并在面板关闭时自动移除 */
function registerPanel(toolId: string, panel: vscode.WebviewPanel): void {
  if (!panelRegistry.has(toolId)) {
    panelRegistry.set(toolId, new Set());
  }
  const set = panelRegistry.get(toolId)!;
  set.add(panel);
  panel.onDidDispose(() => {
    set.delete(panel);
    if (set.size === 0) {
      panelRegistry.delete(toolId);
    }
  });
}

/** 打开工具 WebView，填充选中文本；已有面板则跳转并 postMessage */
function openToolWithSelection(tool: Tool, context: vscode.ExtensionContext): void {
  const editor = vscode.window.activeTextEditor;
  const selectedText = editor ? editor.document.getText(editor.selection) : '';
  const panels = panelRegistry.get(tool.id);
  if (panels && panels.size > 0) {
    const first = panels.values().next().value;
    if (first) {
      first.reveal(vscode.ViewColumn.Active, false);
      if (selectedText) {
        first.webview.postMessage({ type: 'setInput', text: selectedText });
      }
      return;
    }
  }
  const panel = tool.run(context, selectedText || undefined);
  registerPanel(tool.id, panel);
}

/** 右键菜单开关的配置 key（相对于 codeKit 配置段） */
const CONTEXT_MENU_KEY = 'contextMenuEnabled';

export function activate(context: vscode.ExtensionContext): void {
  initI18n(context);

  // 每个工具注册命令：点击时复用已有面板，无则新建
  for (const tool of tools) {
    context.subscriptions.push(
      vscode.commands.registerCommand(tool.commandId, () => {
        const panels = panelRegistry.get(tool.id);
        if (panels && panels.size > 0) {
          // 已有面板：跳转到第一个
          const first = panels.values().next().value;
          if (first) {
            first.reveal(vscode.ViewColumn.Active, false);
          }
          return;
        }
        // 无已有面板：新建
        const panel = tool.run(context);
        registerPanel(tool.id, panel);
      }),
    );
  }

  // 右键菜单"打开新窗口"命令：始终新建面板
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openNewWindow', (tool?: Tool) => {
      if (!tool) {
        return;
      }
      const panel = tool.run(context);
      registerPanel(tool.id, panel);
    }),
  );

  const treeProvider = new ToolsTreeProvider(tools);
  context.subscriptions.push(
    vscode.window.createTreeView('codeKit.views.tools', { treeDataProvider: treeProvider }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.refreshTools', () => treeProvider.refresh()),
  );

  // —— 编辑器右键：JSON 展开/收起/打开 ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.jsonExpand', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) expandSelection(editor);
    }),
    vscode.commands.registerCommand('codeKit.jsonCollapse', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) collapseSelection(editor);
    }),
    vscode.commands.registerCommand('codeKit.openJsonParser', () =>
      openToolWithSelection(jsonParserTool, context),
    ),
  );

  // —— 编辑器右键：Base64 ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openBase64', () =>
      openToolWithSelection(base64Tool, context),
    ),
    vscode.commands.registerCommand('codeKit.base64Encode', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) base64Encode(editor);
    }),
    vscode.commands.registerCommand('codeKit.base64Decode', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) base64Decode(editor);
    }),
  );

  // —— 编辑器右键：URL ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openUrlEncode', () =>
      openToolWithSelection(urlEncodeTool, context),
    ),
    vscode.commands.registerCommand('codeKit.urlEncode', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) urlEncode(editor);
    }),
    vscode.commands.registerCommand('codeKit.urlDecode', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) urlDecode(editor);
    }),
  );

  // —— 编辑器右键：Unicode ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openUnicode', () =>
      openToolWithSelection(unicodeTool, context),
    ),
    vscode.commands.registerCommand('codeKit.unicodeEscape', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) unicodeEscape(editor);
    }),
    vscode.commands.registerCommand('codeKit.unicodeUnescape', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) unicodeUnescape(editor);
    }),
  );

  // —— 编辑器右键：Unix Time ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openUnixTime', () =>
      openToolWithSelection(unixTimeTool, context),
    ),
    vscode.commands.registerCommand('codeKit.insertCurrentTime', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) insertCurrentTime(editor);
    }),
  );

  // —— 编辑器右键：MD5 ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openMd5', () =>
      openToolWithSelection(md5Tool, context),
    ),
    vscode.commands.registerCommand('codeKit.md5Hash', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) md5Hash(editor);
    }),
  );

  // —— 编辑器右键：UUID ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openUuid', () =>
      openToolWithSelection(uuidTool, context),
    ),
    vscode.commands.registerCommand('codeKit.insertUuid', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) insertUuid(editor);
    }),
  );

  // —— 编辑器右键：变量名转换 ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openVarName', () =>
      openToolWithSelection(varNameTool, context),
    ),
    vscode.commands.registerCommand('codeKit.varNameCamel', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) toCamelCase(editor);
    }),
    vscode.commands.registerCommand('codeKit.varNameSnake', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) toSnakeCase(editor);
    }),
    vscode.commands.registerCommand('codeKit.varNameKebab', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) toKebabCase(editor);
    }),
    vscode.commands.registerCommand('codeKit.varNamePascal', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) toPascalCase(editor);
    }),
    vscode.commands.registerCommand('codeKit.varNameConstant', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) toConstantCase(editor);
    }),
  );

  // —— 编辑器右键：SHA ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openSha', () =>
      openToolWithSelection(shaTool, context),
    ),
    vscode.commands.registerCommand('codeKit.shaHash', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) sha256Hash(editor);
    }),
  );

  // —— 编辑器右键：JWT ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openJwt', () =>
      openToolWithSelection(jwtTool, context),
    ),
  );

  // —— 编辑器右键：颜色 ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openColor', () =>
      openToolWithSelection(colorTool, context),
    ),
  );

  // —— 编辑器右键：正则 ——
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.openRegex', () =>
      openToolWithSelection(regexTool, context),
    ),
  );

  // 语言切换时更新所有已打开面板的标签标题，并通过 onLocaleChange 通知 WebView 原地更新全部文案
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.updatePanelTitles', () => {
      for (const tool of tools) {
        const panels = panelRegistry.get(tool.id);
        if (panels) {
          for (const panel of panels) {
            panel.title = tool.name;
            if (tool.onLocaleChange) {
              tool.onLocaleChange(panel);
            }
          }
        }
      }
    }),
  );

  // disabled 占位命令：enablement 为 false，永不可点击，仅用于菜单显示带后缀标题
  const disabledCommands = [
    'codeKit.jsonExpandDisabled', 'codeKit.jsonCollapseDisabled',
    'codeKit.base64EncodeDisabled', 'codeKit.base64DecodeDisabled',
    'codeKit.urlEncodeDisabled', 'codeKit.urlDecodeDisabled',
    'codeKit.unicodeEscapeDisabled', 'codeKit.unicodeUnescapeDisabled',
    'codeKit.md5HashDisabled',
    'codeKit.varNameCamelDisabled', 'codeKit.varNameSnakeDisabled',
    'codeKit.varNameKebabDisabled', 'codeKit.varNamePascalDisabled',
    'codeKit.varNameConstantDisabled',
    'codeKit.shaHashDisabled',
  ];
  for (const cmd of disabledCommands) {
    context.subscriptions.push(vscode.commands.registerCommand(cmd, () => {}));
  }

  // HelloWorld 右键菜单开关：接收 WebView postMessage，更新 configuration（when 子句自动响应）
  context.subscriptions.push(
    vscode.commands.registerCommand('codeKit.toggleContextMenu', (enabled: boolean) => {
      vscode.workspace.getConfiguration('codeKit').update(CONTEXT_MENU_KEY, enabled, vscode.ConfigurationTarget.Global);
    }),
  );
}

export function deactivate(): void {}
