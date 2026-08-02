/** UUID 专用 WebView：输入数量批量生成 v4 UUID，大小写切换，逐行复制。 */
import { getLocale, t } from '../i18n';

/** UUID WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getUuidUI() {
  return {
    title: t('tool.uuid.name'),
    count: t('uuid.count'),
    output: t('uuid.output'),
    placeholder: t('uuid.placeholder'),
    generate: t('common.generate'),
    copyAll: t('common.copyAll'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
    lowercase: t('common.lowercase'),
    uppercase: t('common.uppercase'),
  };
}

export function getUuidWebviewContent(): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getUuidUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.uuid.name')}</title>
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
  .toolbar-actions .btn.primary {
    color: var(--vscode-button-foreground, #fff);
    background: var(--vscode-button-background, #0e639c);
    border: none;
  }
  .toolbar-actions .btn.primary:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
  .input-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .input-bar label {
    font-size: 12px;
    color: var(--vscode-descriptionForeground, #888);
  }
  .input-bar input[type="number"] {
    width: 80px;
    padding: 5px 8px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #3a3a3a);
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
  }
  .input-bar input[type="number"]:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  .output-area {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .output-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
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
    flex-shrink: 0;
  }
  .icon-btn:hover { color: var(--vscode-foreground, #ccc); background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.08)); }
  .icon-btn svg { display: block; }
  .icon-btn[data-tooltip] { position: relative; }
  .icon-btn[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute; top: calc(100% + 4px); right: 0;
    padding: 3px 8px;
    background: var(--vscode-editorWidget-background, #252526);
    border: 1px solid var(--vscode-editorWidget-border, rgba(255,255,255,0.1));
    border-radius: 3px; font-size: 11px; white-space: nowrap;
    color: var(--vscode-foreground, #ccc); z-index: 100; pointer-events: none;
  }
  .uuid-list {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 4px 0;
  }
  .uuid-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
  }
  .uuid-row:hover { background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04)); }
  .uuid-text {
    flex: 1 1 auto;
    min-width: 0;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    user-select: text;
    word-break: break-all;
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
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.uuid.name')}</button>
    <div class="toolbar-actions">
      <label><input type="radio" name="case" value="lower" checked><span data-i18n="lowercase">${ui.lowercase}</span></label>
      <label><input type="radio" name="case" value="upper"><span data-i18n="uppercase">${ui.uppercase}</span></label>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="input-bar">
    <label data-i18n="count">${ui.count}</label>
    <input type="number" id="count" value="1" min="1" max="1000">
    <button class="btn primary" id="btnGenerate" type="button" data-i18n="generate">${ui.generate}</button>
  </div>
  <div class="output-area">
    <div class="output-header">
      <span class="pane-label" data-i18n="output">${ui.output}</span>
      <button class="icon-btn" id="copyAll" data-tooltip="${ui.copyAll}" data-i18n-tip="copyAll" type="button">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/>
        </svg>
      </button>
    </div>
    <div class="uuid-list" id="uuidList">
      <div class="empty-hint" data-i18n="placeholder">${ui.placeholder}</div>
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
    document.querySelectorAll('[data-i18n-tip]').forEach(function(el) { var v = val(el.getAttribute('data-i18n-tip')); if (v !== null) el.setAttribute('data-tooltip', v); });
  });
  // UUID 列表行的复制按钮 tooltip 在 renderList 中按 ui 取值，语言切换后重渲染以刷新
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'localeChanged' && typeof renderList === 'function') {
      renderList();
    }
  });
  const ui = ${uiSource};
  const countInput = document.getElementById('count');
  const uuidList = document.getElementById('uuidList');
  const copyAllBtn = document.getElementById('copyAll');
  let useUpper = false;
  let lastUuids = [];

  function genUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    var hex = '0123456789abcdef';
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return hex.charAt(v);
    });
  }

  function renderList() {
    uuidList.innerHTML = '';
    const nonEmpty = lastUuids.filter((u) => u.trim().length > 0);
    if (nonEmpty.length === 0) {
      const hint = document.createElement('div');
      hint.className = 'empty-hint';
      hint.textContent = ui.placeholder;
      uuidList.appendChild(hint);
      return;
    }
    nonEmpty.forEach((uuid) => {
      const row = document.createElement('div');
      row.className = 'uuid-row';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'icon-btn row-copy';
      copyBtn.setAttribute('data-tooltip', ui.copy);
      copyBtn.type = 'button';
      copyBtn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/></svg>';
      copyBtn.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(uuid).then(() => {
            copyBtn.setAttribute('data-tooltip', ui.copied);
            setTimeout(() => { copyBtn.setAttribute('data-tooltip', ui.copy); }, 1200);
          });
        }
      });
      row.appendChild(copyBtn);

      const text = document.createElement('span');
      text.className = 'uuid-text';
      text.textContent = uuid;
      row.appendChild(text);

      uuidList.appendChild(row);
    });
  }

  function generate() {
    let count = parseInt(countInput.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 1000) count = 1000;
    lastUuids = [];
    for (let i = 0; i < count; i++) {
      const u = genUuid();
      lastUuids.push(useUpper ? u.toUpperCase() : u);
    }
    renderList();
  }

  document.querySelectorAll('input[name="case"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      useUpper = e.target.value === 'upper';
      lastUuids = lastUuids.map((u) => useUpper ? u.toUpperCase() : u.toLowerCase());
      renderList();
    });
  });

  document.getElementById('btnGenerate').addEventListener('click', generate);
  countInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') generate(); });

  document.getElementById('btnClear').addEventListener('click', () => {
    lastUuids = [];
    renderList();
    countInput.value = '1';
    countInput.focus();
  });

  copyAllBtn.addEventListener('click', () => {
    const nonEmpty = lastUuids.filter((u) => u.trim().length > 0);
    if (nonEmpty.length === 0) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(nonEmpty.join('\\n')).then(() => {
        copyAllBtn.setAttribute('data-tooltip', ui.copied);
        setTimeout(() => { copyAllBtn.setAttribute('data-tooltip', ui.copyAll); }, 1200);
      });
    }
  });

  generate();
</script>
</body>
</html>`;
}
