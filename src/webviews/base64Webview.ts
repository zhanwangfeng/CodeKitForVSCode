/** Base64 专用 WebView：左右布局，左明文右密文，双向实时同步，解码失败时右窗左下角小灯泡提示。 */
import { getLocale, t } from '../i18n';

/** Base64 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getBase64UI() {
  return {
    title: t('tool.base64.name'),
    plaintext: t('base64.plaintext'),
    ciphertext: t('base64.ciphertext'),
    placeholderLeft: t('base64.placeholder.left'),
    placeholderRight: t('base64.placeholder.right'),
    copy: t('base64.copy'),
    copied: t('base64.copied'),
    errorDecode: t('base64.error.decode'),
    wrap: t('base64.wrap'),
    lineNumbers: t('base64.lineNumbers'),
    sample: t('base64.sample'),
    clear: t('base64.clear'),
  };
}

export function getBase64WebviewContent(): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getBase64UI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.base64.name')}</title>
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

  /* —— 顶部公共工具栏 —— */
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
  .toolbar-actions input[type="checkbox"] {
    accent-color: var(--vscode-checkbox-background, #0e639c);
    cursor: pointer;
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

  /* —— 左右分栏 —— */
  .panes {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
  }
  .pane {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
  }
  .pane + .pane { border-left: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08)); }
  .pane-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .pane-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground, #888);
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
  }
  .icon-btn:hover {
    color: var(--vscode-foreground, #ccc);
    background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.08));
  }
  .icon-btn svg { display: block; }
  .icon-btn[data-tooltip] { position: relative; }
  .icon-btn[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    padding: 3px 8px;
    background: var(--vscode-editorWidget-background, #252526);
    border: 1px solid var(--vscode-editorWidget-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    font-size: 11px;
    white-space: nowrap;
    color: var(--vscode-foreground, #ccc);
    z-index: 100;
    pointer-events: none;
  }

  /* —— 编辑区（行号 + textarea）—— */
  .editor {
    flex: 1 1 auto;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .gutter {
    display: none;
    flex-shrink: 0;
    padding: 12px 8px 12px 12px;
    text-align: right;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: var(--vscode-editor-font-size, 13px);
    line-height: 1.5;
    color: var(--vscode-editorLineNumber-foreground, #858585);
    background: var(--vscode-editorGutter-background, transparent);
    user-select: none;
    overflow: hidden;
    white-space: pre;
  }
  .editor.show-gutter .gutter { display: block; }
  textarea {
    flex: 1 1 auto;
    min-width: 0;
    resize: none;
    padding: 12px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: var(--vscode-editor-font-size, 13px);
    line-height: 1.5;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: none;
    outline: none;
    overflow: auto;
    white-space: pre;
  }
  body.wrap textarea { white-space: pre-wrap; word-break: break-all; }
  textarea:focus { box-shadow: inset 0 0 0 1px var(--vscode-focusBorder, #007fd4); }
  textarea::placeholder { color: var(--vscode-input-placeholderForeground, #666); }

  /* —— 小灯泡错误提示（与 JSON Parser 同风格）—— */
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
    min-width: 220px;
    max-width: calc(50vw - 60px);
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
</style>
</head>
<body>
  <!-- 顶部公共工具栏 -->
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.base64.name')}</button>
    <div class="toolbar-actions">
      <label><input type="checkbox" id="cbWrap" checked><span data-i18n="wrap">${ui.wrap}</span></label>
      <label><input type="checkbox" id="cbLines"><span data-i18n="lineNumbers">${ui.lineNumbers}</span></label>
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>

  <div class="panes">
    <!-- 左：明文 -->
    <div class="pane">
      <div class="pane-header">
        <span class="pane-label" data-i18n="plaintext">${ui.plaintext}</span>
        <button class="icon-btn" id="copyLeft" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/>
          </svg>
        </button>
      </div>
      <div class="editor" id="editorLeft">
        <div class="gutter" id="gutterLeft"></div>
        <textarea id="left" placeholder="${ui.placeholderLeft}" data-i18n-ph="placeholderLeft" spellcheck="false" autofocus></textarea>
      </div>
    </div>
    <!-- 右：密文 -->
    <div class="pane">
      <div class="pane-header">
        <span class="pane-label" data-i18n="ciphertext">${ui.ciphertext}</span>
        <button class="icon-btn" id="copyRight" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/>
          </svg>
        </button>
      </div>
      <div class="editor" id="editorRight">
        <div class="gutter" id="gutterRight"></div>
        <textarea id="right" placeholder="${ui.placeholderRight}" data-i18n-ph="placeholderRight" spellcheck="false"></textarea>
      </div>
      <div class="error-indicator" id="errorIndicator">
        <svg class="error-bulb" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
        </svg>
        <div class="error-popup">
          <div class="error-popup-title" id="errorTitle" data-i18n="errorDecode">${ui.errorDecode}</div>
          <div id="errorDetail"></div>
        </div>
      </div>
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
  const ui = ${uiSource};
  const left = document.getElementById('left');
  const right = document.getElementById('right');
  const gutterLeft = document.getElementById('gutterLeft');
  const gutterRight = document.getElementById('gutterRight');
  const editorLeft = document.getElementById('editorLeft');
  const editorRight = document.getElementById('editorRight');
  const errorIndicator = document.getElementById('errorIndicator');
  const errorDetail = document.getElementById('errorDetail');
  const errorTitle = document.getElementById('errorTitle');
  const cbWrap = document.getElementById('cbWrap');
  const cbLines = document.getElementById('cbLines');
  let syncSource = null;

  // —— 自动换行 ——
  cbWrap.addEventListener('change', () => {
    document.body.classList.toggle('wrap', cbWrap.checked);
  });
  document.body.classList.toggle('wrap', cbWrap.checked);

  // —— 行号 ——
  function updateGutter(textarea, gutter) {
    const lines = textarea.value.split('\\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) html += i + '\\n';
    gutter.textContent = html;
  }
  function applyLineNumbers() {
    const show = cbLines.checked;
    editorLeft.classList.toggle('show-gutter', show);
    if (show) {
      updateGutter(left, gutterLeft);
    }
  }
  cbLines.addEventListener('change', applyLineNumbers);
  // textarea 滚动时同步行号（仅明文有多行）
  left.addEventListener('scroll', () => { gutterLeft.scrollTop = left.scrollTop; });

  // —— Base64 编码（UTF-8 安全）——
  function encodeBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function decodeBase64(text) {
    const bin = atob(text.trim());
    const bytes = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
    return new TextDecoder().decode(bytes);
  }

  function showDecodeError(msg) {
    errorTitle.textContent = ui.errorDecode;
    errorDetail.textContent = msg;
    errorIndicator.classList.add('show');
  }
  function hideError() {
    errorIndicator.classList.remove('show');
  }

  function refreshGutters() {
    if (cbLines.checked) {
      updateGutter(left, gutterLeft);
    }
  }

  // 左→右：编码
  let leftTimer = null;
  left.addEventListener('input', () => {
    clearTimeout(leftTimer);
    leftTimer = setTimeout(() => {
      syncSource = 'left';
      hideError();
      try { right.value = encodeBase64(left.value); } catch (e) { right.value = ''; }
      refreshGutters();
      syncSource = null;
    }, 150);
  });

  // 右→左：解码，失败显示小灯泡
  let rightTimer = null;
  right.addEventListener('input', () => {
    clearTimeout(rightTimer);
    rightTimer = setTimeout(() => {
      if (syncSource === 'left') return;
      syncSource = 'right';
      const text = right.value.trim();
      if (!text) { left.value = ''; hideError(); refreshGutters(); syncSource = null; return; }
      try {
        left.value = decodeBase64(text);
        hideError();
      } catch (e) {
        left.value = '';
        showDecodeError(e && e.message ? e.message : String(e));
      }
      refreshGutters();
      syncSource = null;
    }, 150);
  });

  // —— 示例 ——
  document.getElementById('btnSample').addEventListener('click', () => {
    const sample = 'Hello, Base64!\\n你好，世界！\\nBase64 编码测试 / Encoding test';
    left.value = sample;
    hideError();
    try { right.value = encodeBase64(sample); } catch (e) { right.value = ''; }
    refreshGutters();
  });

  // —— 清空 ——
  document.getElementById('btnClear').addEventListener('click', () => {
    left.value = '';
    right.value = '';
    hideError();
    refreshGutters();
    left.focus();
  });

  // —— 复制按钮 ——
  function bindCopy(btnId, source) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      const text = source.value;
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          btn.setAttribute('data-tooltip', ui.copied);
          setTimeout(() => { btn.setAttribute('data-tooltip', ui.copy); }, 1200);
        });
      }
    });
  }
  bindCopy('copyLeft', left);
  bindCopy('copyRight', right);
</script>
</body>
</html>`;
}
