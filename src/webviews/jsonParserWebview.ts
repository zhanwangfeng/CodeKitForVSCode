/** JSON Parser WebView 内容生成：双窗口、Prism 语法高亮、可编辑树、错误定位。 */
import * as fs from 'fs';
import * as path from 'path';
import { getLocale, t } from '../i18n';

/** JSON Parser WebView 静态文案（标签/按钮/占位符等，语言切换时原地更新） */
export function getJsonParserUI() {
  return {
    title: t('tool.jsonParser.name'),
    tabText: t('json.tabText'),
    tabTree: t('json.tabTree'),
    wrap: t('json.wrap'),
    lineNumbers: t('json.lineNumbers'),
    expand: t('json.expand'),
    minify: t('json.minify'),
    example: t('json.example'),
    clear: t('json.clear'),
    copy: t('json.copy'),
    placeholder: t('json.placeholder'),
    waiting: t('json.waiting'),
    synced: t('json.synced'),
  };
}

/** JSON Parser WebView 脚本内动态文案（错误提示、树操作菜单等，语言切换时原地更新） */
export function getJsonParserI18n() {
  return {
    waiting: t('json.waiting'),
    synced: t('json.synced'),
    noData: t('json.noData'),
    copied: t('json.copied'),
    parseFailed: t('json.parseFailed'),
    location: t('json.location'),
    error: t('json.error'),
    line: t('json.line'),
    column: t('json.column'),
    changeNullPrompt: t('json.changeNullPrompt'),
    editKey: t('json.editKey'),
    editString: t('json.editString'),
    editNumber: t('json.editNumber'),
    toggleBool: t('json.toggleBool'),
    changeType: t('json.changeType'),
    delete: t('json.delete'),
    addProperty: t('json.addProperty'),
    addElement: t('json.addElement'),
  };
}

export function getJsonParserWebviewContent(): string {
  const prismCore = fs.readFileSync(
    path.join(__dirname, '..', '..', 'resources', 'prism', 'prism-core.min.js'),
    'utf8'
  );
  const prismJson = fs.readFileSync(
    path.join(__dirname, '..', '..', 'resources', 'prism', 'prism-json.min.js'),
    'utf8'
  );

  const ui = getJsonParserUI();
  const i18n = getJsonParserI18n();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const i18nSource = JSON.stringify(i18n).replace(/</g, '\\u003c');
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>JSON Parser</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; font-family: var(--vscode-font-family); }

  body {
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
  }

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--vscode-editorGroupHeader-tabsBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  .window-tabs {
    display: flex;
    gap: 4px;
  }

  .tab {
    background: transparent;
    color: var(--vscode-editor-foreground);
    border: 1px solid var(--vscode-panel-border);
    padding: 4px 14px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s;
  }

  .tab:hover { background: var(--vscode-input-background); }

  .tab.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-background);
  }

  .toolbar-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 4px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    transition: background 0.15s;
  }

  .btn:hover { background: var(--vscode-button-hoverBackground); }

  .btn-ghost {
    background: transparent;
    color: var(--vscode-editor-foreground);
    border: 1px solid var(--vscode-panel-border);
  }

  .btn-ghost:hover { background: var(--vscode-input-background); }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-wrapper input[type="checkbox"] {
    width: 14px;
    height: 14px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--vscode-checkbox-background, var(--vscode-button-background));
  }

  .checkbox-label {
    font-size: 12px;
    font-weight: normal;
    color: var(--vscode-foreground);
  }

  .window-stage {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .window-pane {
    position: absolute;
    inset: 0;
    display: none;
    overflow: auto;
    padding: 12px;
  }

  .window-pane.active { display: block; }

  .text-editor {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .line-numbers {
    display: none;
    flex-shrink: 0;
    padding: 12px 8px 12px 12px;
    background: var(--vscode-editor-background);
    color: var(--vscode-descriptionForeground);
    border: 1px solid var(--vscode-input-border);
    border-right: none;
    border-radius: 3px 0 0 3px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    text-align: right;
    white-space: pre;
    overflow: hidden;
    user-select: none;
    min-width: 3ch;
  }

  .text-editor.show-line-numbers .line-numbers { display: block; }

  .text-area-wrapper {
    flex: 1;
    position: relative;
    height: 100%;
  }

  .text-editor.show-line-numbers .text-area-wrapper textarea,
  .text-editor.show-line-numbers .text-area-wrapper .highlight-layer {
    border-left: none;
    border-radius: 0 3px 3px 0;
  }

  textarea {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
    color: transparent;
    caret-color: var(--vscode-editor-foreground);
    border: 1px solid var(--vscode-input-border);
    padding: 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    resize: none;
    outline: none;
    line-height: 1.6;
    white-space: pre;
    overflow-x: auto;
    position: relative;
    z-index: 2;
  }

  textarea.wrap-enabled {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-x: hidden;
  }

  textarea:focus {
    border-color: var(--vscode-focusBorder);
  }

  textarea::placeholder {
    color: var(--vscode-input-placeholderForeground);
  }

  textarea::selection {
    background: var(--vscode-editor-selectionBackground);
  }

  .highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 12px;
    border: 1px solid transparent;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
    background: var(--vscode-editor-background);
    border-radius: 3px;
  }

  .highlight-layer.wrap-enabled {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .highlight-layer .token.property { color: var(--vscode-json-property-syntax, #9cdcfe); }
  .highlight-layer .token.string { color: var(--vscode-json-string-syntax, #ce9178); }
  .highlight-layer .token.number { color: var(--vscode-json-number-syntax, #b5cea8); }
  .highlight-layer .token.boolean { color: var(--vscode-json-boolean-syntax, #569cd6); }
  .highlight-layer .token.null { color: var(--vscode-json-null-foreground, #569cd6); }
  .highlight-layer .token.punctuation { color: var(--vscode-editor-foreground, #d4d4d4); }
  .highlight-layer .token.operator { color: var(--vscode-editor-foreground, #d4d4d4); }
  .highlight-layer .token.comment { color: #6a9955; }

  .tree-container.wrap-enabled .tree-key,
  .tree-container.wrap-enabled .tree-value {
    word-break: break-all;
    overflow-wrap: break-word;
  }

  .tree-container:not(.wrap-enabled) .tree-item {
    flex-wrap: nowrap;
  }

  .tree-container:not(.wrap-enabled) .tree-key,
  .tree-container:not(.wrap-enabled) .tree-value {
    white-space: nowrap;
  }

  .tree-container.show-line-numbers {
    counter-reset: tree-line;
    position: relative;
    padding-left: 44px;
  }

  .tree-container.show-line-numbers .tree-item {
    counter-increment: tree-line;
    position: relative;
  }

  .tree-container.show-line-numbers .tree-item::before {
    content: counter(tree-line);
    position: absolute;
    left: var(--line-offset, 0);
    top: 4px;
    display: inline-block;
    min-width: 3ch;
    text-align: right;
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    flex-shrink: 0;
    user-select: none;
  }

  .tree-container {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    height: 100%;
  }

  .tree-container:not(.wrap-enabled) {
    overflow-x: auto;
  }

  .tree-node { margin-left: 0; }
  .tree-children { margin-left: 20px; }

  .tree-item {
    margin: 4px 0;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .tree-key {
    color: var(--vscode-json-property-syntax, #9cdcfe);
    font-weight: 500;
    cursor: pointer;
    border-radius: 3px;
    padding: 1px 4px;
    transition: background 0.15s;
  }

  .tree-key:hover {
    background: var(--vscode-input-background);
    outline: 1px dashed var(--vscode-panel-border);
  }

  .tree-colon {
    color: var(--vscode-editor-foreground);
    opacity: 0.6;
  }

  .tree-value {
    border-radius: 3px;
    padding: 1px 4px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .tree-value:hover {
    background: var(--vscode-input-background);
    outline: 1px dashed var(--vscode-panel-border);
  }

  .tree-value.string { color: var(--vscode-json-string-syntax, #ce9178); }
  .tree-value.number { color: var(--vscode-json-number-syntax, #b5cea8); }
  .tree-value.boolean { color: var(--vscode-json-boolean-syntax, #569cd6); }
  .tree-value.null { color: var(--vscode-json-null-foreground, #569cd6); font-style: italic; }
  .tree-value.empty-object,
  .tree-value.empty-array { color: var(--vscode-editor-foreground); opacity: 0.5; cursor: default; }
  .tree-value.empty-object:hover,
  .tree-value.empty-array:hover { background: transparent; outline: none; }

  .tree-toggle {
    cursor: pointer;
    user-select: none;
    width: 16px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--vscode-editor-foreground);
    opacity: 0.6;
    font-size: 12px;
    transition: opacity 0.15s;
  }

  .tree-toggle:hover { opacity: 1; }

  .tree-type-badge {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    margin-left: 8px;
    font-weight: 500;
    cursor: default;
  }

  .tree-actions {
    display: inline-flex;
    gap: 2px;
    margin-left: 6px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .tree-item:hover .tree-actions { opacity: 1; }

  .action-btn {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--vscode-editor-foreground);
    cursor: pointer;
    border-radius: 3px;
    font-size: 14px;
    line-height: 1;
    padding: 0;
  }

  .action-btn:hover {
    background: var(--vscode-input-background);
  }

  .action-btn.delete:hover { color: var(--vscode-errorForeground, #f48771); }

  .edit-input {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-focusBorder);
    border-radius: 3px;
    padding: 1px 4px;
    font-family: inherit;
    font-size: inherit;
    outline: none;
    min-width: 4ch;
  }

  .edit-input:focus { border-color: var(--vscode-focusBorder); }

  .error-container {
    padding: 16px;
    background: var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1));
    border: 1px solid var(--vscode-inputValidation-errorBorder, rgba(255, 0, 0, 0.3));
    border-radius: 4px;
    color: var(--vscode-errorForeground, #f48771);
  }

  .error-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .error-message {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--vscode-descriptionForeground);
    opacity: 0.6;
    font-size: 14px;
  }

  .error-indicator {
    position: absolute;
    left: 12px;
    bottom: 12px;
    display: none;
    z-index: 10;
  }

  .error-indicator.show { display: block; }

  .error-bulb {
    color: var(--vscode-errorForeground, #f48771);
    cursor: pointer;
    display: block;
    filter: drop-shadow(0 0 3px rgba(255, 0, 0, 0.25));
  }

  .error-popup {
    position: absolute;
    left: 34px;
    bottom: 0;
    min-width: 260px;
    max-width: calc(100vw - 80px);
    max-height: 45vh;
    overflow: auto;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-editorWidget-border, var(--vscode-inputValidation-errorBorder, rgba(255, 0, 0, 0.4)));
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    color: var(--vscode-errorForeground, #f48771);
    padding: 10px 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0s 0.15s;
  }

  .error-indicator:hover .error-popup,
  .error-indicator.hover .error-popup {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }

  .error-popup-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .sync-indicator {
    position: fixed;
    bottom: 16px;
    right: 16px;
    padding: 6px 12px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 100;
  }

  .sync-indicator.show { opacity: 1; }
</style>
</head>
<body>
<div class="container">
  <div class="toolbar">
    <div class="window-tabs">
      <button class="tab active" id="tabText" data-i18n="tabText">${t('json.tabText')}</button>
      <button class="tab" id="tabTree" data-i18n="tabTree">${t('json.tabTree')}</button>
    </div>
    <div class="toolbar-actions">
      <label class="checkbox-wrapper">
        <input type="checkbox" id="wrapCheckbox" checked>
        <span class="checkbox-label" data-i18n="wrap">${t('json.wrap')}</span>
      </label>
      <label class="checkbox-wrapper">
        <input type="checkbox" id="lineNumbersCheckbox">
        <span class="checkbox-label" data-i18n="lineNumbers">${t('json.lineNumbers')}</span>
      </label>
      <button class="btn btn-ghost" id="expandBtn" data-i18n="expand">${t('json.expand')}</button>
      <button class="btn btn-ghost" id="minifyBtn" data-i18n="minify">${t('json.minify')}</button>
      <button class="btn btn-ghost" id="exampleBtn" data-i18n="example">${t('json.example')}</button>
      <button class="btn btn-ghost" id="clearBtn" data-i18n="clear">${t('json.clear')}</button>
      <button class="btn btn-ghost" id="copyBtn" data-i18n="copy">${t('json.copy')}</button>
    </div>
  </div>

  <div class="window-stage">
    <div class="window-pane active" id="paneText">
      <div class="text-editor" id="textEditor">
        <div class="line-numbers" id="lineNumbers"></div>
        <div class="text-area-wrapper">
          <pre class="highlight-layer" id="highlightLayer" aria-hidden="true"></pre>
          <textarea id="jsonInput" placeholder="${t('json.placeholder')}" data-i18n-ph="placeholder" class="wrap-enabled"></textarea>
        </div>
      </div>
      <div class="error-indicator" id="errorIndicator">
        <svg class="error-bulb" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
        </svg>
        <div class="error-popup" id="errorPopup"></div>
      </div>
    </div>
    <div class="window-pane" id="paneTree">
      <div id="resultContainer" class="tree-container wrap-enabled">
        <div class="placeholder" data-i18n="waiting">${t('json.waiting')}</div>
      </div>
    </div>
  </div>
</div>

<div class="sync-indicator" id="syncIndicator" data-i18n="synced">${t('json.synced')}</div>

<script>
  // Prism.js core + JSON language definition (inlined)
  ${prismCore}
  ${prismJson}

  // 本地化文案（按打开时的语言解析注入）
  const i18n = ${i18nSource};

  // 语言切换时按 data-i18n* 属性批量更新 DOM 文案（i18n 对象同步刷新，供后续交互使用）
  window.addEventListener('message', function(e) {
    var d = e.data;
    if (!d || d.type !== 'localeChanged') return;
    if (d.i18n && typeof i18n !== 'undefined') Object.assign(i18n, d.i18n);
    if (d.locale) document.documentElement.lang = d.locale === 'zh-cn' ? 'zh-CN' : 'en';
    function val(k) { if (d.ui && d.ui[k] !== undefined) return d.ui[k]; if (d.i18n && d.i18n[k] !== undefined) return d.i18n[k]; return null; }
    document.querySelectorAll('[data-i18n]').forEach(function(el) { var v = val(el.getAttribute('data-i18n')); if (v !== null) el.textContent = v; });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el) { var v = val(el.getAttribute('data-i18n-ph')); if (v !== null) el.setAttribute('placeholder', v); });
  });

  const input = document.getElementById('jsonInput');
  const resultContainer = document.getElementById('resultContainer');
  const syncIndicator = document.getElementById('syncIndicator');
  const wrapCheckbox = document.getElementById('wrapCheckbox');
  const lineNumbersCheckbox = document.getElementById('lineNumbersCheckbox');
  const lineNumbers = document.getElementById('lineNumbers');
  const highlightLayer = document.getElementById('highlightLayer');
  const textEditor = document.getElementById('textEditor');
  const tabText = document.getElementById('tabText');
  const tabTree = document.getElementById('tabTree');
  const paneText = document.getElementById('paneText');
  const paneTree = document.getElementById('paneTree');
  const errorIndicator = document.getElementById('errorIndicator');
  const errorPopup = document.getElementById('errorPopup');

  let currentData = null;
  let expandedNodes = new Set();
  let isUpdatingFromTree = false;
  let parseTimer = null;

  // 窗口切换
  function switchWindow(name) {
    const isText = name === 'text';
    tabText.classList.toggle('active', isText);
    tabTree.classList.toggle('active', !isText);
    paneText.classList.toggle('active', isText);
    paneTree.classList.toggle('active', !isText);
  }

  function isTreeActive() {
    return paneTree.classList.contains('active');
  }

  // 展开/收起所有树节点（保留根节点展开，便于查看第一层）
  function expandAllTree() {
    if (currentData === null) return;
    expandedNodes.clear();
    autoExpand(currentData, '');
    renderTree();
  }

  function collapseAllTree() {
    if (currentData === null) return;
    expandedNodes.clear();
    if (currentData !== null && typeof currentData === 'object') {
      expandedNodes.add('');
    }
    renderTree();
  }

  tabText.addEventListener('click', () => switchWindow('text'));
  tabTree.addEventListener('click', () => switchWindow('tree'));

  // 初始化自动换行状态
  const savedWrap = localStorage.getItem('jsonParser.wrapEnabled');
  const wrapEnabled = savedWrap === null ? true : savedWrap === 'true';
  wrapCheckbox.checked = wrapEnabled;
  input.classList.toggle('wrap-enabled', wrapEnabled);
  highlightLayer.classList.toggle('wrap-enabled', wrapEnabled);
  resultContainer.classList.toggle('wrap-enabled', wrapEnabled);
  if (!wrapEnabled) {
    resultContainer.querySelectorAll('.tree-item').forEach(item => {
      item.style.flexWrap = 'nowrap';
    });
    resultContainer.querySelectorAll('.tree-key, .tree-value').forEach(el => {
      el.style.whiteSpace = 'nowrap';
    });
  }

  wrapCheckbox.addEventListener('change', () => {
    const enabled = wrapCheckbox.checked;
    input.classList.toggle('wrap-enabled', enabled);
    highlightLayer.classList.toggle('wrap-enabled', enabled);
    resultContainer.classList.toggle('wrap-enabled', enabled);
    if (enabled) {
      resultContainer.querySelectorAll('.tree-item').forEach(item => {
        item.style.flexWrap = 'wrap';
      });
      resultContainer.querySelectorAll('.tree-key, .tree-value').forEach(el => {
        el.style.whiteSpace = '';
      });
    } else {
      resultContainer.querySelectorAll('.tree-item').forEach(item => {
        item.style.flexWrap = 'nowrap';
      });
      resultContainer.querySelectorAll('.tree-key, .tree-value').forEach(el => {
        el.style.whiteSpace = 'nowrap';
      });
    }
    localStorage.setItem('jsonParser.wrapEnabled', String(enabled));
  });

  // 行号
  function updateLineNumbers() {
    if (!lineNumbersCheckbox.checked) return;
    const lines = input.value.split('\\n').length;
    const nums = [];
    for (let i = 1; i <= lines; i++) nums.push(i);
    lineNumbers.textContent = nums.join('\\n');
    lineNumbers.scrollTop = input.scrollTop;
  }

  // JSON 语法高亮 (Prism.js)
  function highlightJSON(text) {
    return Prism.highlight(text, Prism.languages.json, 'json') || '&nbsp;';
  }

  function updateHighlight() {
    highlightLayer.innerHTML = highlightJSON(input.value);
    highlightLayer.scrollTop = input.scrollTop;
    highlightLayer.scrollLeft = input.scrollLeft;
  }

  lineNumbersCheckbox.addEventListener('change', () => {
    const checked = lineNumbersCheckbox.checked;
    textEditor.classList.toggle('show-line-numbers', checked);
    resultContainer.classList.toggle('show-line-numbers', checked);
    if (checked) {
      updateLineNumbers();
      updateTreeLineNumbers();
    }
  });

  input.addEventListener('scroll', () => {
    highlightLayer.scrollTop = input.scrollTop;
    highlightLayer.scrollLeft = input.scrollLeft;
    if (lineNumbersCheckbox.checked) lineNumbers.scrollTop = input.scrollTop;
  });

  input.addEventListener('input', () => {
    updateHighlight();
    updateLineNumbers();
    clearTimeout(parseTimer);
    parseTimer = setTimeout(() => {
      isUpdatingFromTree = false;
      parseJSON();
    }, 300);
  });

  document.getElementById('expandBtn').addEventListener('click', () => {
    if (isTreeActive()) {
      expandAllTree();
      return;
    }
    if (currentData !== null) {
      input.value = JSON.stringify(currentData, null, 2);
    } else {
      try {
        const parsed = JSON.parse(input.value);
        input.value = JSON.stringify(parsed, null, 2);
      } catch (e) { return; }
    }
    isUpdatingFromTree = false;
    updateHighlight();
    updateLineNumbers();
    parseJSON();
  });

  document.getElementById('minifyBtn').addEventListener('click', () => {
    if (isTreeActive()) {
      collapseAllTree();
      return;
    }
    if (currentData !== null) {
      input.value = JSON.stringify(currentData);
    } else {
      try {
        const parsed = JSON.parse(input.value);
        input.value = JSON.stringify(parsed);
      } catch (e) { return; }
    }
    isUpdatingFromTree = false;
    updateHighlight();
    updateLineNumbers();
    parseJSON();
  });

  document.getElementById('exampleBtn').addEventListener('click', () => {
    const example = {
      name: "CodeKit",
      version: "0.0.3",
      description: "A toolkit of handy tools inside VS Code",
      features: [
        "JSON Parser - real-time JSON parsing and visualization",
        "Hello World - welcome animation",
        "Extensible tool architecture"
      ],
      stats: {
        tools: 2,
        version: "0.0.3",
        stable: true
      },
      tags: ["vscode", "extension", "toolkit"],
      empty: null,
      nested: {
        level1: {
          level2: {
            value: "deep"
          }
        }
      }
    };
    input.value = JSON.stringify(example, null, 2);
    isUpdatingFromTree = false;
    updateHighlight();
    updateLineNumbers();
    parseJSON();
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    input.value = '';
    currentData = null;
    expandedNodes.clear();
    resultContainer.innerHTML = '<div class="placeholder">' + i18n.waiting + '</div>';
    errorIndicator.classList.remove('show');
    updateHighlight();
    updateLineNumbers();
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    let text;
    if (isTreeActive()) {
      if (currentData === null) {
        showSyncIndicator(i18n.noData);
        return;
      }
      text = JSON.stringify(currentData, null, 2);
    } else {
      text = input.value;
      if (!text.trim()) {
        showSyncIndicator(i18n.noData);
        return;
      }
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showSyncIndicator(i18n.copied);
      });
    }
  });

  function parseJSON() {
    const text = input.value.trim();

    if (!text) {
      currentData = null;
      expandedNodes.clear();
      resultContainer.innerHTML = '<div class="placeholder">' + i18n.waiting + '</div>';
      errorIndicator.classList.remove('show');
      return;
    }

    try {
      currentData = JSON.parse(text);
      expandedNodes.clear();
      autoExpand(currentData, '');
      renderTree();
      errorIndicator.classList.remove('show');
    } catch (e) {
      showError(e);
    }
  }

  function autoExpand(value, path) {
    if (value !== null && typeof value === 'object') {
      expandedNodes.add(path);
      if (Array.isArray(value)) {
        value.forEach((v, i) => autoExpand(v, path ? path + '.' + i : String(i)));
      } else {
        Object.entries(value).forEach(([k, v]) => autoExpand(v, path ? path + '.' + k : k));
      }
    }
  }

  function renderTree() {
    if (currentData === null) {
      resultContainer.innerHTML = '<div class="placeholder">' + i18n.waiting + '</div>';
      return;
    }
    resultContainer.innerHTML = '';
    resultContainer.appendChild(renderValue(currentData, '', null, 0));
    if (!wrapCheckbox.checked) {
      resultContainer.querySelectorAll('.tree-item').forEach(item => {
        item.style.flexWrap = 'nowrap';
      });
      resultContainer.querySelectorAll('.tree-key, .tree-value').forEach(el => {
        el.style.whiteSpace = 'nowrap';
      });
    }
    updateTreeLineNumbers();
  }

  // 编辑窗行号：根据每个 tree-item 的 offsetLeft 计算 CSS 变量，让行号左对齐
  function updateTreeLineNumbers() {
    if (!lineNumbersCheckbox.checked) return;
    resultContainer.querySelectorAll('.tree-item').forEach(item => {
      item.style.setProperty('--line-offset', (-item.offsetLeft + 12) + 'px');
    });
  }

  function renderValue(value, path, key, depth) {
    if (value === null) {
      return renderPrimitive(path, key, 'null', null);
    } else if (Array.isArray(value)) {
      return renderArray(path, key, value, depth);
    } else if (typeof value === 'object') {
      return renderObject(path, key, value, depth);
    } else {
      const type = typeof value;
      return renderPrimitive(path, key, type, value);
    }
  }

  function renderPrimitive(path, key, type, value) {
    const item = document.createElement('div');
    item.className = 'tree-item';

    if (key !== null) {
      item.appendChild(createKeySpan(key, path));
      item.appendChild(createColon());
    }

    item.appendChild(createValueSpan(type, value, path));

    const badge = document.createElement('span');
    badge.className = 'tree-type-badge';
    badge.textContent = type;
    item.appendChild(badge);

    if (key !== null) {
      item.appendChild(createActions(path, key));
    }

    return item;
  }

  function renderArray(path, key, array, depth) {
    const wrapper = document.createElement('div');
    const item = document.createElement('div');
    item.className = 'tree-item';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    const isExpanded = expandedNodes.has(path);
    toggle.textContent = isExpanded ? '▼' : '▶';
    toggle.addEventListener('click', () => toggleNode(path));

    if (key !== null) {
      item.appendChild(createKeySpan(key, path));
      item.appendChild(createColon());
    }
    item.appendChild(toggle);

    const count = document.createElement('span');
    count.className = 'tree-value';
    count.textContent = array.length === 0 ? '[]' : '[...]';
    item.appendChild(count);

    const badge = document.createElement('span');
    badge.className = 'tree-type-badge';
    badge.textContent = 'array';
    item.appendChild(badge);

    if (array.length === 0) {
      count.classList.add('empty-array');
      toggle.style.visibility = 'hidden';
    }

    item.appendChild(createActions(path, key));
    wrapper.appendChild(item);

    if (isExpanded && array.length > 0) {
      const container = document.createElement('div');
      container.className = 'tree-children';
      array.forEach((val, i) => {
        const childPath = path ? path + '.' + i : String(i);
        container.appendChild(renderValue(val, childPath, String(i), depth + 1));
      });
      wrapper.appendChild(container);
    }

    return wrapper;
  }

  function renderObject(path, key, obj, depth) {
    const wrapper = document.createElement('div');
    const item = document.createElement('div');
    item.className = 'tree-item';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    const isExpanded = expandedNodes.has(path);
    toggle.textContent = isExpanded ? '▼' : '▶';
    toggle.addEventListener('click', () => toggleNode(path));

    if (key !== null) {
      item.appendChild(createKeySpan(key, path));
      item.appendChild(createColon());
    }
    item.appendChild(toggle);

    const keys = Object.keys(obj);
    const count = document.createElement('span');
    count.className = 'tree-value';
    count.textContent = keys.length === 0 ? '{}' : '{...}';
    item.appendChild(count);

    const badge = document.createElement('span');
    badge.className = 'tree-type-badge';
    badge.textContent = 'object';
    item.appendChild(badge);

    if (keys.length === 0) {
      count.classList.add('empty-object');
      toggle.style.visibility = 'hidden';
    }

    item.appendChild(createActions(path, key));
    wrapper.appendChild(item);

    if (isExpanded && keys.length > 0) {
      const container = document.createElement('div');
      container.className = 'tree-children';
      Object.entries(obj).forEach(([k, val]) => {
        const childPath = path ? path + '.' + k : k;
        container.appendChild(renderValue(val, childPath, k, depth + 1));
      });
      wrapper.appendChild(container);
    }

    return wrapper;
  }

  function createKeySpan(key, parentPath) {
    const keySpan = document.createElement('span');
    keySpan.className = 'tree-key';
    keySpan.textContent = key;
    keySpan.title = i18n.editKey;
    keySpan.addEventListener('click', (e) => {
      e.stopPropagation();
      editKey(keySpan, parentPath, key);
    });
    return keySpan;
  }

  function createColon() {
    const colon = document.createElement('span');
    colon.className = 'tree-colon';
    colon.textContent = ':';
    return colon;
  }

  function createValueSpan(type, value, path) {
    const valueSpan = document.createElement('span');
    valueSpan.className = 'tree-value ' + type;

    if (type === 'string') {
      valueSpan.textContent = '"' + escapeHtml(value) + '"';
      valueSpan.title = i18n.editString;
      valueSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        editPrimitive(valueSpan, path, 'string');
      });
    } else if (type === 'number') {
      valueSpan.textContent = String(value);
      valueSpan.title = i18n.editNumber;
      valueSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        editPrimitive(valueSpan, path, 'number');
      });
    } else if (type === 'boolean') {
      valueSpan.textContent = value ? 'true' : 'false';
      valueSpan.title = i18n.toggleBool;
      valueSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBoolean(path);
      });
    } else if (type === 'null') {
      valueSpan.textContent = 'null';
      valueSpan.title = i18n.changeType;
      valueSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        changeNullType(path);
      });
    }

    return valueSpan;
  }

  function createActions(path, key) {
    const actions = document.createElement('span');
    actions.className = 'tree-actions';

    if (key !== null) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete';
      deleteBtn.title = i18n.delete;
      deleteBtn.textContent = '\u00d7';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNode(path);
      });
      actions.appendChild(deleteBtn);
    } else {
      const addBtn = document.createElement('button');
      addBtn.className = 'action-btn';
      addBtn.title = path && getValueAtPath(path) !== null && typeof getValueAtPath(path) === 'object' && !Array.isArray(getValueAtPath(path)) ? i18n.addProperty : i18n.addElement;
      addBtn.textContent = '+';
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = getValueAtPath(path);
        if (Array.isArray(val)) {
          addArrayItem(path);
        } else if (val && typeof val === 'object') {
          addObjectKey(path);
        }
      });
      actions.appendChild(addBtn);
    }

    return actions;
  }

  function toggleNode(path) {
    if (expandedNodes.has(path)) {
      expandedNodes.delete(path);
    } else {
      expandedNodes.add(path);
    }
    renderTree();
  }

  function getValueAtPath(path) {
    if (!path) return currentData;
    const keys = path.split('.');
    return keys.reduce((acc, key) => acc[key], currentData);
  }

  function setValueAtPath(path, value) {
    if (!path) {
      currentData = value;
      return;
    }
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => acc[key], currentData);
    target[lastKey] = value;
  }

  function deleteValueAtPath(path) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => acc[key], currentData);
    if (Array.isArray(target)) {
      const idx = parseInt(lastKey);
      target.splice(idx, 1);
      reindexExpandedNodesAfterDelete(path, idx);
    } else {
      delete target[lastKey];
    }
  }

  function reindexExpandedNodesAfterDelete(deletedPath, deletedIdx) {
    const parentPath = deletedPath.substring(0, deletedPath.lastIndexOf('.'));
    expandedNodes.forEach(p => {
      if (p.startsWith(deletedPath + '.')) {
        expandedNodes.delete(p);
      }
    });
    if (parentPath) {
      const prefix = parentPath + '.';
      expandedNodes.forEach(p => {
        if (p.startsWith(prefix)) {
          const rest = p.substring(prefix.length);
          const dotIdx = rest.indexOf('.');
          const firstSegment = dotIdx >= 0 ? rest.substring(0, dotIdx) : rest;
          const idx = parseInt(firstSegment);
          if (!isNaN(idx) && idx > deletedIdx) {
            const newPath = prefix + (idx - 1) + (dotIdx >= 0 ? rest.substring(dotIdx) : '');
            expandedNodes.delete(p);
            expandedNodes.add(newPath);
          }
        }
      });
    }
  }

  function syncLeftPanel() {
    if (currentData !== null && !isUpdatingFromTree) {
      isUpdatingFromTree = true;
      const text = JSON.stringify(currentData, null, 2);
      if (input.value !== text) {
        input.value = text;
        showSyncIndicator(i18n.synced);
        updateHighlight();
        updateLineNumbers();
      }
      setTimeout(() => { isUpdatingFromTree = false; }, 500);
    }
  }

  function showSyncIndicator(text) {
    syncIndicator.textContent = text;
    syncIndicator.classList.add('show');
    setTimeout(() => syncIndicator.classList.remove('show'), 1200);
  }

  let activeEditor = null;

  window.addEventListener('keyup', (e) => {
    if (!activeEditor) return;
    if (e.keyCode === 13) {
      e.preventDefault();
      activeEditor.commit();
    } else if (e.keyCode === 27) {
      e.preventDefault();
      activeEditor.cancel();
    }
  });

  function editPrimitive(valueSpan, path, type) {
    if (valueSpan.querySelector('input')) return;

    const currentValue = getValueAtPath(path);
    const input = document.createElement('input');
    input.className = 'edit-input';
    input.type = type === 'number' ? 'number' : 'text';

    if (type === 'string') {
      input.value = currentValue;
    } else if (type === 'number') {
      input.value = String(currentValue);
    }
    input.style.width = Math.max(input.value.length + 2, 6) + 'ch';

    valueSpan.textContent = '';
    valueSpan.appendChild(input);
    input.focus();
    input.select();

    let handled = false;

    const commit = () => {
      if (handled) return;
      handled = true;
      if (activeEditor && activeEditor.input === input) {
        activeEditor = null;
      }
      let newVal;
      if (type === 'number') {
        newVal = parseFloat(input.value);
        if (isNaN(newVal)) {
          newVal = 0;
        }
      } else {
        newVal = input.value;
      }
      setValueAtPath(path, newVal);
      renderTree();
      syncLeftPanel();
    };

    const cancel = () => {
      if (handled) return;
      handled = true;
      if (activeEditor && activeEditor.input === input) {
        activeEditor = null;
      }
      renderTree();
    };

    activeEditor = { input, commit, cancel };

    input.addEventListener('blur', () => {
      setTimeout(() => { if (!handled) commit(); }, 100);
    });
  }

  function toggleBoolean(path) {
    const val = getValueAtPath(path);
    setValueAtPath(path, !val);
    renderTree();
    syncLeftPanel();
  }

  function changeNullType(path) {
    const val = prompt(i18n.changeNullPrompt, 'string / number / boolean / object / array');
    if (val === null) return;

    const type = val.trim().toLowerCase();
    let newVal;
    switch (type) {
      case 'string': newVal = ''; break;
      case 'number': newVal = 0; break;
      case 'boolean': newVal = false; break;
      case 'object': newVal = {}; break;
      case 'array': newVal = []; break;
      default: return;
    }
    setValueAtPath(path, newVal);
    if (newVal !== null && typeof newVal === 'object') {
      expandedNodes.add(path);
    }
    renderTree();
    syncLeftPanel();
  }

  function editKey(keySpan, nodePath, oldKey) {
    if (keySpan.querySelector('input')) return;

    const input = document.createElement('input');
    input.className = 'edit-input';
    input.value = oldKey;
    input.style.width = Math.max(input.value.length + 2, 6) + 'ch';

    keySpan.textContent = '';
    keySpan.appendChild(input);
    input.focus();
    input.select();

    const lastDot = nodePath.lastIndexOf('.');
    const parentPath = lastDot >= 0 ? nodePath.substring(0, lastDot) : '';

    let handled = false;

    const commit = () => {
      if (handled) return;
      handled = true;
      if (activeEditor && activeEditor.input === input) {
        activeEditor = null;
      }
      const newKey = input.value.trim();
      if (!newKey || newKey === oldKey) {
        renderTree();
        return;
      }
      const target = getValueAtPath(parentPath);
      if (target && typeof target === 'object' && !Array.isArray(target)) {
        target[newKey] = target[oldKey];
        delete target[oldKey];
        const oldPrefix = parentPath ? parentPath + '.' + oldKey : oldKey;
        const newPrefix = parentPath ? parentPath + '.' + newKey : newKey;
        expandedNodes.forEach(p => {
          if (p === oldPrefix || p.startsWith(oldPrefix + '.')) {
            const newPath = newPrefix + p.substring(oldPrefix.length);
            expandedNodes.delete(p);
            expandedNodes.add(newPath);
          }
        });
        renderTree();
        syncLeftPanel();
      } else {
        renderTree();
      }
    };

    const cancel = () => {
      if (handled) return;
      handled = true;
      if (activeEditor && activeEditor.input === input) {
        activeEditor = null;
      }
      renderTree();
    };

    activeEditor = { input, commit, cancel };

    input.addEventListener('blur', () => {
      setTimeout(() => { if (!handled) commit(); }, 100);
    });
  }

  function addArrayItem(path) {
    const arr = getValueAtPath(path);
    if (!Array.isArray(arr)) return;
    arr.push(null);
    expandedNodes.add(path);
    renderTree();
    syncLeftPanel();
  }

  function addObjectKey(path) {
    const obj = getValueAtPath(path);
    if (!obj || typeof obj !== 'object') return;
    const baseKey = 'key' + (Object.keys(obj).length + 1);
    let finalKey = baseKey;
    let counter = 1;
    while (finalKey in obj) {
      finalKey = baseKey + '_' + counter++;
    }
    obj[finalKey] = null;
    expandedNodes.add(path);
    renderTree();
    syncLeftPanel();
  }

  function deleteNode(path) {
    expandedNodes.forEach(p => {
      if (p === path || p.startsWith(path + '.')) {
        expandedNodes.delete(p);
      }
    });
    const parentPath = path.substring(0, path.lastIndexOf('.'));
    const lastKey = path.substring(path.lastIndexOf('.') + 1);
    const parent = parentPath ? getValueAtPath(parentPath) : currentData;

    if (Array.isArray(parent)) {
      const idx = parseInt(lastKey);
      parent.splice(idx, 1);
      reindexExpandedNodesAfterDelete(path, idx);
    } else {
      delete parent[lastKey];
    }

    renderTree();
    syncLeftPanel();
  }

  function showError(error) {
    const errorMessage = error.message;
    const lineMatch = errorMessage.match(/line (\\d+)/);
    const columnMatch = errorMessage.match(/column (\\d+)/);
    const locationText = (lineMatch && columnMatch)
      ? i18n.line + ' ' + lineMatch[1] + ', ' + i18n.column + ' ' + columnMatch[1]
      : '';

    // 文本窗左下角小灯泡（hover 显示错误详情）
    errorPopup.innerHTML = '';
    const popTitle = document.createElement('div');
    popTitle.className = 'error-popup-title';
    popTitle.textContent = i18n.parseFailed + (locationText ? ' · ' + locationText : '');
    errorPopup.appendChild(popTitle);
    const popMsg = document.createElement('div');
    popMsg.textContent = errorMessage;
    errorPopup.appendChild(popMsg);
    errorIndicator.classList.add('show');

    // 编辑窗错误容器（用户手动切到编辑窗时可见）
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';
    const title = document.createElement('div');
    title.className = 'error-title';
    title.textContent = i18n.parseFailed;
    errorDiv.appendChild(title);
    const message = document.createElement('div');
    message.className = 'error-message';
    if (lineMatch && columnMatch) {
      message.innerHTML = '<strong>' + i18n.location + ':</strong> ' + i18n.line + ' ' + lineMatch[1] + ', ' + i18n.column + ' ' + columnMatch[1] + '<br><br>';
      message.innerHTML += '<strong>' + i18n.error + ':</strong> ' + escapeHtml(errorMessage);
    } else {
      message.textContent = errorMessage;
    }
    errorDiv.appendChild(message);
    resultContainer.innerHTML = '';
    resultContainer.appendChild(errorDiv);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 初始化高亮
  updateHighlight();
</script>
</body>
</html>`;
}
