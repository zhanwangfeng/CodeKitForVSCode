/** 正则测试专用 WebView：正则 + 标志 + 测试文本，实时显示匹配数、匹配列表与高亮预览。 */
import { getLocale, t } from '../i18n';

/** 正则测试 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getRegexUI() {
  return {
    title: t('tool.regex.name'),
    pattern: t('regex.pattern'),
    flags: t('regex.flags'),
    testText: t('regex.testText'),
    patternPlaceholder: t('regex.patternPlaceholder'),
    testPlaceholder: t('regex.testPlaceholder'),
    matches: t('regex.matches'),
    matchCount: t('regex.matchCount'),
    noMatch: t('regex.noMatch'),
    invalid: t('regex.invalid'),
    sample: t('common.sample'),
    clear: t('common.clear'),
  };
}

const FLAGS = ['g', 'i', 'm', 's', 'u'];

export function getRegexWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getRegexUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  const flagChecks = FLAGS.map(
    (f) =>
      `        <label class="flag"><input type="checkbox" name="flag" value="${f}"${f === 'g' ? ' checked' : ''}><span>${f}</span></label>`,
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.regex.name')}</title>
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
  .field {
    padding: 10px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .field-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
  }
  .pane-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground, #888);
  }
  input#pattern {
    flex: 1 1 auto;
    min-width: 0;
    padding: 8px 10px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
  }
  input#pattern:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  input#pattern::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  .flags {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .flag {
    display: flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    user-select: none;
    color: var(--vscode-foreground, #ccc);
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 12px;
  }
  .flag input[type="checkbox"] { accent-color: var(--vscode-checkbox-background, #0e639c); cursor: pointer; }
  textarea#text {
    width: 100%;
    height: 120px;
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
  }
  textarea#text:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  textarea#text::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  .error-line {
    display: none;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--vscode-errorForeground, #f48771);
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .error-line.show { display: block; }
  .result-area {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  #info {
    font-size: 12px;
    color: var(--vscode-descriptionForeground, #888);
  }
  .match-list { padding: 4px 0; }
  .match-row {
    padding: 5px 12px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .match-row:hover { background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04)); }
  .match-index {
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    color: var(--vscode-descriptionForeground, #888);
    font-size: 11px;
  }
  .match-full {
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    color: var(--vscode-foreground, #ccc);
    word-break: break-all;
  }
  .match-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .match-group {
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 11px;
    color: var(--vscode-descriptionForeground, #888);
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.03));
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    border-radius: 3px;
    padding: 1px 6px;
    word-break: break-all;
  }
  .preview {
    margin: 8px 12px;
    padding: 10px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 12px;
    line-height: 1.6;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    border-radius: 3px;
    white-space: pre-wrap;
    word-break: break-all;
    user-select: text;
  }
  .preview mark {
    background: var(--vscode-textLink-foreground, #3794ff);
    color: var(--vscode-input-background, #2a2a2a);
    border-radius: 2px;
  }
  .empty-hint {
    padding: 20px 12px;
    text-align: center;
    color: var(--vscode-input-placeholderForeground, #666);
    font-size: 12px;
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.regex.name')}</button>
    <div class="toolbar-actions">
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="field">
    <span class="pane-label" data-i18n="pattern">${ui.pattern}</span>
    <div class="field-row">
      <input id="pattern" type="text" placeholder="${ui.patternPlaceholder}" data-i18n-ph="patternPlaceholder" spellcheck="false" autofocus>
    </div>
  </div>
  <div class="field">
    <span class="pane-label" data-i18n="flags">${ui.flags}</span>
    <div class="field-row">
      <div class="flags">
${flagChecks}
      </div>
    </div>
  </div>
  <div class="field">
    <span class="pane-label" data-i18n="testText">${ui.testText}</span>
    <textarea id="text" placeholder="${ui.testPlaceholder}" data-i18n-ph="testPlaceholder" spellcheck="false"></textarea>
  </div>
  <div class="error-line" id="errorLine"></div>
  <div class="result-area">
    <div class="result-header">
      <span class="pane-label" data-i18n="matches">${ui.matches}</span>
      <span id="info"></span>
    </div>
    <div class="match-list" id="matchList"></div>
    <div class="preview" id="preview"></div>
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
    if (e.data && e.data.type === 'localeChanged') compute();
  });
  const ui = ${uiSource};
  const patternInput = document.getElementById('pattern');
  const textInput = document.getElementById('text');
  const errorLine = document.getElementById('errorLine');
  const infoEl = document.getElementById('info');
  const matchList = document.getElementById('matchList');
  const preview = document.getElementById('preview');
  const flagChecks = document.querySelectorAll('input[name="flag"]');

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function getFlags() {
    let f = '';
    flagChecks.forEach(function (c) { if (c.checked) f += c.value; });
    return f;
  }

  function compute() {
    const pattern = patternInput.value;
    const text = textInput.value;
    const flags = getFlags();
    let gRe;
    try {
      gRe = new RegExp(pattern, flags.indexOf('g') >= 0 ? flags : flags + 'g');
    } catch (e) {
      errorLine.classList.add('show');
      errorLine.textContent = ui.invalid;
      infoEl.textContent = '';
      matchList.innerHTML = '';
      preview.textContent = text;
      return;
    }
    errorLine.classList.remove('show');

    const matches = [];
    const its = text.matchAll(gRe);
    for (const m of its) matches.push(m);

    if (matches.length === 0) {
      infoEl.textContent = ui.noMatch;
      matchList.innerHTML = '';
      preview.textContent = text;
      return;
    }

    infoEl.textContent = ui.matchCount.replace('{count}', String(matches.length));

    matchList.innerHTML = '';
    matches.forEach(function (mm, idx) {
      const row = document.createElement('div');
      row.className = 'match-row';
      const head = document.createElement('div');
      head.className = 'match-index';
      head.textContent = '#' + (idx + 1) + ' · idx ' + mm.index;
      row.appendChild(head);
      const full = document.createElement('div');
      full.className = 'match-full';
      full.textContent = mm[0];
      row.appendChild(full);
      if (mm.length > 1) {
        const groups = document.createElement('div');
        groups.className = 'match-groups';
        for (let i = 1; i < mm.length; i++) {
          const g = document.createElement('span');
          g.className = 'match-group';
          g.textContent = '[' + i + '] ' + (mm[i] === undefined ? '' : mm[i]);
          groups.appendChild(g);
        }
        row.appendChild(groups);
      }
      matchList.appendChild(row);
    });

    let html = '';
    let last = 0;
    matches.forEach(function (mm) {
      html += escapeHtml(text.slice(last, mm.index)) + '<mark>' + escapeHtml(mm[0]) + '</mark>';
      last = mm.index + mm[0].length;
    });
    html += escapeHtml(text.slice(last));
    preview.innerHTML = html;
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(compute, 120);
  }
  patternInput.addEventListener('input', schedule);
  textInput.addEventListener('input', schedule);
  flagChecks.forEach(function (c) { c.addEventListener('change', compute); });

  document.getElementById('btnSample').addEventListener('click', () => {
    patternInput.value = '\\b\\w+@\\w+\\.\\w+';
    textInput.value = 'Contact us: alice@example.com, bob@test.org\\nVisit https://example.com for more details.';
    compute();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    patternInput.value = '';
    textInput.value = '';
    errorLine.classList.remove('show');
    infoEl.textContent = '';
    matchList.innerHTML = '';
    preview.textContent = '';
    patternInput.focus();
  });

  // 接收扩展发来的文本，填充到测试文本窗并触发计算（由 Open xxx 命令发送）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setInput') {
      textInput.value = e.data.text;
      textInput.dispatchEvent(new Event('input'));
    }
  });

  // 初始文本（由 Open xxx 命令通过 run(context, initialText) 传入）
  var initialText = ${initialTextSource};
  if (initialText) {
    textInput.value = initialText;
    textInput.dispatchEvent(new Event('input'));
  }
</script>
</body>
</html>`;
}
