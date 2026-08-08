/** JWT 解码专用 WebView：纵向布局——菜单栏、Token 输入框、错误提示、header/payload/signature 三个结果区。 */
import { getLocale, t } from '../i18n';

/** JWT WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getJwtUI() {
  return {
    title: t('tool.jwt.name'),
    input: t('jwt.input'),
    placeholder: t('jwt.placeholder'),
    header: t('jwt.header'),
    payload: t('jwt.payload'),
    signature: t('jwt.signature'),
    invalid: t('jwt.invalid'),
    decodeError: t('jwt.decodeError'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
  };
}

const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNvZGVLaXQiLCJpYXQiOjE3MDAwMDAwMDB9.a_dCFmbWWXCMsVH4HVH_1siRIhzXGgO0KZPud-sIUXo';

export function getJwtWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getJwtUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.jwt.name')}</title>
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
  .input-section {
    padding: 10px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .pane-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground, #888);
  }
  textarea#input {
    width: 100%;
    margin-top: 6px;
    padding: 8px 10px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 12px;
    line-height: 1.5;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
    resize: none;
    white-space: pre;
    word-break: break-all;
  }
  textarea#input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  textarea#input::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  .error-line {
    display: none;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--vscode-errorForeground, #f48771);
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .error-line.show { display: block; }
  .results {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 0;
  }
  .result-section {
    padding: 6px 12px;
  }
  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
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
    position: relative;
  }
  .icon-btn:hover { color: var(--vscode-foreground, #ccc); background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.08)); }
  .icon-btn svg { display: block; }
  .icon-btn[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute; top: calc(100% + 4px); right: 0;
    padding: 3px 8px;
    background: var(--vscode-editorWidget-background, #252526);
    border: 1px solid var(--vscode-editorWidget-border, rgba(255,255,255,0.1));
    border-radius: 3px; font-size: 11px; white-space: nowrap;
    color: var(--vscode-foreground, #ccc); z-index: 100; pointer-events: none;
  }
  pre.result-json {
    margin: 0;
    padding: 8px 10px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 12px;
    line-height: 1.5;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.03));
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    border-radius: 3px;
    white-space: pre-wrap;
    word-break: break-all;
    user-select: text;
  }
  .empty-hint {
    padding: 24px 12px;
    text-align: center;
    color: var(--vscode-input-placeholderForeground, #666);
    font-size: 12px;
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.jwt.name')}</button>
    <div class="toolbar-actions">
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="input-section">
    <span class="pane-label" data-i18n="input">${ui.input}</span>
    <textarea id="input" rows="3" placeholder="${ui.placeholder}" data-i18n-ph="placeholder" spellcheck="false" autofocus></textarea>
  </div>
  <div class="error-line" id="errorLine"></div>
  <div class="results">
    <div class="empty-hint" id="emptyHint" data-i18n="placeholder">${ui.placeholder}</div>
    <div class="result-section" id="secHeader">
      <div class="result-header">
        <span class="pane-label" data-i18n="header">${ui.header}</span>
        <button class="icon-btn" id="copyHeader" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/></svg>
        </button>
      </div>
      <pre class="result-json" id="headerJson"></pre>
    </div>
    <div class="result-section" id="secPayload">
      <div class="result-header">
        <span class="pane-label" data-i18n="payload">${ui.payload}</span>
        <button class="icon-btn" id="copyPayload" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/></svg>
        </button>
      </div>
      <pre class="result-json" id="payloadJson"></pre>
    </div>
    <div class="result-section" id="secSignature">
      <div class="result-header">
        <span class="pane-label" data-i18n="signature">${ui.signature}</span>
        <button class="icon-btn" id="copySignature" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/></svg>
        </button>
      </div>
      <pre class="result-json" id="signatureHex"></pre>
    </div>
  </div>
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
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'localeChanged') { emptyHint.textContent = ui.placeholder; parse(); }
  });
  const ui = ${uiSource};
  const input = document.getElementById('input');
  const errorLine = document.getElementById('errorLine');
  const emptyHint = document.getElementById('emptyHint');
  const headerJson = document.getElementById('headerJson');
  const payloadJson = document.getElementById('payloadJson');
  const signatureHex = document.getElementById('signatureHex');

  function b64urlDecode(s) {
    let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  function b64urlToHex(s) {
    let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    let hex = '';
    for (let i = 0; i < bin.length; i++) {
      const c = bin.charCodeAt(i).toString(16);
      hex += (c.length < 2 ? '0' : '') + c;
    }
    return hex;
  }

  function showError(msg) {
    errorLine.textContent = msg;
    errorLine.classList.add('show');
    emptyHint.style.display = 'none';
    headerJson.textContent = '';
    payloadJson.textContent = '';
    signatureHex.textContent = '';
  }
  function hideError() {
    errorLine.classList.remove('show');
  }

  function parse() {
    const token = input.value.trim();
    if (!token) {
      hideError();
      emptyHint.style.display = 'block';
      headerJson.textContent = '';
      payloadJson.textContent = '';
      signatureHex.textContent = '';
      return;
    }
    emptyHint.style.display = 'none';
    const parts = token.split('.');
    if (parts.length !== 3) { showError(ui.invalid); return; }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      headerJson.textContent = JSON.stringify(header, null, 2);
      payloadJson.textContent = JSON.stringify(payload, null, 2);
      signatureHex.textContent = b64urlToHex(parts[2]);
      hideError();
    } catch (e) {
      showError(ui.decodeError);
    }
  }

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(parse, 200);
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    input.value = ${JSON.stringify(SAMPLE_TOKEN)};
    parse();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    input.value = '';
    parse();
    input.focus();
  });

  function bindCopy(btnId, el) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      const text = el.textContent;
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          btn.setAttribute('data-tooltip', ui.copied);
          setTimeout(() => { btn.setAttribute('data-tooltip', ui.copy); }, 1200);
        });
      }
    });
  }
  bindCopy('copyHeader', headerJson);
  bindCopy('copyPayload', payloadJson);
  bindCopy('copySignature', signatureHex);

  // 接收扩展发来的文本，填充到输入窗并触发解析（由 Open xxx 命令发送）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setInput') {
      input.value = e.data.text;
      input.dispatchEvent(new Event('input'));
    }
  });

  // 初始文本（由 Open xxx 命令通过 run(context, initialText) 传入）
  var initialText = ${initialTextSource};
  if (initialText) {
    input.value = initialText;
    input.dispatchEvent(new Event('input'));
  }
</script>
</body>
</html>`;
}
