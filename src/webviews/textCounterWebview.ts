/** 文本统计专用 WebView：纵向布局——工具栏、输入区、统计卡片网格，实时统计字符/字节/单词/行数/去空白。 */
import { getLocale, t } from '../i18n';

/** 文本统计 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getTextCounterUI() {
  return {
    title: t('tool.textCounter.name'),
    input: t('textCounter.input'),
    placeholder: t('textCounter.placeholder'),
    wrap: t('common.wrap'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    characters: t('textCounter.characters'),
    bytes: t('textCounter.bytes'),
    words: t('textCounter.words'),
    lines: t('textCounter.lines'),
    noWhitespace: t('textCounter.noWhitespace'),
  };
}

export function getTextCounterWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getTextCounterUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.textCounter.name')}</title>
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
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
    padding: 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .stat-card {
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.03));
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 4px;
    padding: 10px 12px;
    min-width: 0;
  }
  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground, #888);
    margin-bottom: 4px;
  }
  .stat-value {
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 20px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--vscode-foreground, #ccc);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
    border: none;
    outline: none;
    overflow: auto;
    white-space: pre;
  }
  body.wrap textarea { white-space: pre-wrap; word-break: break-all; }
  textarea:focus { box-shadow: inset 0 0 0 1px var(--vscode-focusBorder, #007fd4); }
  textarea::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.textCounter.name')}</button>
    <div class="toolbar-actions">
      <label><input type="checkbox" id="cbWrap" checked><span data-i18n="wrap">${ui.wrap}</span></label>
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label" data-i18n="characters">${ui.characters}</div>
      <div class="stat-value" id="statCharacters">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label" data-i18n="bytes">${ui.bytes}</div>
      <div class="stat-value" id="statBytes">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label" data-i18n="words">${ui.words}</div>
      <div class="stat-value" id="statWords">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label" data-i18n="lines">${ui.lines}</div>
      <div class="stat-value" id="statLines">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label" data-i18n="noWhitespace">${ui.noWhitespace}</div>
      <div class="stat-value" id="statNoWhitespace">0</div>
    </div>
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
  });
  const ui = ${uiSource};
  const input = document.getElementById('input');
  const cbWrap = document.getElementById('cbWrap');

  cbWrap.addEventListener('change', () => { document.body.classList.toggle('wrap', cbWrap.checked); });
  document.body.classList.toggle('wrap', cbWrap.checked);

  function compute() {
    const text = input.value;
    const chars = text.length;
    let bytes = 0;
    try { bytes = new TextEncoder().encode(text).length; } catch (e) { bytes = 0; }
    const words = text.match(/\\S+/g) ? text.match(/\\S+/g).length : 0;
    const lines = text.length === 0 ? 0 : text.split('\\n').length;
    const noWhitespace = text.replace(/\\s/g, '').length;
    document.getElementById('statCharacters').textContent = String(chars);
    document.getElementById('statBytes').textContent = String(bytes);
    document.getElementById('statWords').textContent = String(words);
    document.getElementById('statLines').textContent = String(lines);
    document.getElementById('statNoWhitespace').textContent = String(noWhitespace);
  }

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(compute, 150);
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    input.value = 'Hello, CodeKit!\\n你好，世界！\\nThis is a sample text.';
    compute();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    input.value = '';
    compute();
    input.focus();
  });

  // 接收扩展发来的文本，填充到输入窗并触发统计（由 Open xxx 命令发送）
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
