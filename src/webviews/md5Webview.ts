/** MD5 专用 WebView：纵向布局——菜单栏、哈希行（label+复制+哈希值）、输入标题、输入框，实时计算。 */
import * as fs from 'fs';
import * as path from 'path';
import { getLocale, t } from '../i18n';

// 运行时读取 blueimp-md5 库并内联到 WebView
const md5Lib = fs.readFileSync(
  path.join(__dirname, '../../resources/md5/md5.min.js'),
  'utf8',
);

/** MD5 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getMd5UI() {
  return {
    title: t('tool.md5.name'),
    input: t('md5.input'),
    output: t('md5.output'),
    placeholder: t('md5.placeholder'),
    wrap: t('common.wrap'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
    lowercase: t('common.lowercase'),
    uppercase: t('common.uppercase'),
  };
}

export function getMd5WebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getMd5UI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.md5.name')}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    display: flex;
    flex-direction: column;
    font-family: var(--vscode-font-family, "Segoe UI", system-ui, sans-serif);
    color: var(--vscode-foreground, #ccc);
    background: var(--vscode-editor-background, #1e1e1e);
  }
  /* —— 行1：菜单栏 —— */
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--vscode-editorGroupHeader-tabsBackground, transparent);
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
    font-size: 12px;
    gap: 8px;
  }
  .title-badge {
    background: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #fff);
    border: 1px solid var(--vscode-button-background, #0e639c);
    padding: 4px 14px;
    border-radius: 3px;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    cursor: default;
  }
  .toolbar-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .toolbar-actions label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    user-select: none;
    color: var(--vscode-foreground, #ccc);
  }
  .toolbar-actions input[type="radio"] {
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border: 1.5px solid var(--vscode-input-border, rgba(255,255,255,0.3));
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
    background: transparent;
  }
  .toolbar-actions input[type="radio"]:checked {
    border-color: #fff;
    background: #fff;
  }
  .toolbar-actions .btn {
    padding: 4px 14px;
    font-size: 12px;
    font-family: inherit;
    color: var(--vscode-button-secondaryForeground, #ccc);
    background: var(--vscode-button-secondaryBackground, rgba(255,255,255,0.06));
    border: 1px solid var(--vscode-button-secondaryBorder, rgba(255,255,255,0.14));
    border-radius: 3px;
    cursor: pointer;
  }
  .toolbar-actions .btn:hover { background: var(--vscode-button-secondaryHoverBackground, rgba(255,255,255,0.12)); }
  /* —— 行2：哈希行 —— */
  .hash-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .hash-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground, #888);
    flex-shrink: 0;
  }
  .icon-btn {
    padding: 3px;
    background: transparent;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    color: var(--vscode-descriptionForeground, #888);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    position: relative;
  }
  .icon-btn:hover { color: var(--vscode-foreground, #ccc); background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.08)); }
  .icon-btn svg { display: block; }
  .icon-btn[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute; top: calc(100% + 4px); left: 50%; transform: translateX(-50%);
    padding: 3px 8px;
    background: var(--vscode-editorWidget-background, #252526);
    border: 1px solid var(--vscode-editorWidget-border, rgba(255,255,255,0.1));
    border-radius: 3px; font-size: 11px; white-space: nowrap;
    color: var(--vscode-foreground, #ccc); z-index: 100; pointer-events: none;
  }
  .hash-value {
    flex: 1 1 auto;
    min-width: 0;
    padding: 5px 10px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    line-height: 1.5;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.03));
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .hash-value:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  /* —— 行3：输入标题 —— */
  .input-header {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .input-header .pane-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground, #888);
  }
  /* —— 行4：输入 textview —— */
  textarea {
    flex: 1 1 auto;
    min-height: 0;
    resize: none;
    padding: 12px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: var(--vscode-editor-font-size, 13px);
    line-height: 1.5;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: none; outline: none; overflow: auto;
    white-space: pre;
  }
  body.wrap textarea { white-space: pre-wrap; word-break: break-all; }
  textarea:focus { box-shadow: inset 0 0 0 1px var(--vscode-focusBorder, #007fd4); }
  textarea::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.md5.name')}</button>
    <div class="toolbar-actions">
      <label><input type="radio" name="case" value="lower" checked><span data-i18n="lowercase">${ui.lowercase}</span></label>
      <label><input type="radio" name="case" value="upper"><span data-i18n="uppercase">${ui.uppercase}</span></label>
      <label><input type="checkbox" id="cbWrap" checked><span data-i18n="wrap">${ui.wrap}</span></label>
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="hash-row">
    <span class="hash-label" data-i18n="output">${ui.output}</span>
    <button class="icon-btn" id="copyOutput" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/>
      </svg>
    </button>
    <input type="text" class="hash-value" id="output" readonly>
  </div>
  <div class="input-header">
    <span class="pane-label" data-i18n="input">${ui.input}</span>
  </div>
  <textarea id="input" placeholder="${ui.placeholder}" data-i18n-ph="placeholder" spellcheck="false" autofocus></textarea>
<script>
  // 语言切换时按 data-i18n* 属性批量更新 DOM 文案（ui 对象同步刷新，供后续交互使用）
  window.addEventListener('message', function(e) {
    var d = e.data;
    if (!d || d.type !== 'localeChanged') return;
    if (d.ui && typeof ui !== 'undefined') Object.assign(ui, d.ui);
    if (d.locale) document.documentElement.lang = d.locale === 'zh-cn' ? 'zh-CN' : 'en';
    function val(k) { return (d.ui && d.ui[k] !== undefined) ? d.ui[k] : null; }
    document.querySelectorAll('[data-i18n]').forEach(function(el) { var v = val(el.getAttribute('data-i18n')); if (v !== null) el.textContent = v; });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el) { var v = val(el.getAttribute('data-i18n-ph')); if (v !== null) el.setAttribute('placeholder', v); });
    document.querySelectorAll('[data-i18n-tip]').forEach(function(el) { var v = val(el.getAttribute('data-i18n-tip')); if (v !== null) el.setAttribute('data-tooltip', v); });
  });
  ${md5Lib}
  const ui = ${uiSource};
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const cbWrap = document.getElementById('cbWrap');
  const copyBtn = document.getElementById('copyOutput');
  let useUpper = false;

  cbWrap.addEventListener('change', () => { document.body.classList.toggle('wrap', cbWrap.checked); });
  document.body.classList.toggle('wrap', cbWrap.checked);

  function compute() {
    const text = input.value;
    if (!text) { output.value = ''; return; }
    const hash = md5(text);
    output.value = useUpper ? hash.toUpperCase() : hash;
  }

  document.querySelectorAll('input[name="case"]').forEach((r) => {
    r.addEventListener('change', (e) => { useUpper = e.target.value === 'upper'; compute(); });
  });

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(compute, 150);
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    input.value = 'Hello, MD5!\\n你好，世界！';
    compute();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    input.value = ''; output.value = ''; input.focus();
  });

  copyBtn.addEventListener('click', () => {
    const text = output.value;
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.setAttribute('data-tooltip', ui.copied);
        setTimeout(() => { copyBtn.setAttribute('data-tooltip', ui.copy); }, 1200);
      });
    }
  });

  // 接收扩展发来的文本，填充到输入窗并触发计算（由 Open MD5 命令发送）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setInput') {
      input.value = e.data.text;
      input.dispatchEvent(new Event('input'));
    }
  });

  // 初始文本（由 Open MD5 命令通过 run(context, initialText) 传入）
  var initialText = ${initialTextSource};
  if (initialText) {
    input.value = initialText;
    input.dispatchEvent(new Event('input'));
  }
</script>
</body>
</html>`;
}
