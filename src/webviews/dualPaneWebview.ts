/** 通用左右布局 WebView 构建器：左原文右编码，双向实时同步，解码失败小灯泡提示。Unicode/URL编码等共用。 */
import { getLocale, t } from '../i18n';

export interface DualPaneConfig {
  /** 标题徽章文字（如 "Unicode"、"URL Encode"） */
  title: string;
  /** 左窗标签 i18n key */
  leftLabelKey: string;
  /** 右窗标签 i18n key */
  rightLabelKey: string;
  /** 左窗占位符 i18n key */
  placeholderLeftKey: string;
  /** 右窗占位符 i18n key */
  placeholderRightKey: string;
  /** 解码失败提示 i18n key */
  errorDecodeKey: string;
  /** 编码函数源码（JS 字符串，形如 "function encode(text) { ... }"） */
  encodeFn: string;
  /** 解码函数源码（JS 字符串，形如 "function decode(text) { ... }"） */
  decodeFn: string;
  /** 示例文本 */
  sampleText: string;
  /** 通用文案 i18n key 前缀（如 "unicode"、"url"） */
  keyPrefix: string;
  /** 是否反转左右（左密文右明文，解码失败灯泡显示在左窗） */
  reversed?: boolean;
}

/** 通用左右布局 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getDualPaneUI(config: DualPaneConfig) {
  return {
    title: config.title,
    leftLabel: t(config.leftLabelKey),
    rightLabel: t(config.rightLabelKey),
    placeholderLeft: t(config.placeholderLeftKey),
    placeholderRight: t(config.placeholderRightKey),
    wrap: t('common.wrap'),
    lineNumbers: t('common.lineNumbers'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
    errorDecode: t(config.errorDecodeKey),
  };
}

export function getDualPaneWebviewContent(config: DualPaneConfig): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';
  const p = config.keyPrefix;

  const ui = getDualPaneUI(config);
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${config.title}</title>
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
  .error-popup-title { font-weight: 600; margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${ui.title}</button>
    <div class="toolbar-actions">
      <label><input type="checkbox" id="cbWrap" checked><span data-i18n="wrap">${ui.wrap}</span></label>
      <label><input type="checkbox" id="cbLines"><span data-i18n="lineNumbers">${ui.lineNumbers}</span></label>
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="panes">
    <div class="pane">
      <div class="pane-header">
        <span class="pane-label" data-i18n="leftLabel">${ui.leftLabel}</span>
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
      <div class="error-indicator" id="errorIndicatorLeft">
        <svg class="error-bulb" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
        </svg>
        <div class="error-popup">
          <div class="error-popup-title" id="errorTitleLeft" data-i18n="errorDecode">${ui.errorDecode}</div>
          <div id="errorDetailLeft"></div>
        </div>
      </div>
    </div>
    <div class="pane">
      <div class="pane-header">
        <span class="pane-label" data-i18n="rightLabel">${ui.rightLabel}</span>
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
      <div class="error-indicator" id="errorIndicatorRight">
        <svg class="error-bulb" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
        </svg>
        <div class="error-popup">
          <div class="error-popup-title" id="errorTitleRight" data-i18n="errorDecode">${ui.errorDecode}</div>
          <div id="errorDetailRight"></div>
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
  const reversed = ${config.reversed ? 'true' : 'false'};
  const left = document.getElementById('left');
  const right = document.getElementById('right');
  const gutterLeft = document.getElementById('gutterLeft');
  const gutterRight = document.getElementById('gutterRight');
  const editorLeft = document.getElementById('editorLeft');
  const editorRight = document.getElementById('editorRight');
  const errLeft = document.getElementById('errorIndicatorLeft');
  const errRight = document.getElementById('errorIndicatorRight');
  const errDetailLeft = document.getElementById('errorDetailLeft');
  const errDetailRight = document.getElementById('errorDetailRight');
  const errTitleLeft = document.getElementById('errorTitleLeft');
  const errTitleRight = document.getElementById('errorTitleRight');
  const cbWrap = document.getElementById('cbWrap');
  const cbLines = document.getElementById('cbLines');
  let syncSource = null;

  // —— 编码/解码函数（由调用方注入）——
  ${config.encodeFn}
  ${config.decodeFn}

  cbWrap.addEventListener('change', () => {
    document.body.classList.toggle('wrap', cbWrap.checked);
  });
  document.body.classList.toggle('wrap', cbWrap.checked);

  function updateGutter(textarea, gutter) {
    const lines = textarea.value.split('\\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) html += i + '\\n';
    gutter.textContent = html;
  }
  function applyLineNumbers() {
    const show = cbLines.checked;
    editorLeft.classList.toggle('show-gutter', show);
    editorRight.classList.toggle('show-gutter', show);
    if (show) {
      updateGutter(left, gutterLeft);
      updateGutter(right, gutterRight);
    }
  }
  cbLines.addEventListener('change', applyLineNumbers);
  left.addEventListener('scroll', () => { gutterLeft.scrollTop = left.scrollTop; });
  right.addEventListener('scroll', () => { gutterRight.scrollTop = right.scrollTop; });

  // —— 错误提示：根据 reversed 选择显示在哪一侧 ——
  function showDecodeError(msg) {
    const indicator = reversed ? errLeft : errRight;
    const title = reversed ? errTitleLeft : errTitleRight;
    const detail = reversed ? errDetailLeft : errDetailRight;
    title.textContent = ui.errorDecode;
    detail.textContent = msg;
    indicator.classList.add('show');
  }
  function hideError() { errLeft.classList.remove('show'); errRight.classList.remove('show'); }

  function refreshGutters() {
    if (cbLines.checked) {
      updateGutter(left, gutterLeft);
      updateGutter(right, gutterRight);
    }
  }

  // —— 双向同步逻辑 ——
  // 正常模式：left=明文, right=密文, left→encode→right, right→decode→left
  // 反转模式：left=密文, right=明文, left→decode→right, right→encode→left
  let leftTimer = null;
  left.addEventListener('input', () => {
    clearTimeout(leftTimer);
    leftTimer = setTimeout(() => {
      syncSource = 'left';
      const text = left.value.trim();
      if (reversed) {
        if (!text) { right.value = ''; hideError(); refreshGutters(); syncSource = null; return; }
        try {
          right.value = decode(text);
          hideError();
        } catch (e) {
          right.value = '';
          showDecodeError(e && e.message ? e.message : String(e));
        }
      } else {
        hideError();
        try { right.value = encode(left.value); } catch (e) { right.value = ''; }
      }
      refreshGutters();
      syncSource = null;
    }, 150);
  });

  let rightTimer = null;
  right.addEventListener('input', () => {
    clearTimeout(rightTimer);
    rightTimer = setTimeout(() => {
      if (syncSource === 'left') return;
      syncSource = 'right';
      const text = right.value.trim();
      if (reversed) {
        hideError();
        try { left.value = encode(right.value); } catch (e) { left.value = ''; }
      } else {
        if (!text) { left.value = ''; hideError(); refreshGutters(); syncSource = null; return; }
        try {
          left.value = decode(text);
          hideError();
        } catch (e) {
          left.value = '';
          showDecodeError(e && e.message ? e.message : String(e));
        }
      }
      refreshGutters();
      syncSource = null;
    }, 150);
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    if (reversed) {
      right.value = ${JSON.stringify(config.sampleText)};
      hideError();
      try { left.value = encode(right.value); } catch (e) { left.value = ''; }
    } else {
      left.value = ${JSON.stringify(config.sampleText)};
      hideError();
      try { right.value = encode(left.value); } catch (e) { right.value = ''; }
    }
    refreshGutters();
  });

  document.getElementById('btnClear').addEventListener('click', () => {
    left.value = '';
    right.value = '';
    hideError();
    refreshGutters();
    left.focus();
  });

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
