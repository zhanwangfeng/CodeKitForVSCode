/** SQL 格式化专用 WebView：左输入右输出，实时格式化，支持关键字大小写与缩进宽度选项。 */
import { getLocale, t } from '../i18n';

/** SQL WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getSqlUI() {
  return {
    title: t('tool.sql.name'),
    input: t('sql.input'),
    output: t('sql.output'),
    placeholderLeft: t('sql.placeholder.left'),
    placeholderRight: t('sql.placeholder.right'),
    wrap: t('common.wrap'),
    lineNumbers: t('common.lineNumbers'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
    keywordCase: t('sql.keywordCase'),
    keywordUpper: t('sql.keywordUpper'),
    keywordLower: t('sql.keywordLower'),
    indent: t('sql.indent'),
  };
}

export function getSqlWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getSqlUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.sql.name')}</title>
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
    flex-shrink: 0;
  }
  .toolbar-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .toolbar-actions label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    user-select: none;
    color: var(--vscode-foreground, #ccc);
  }
  .toolbar-actions input[type="checkbox"], .toolbar-actions input[type="radio"] {
    accent-color: var(--vscode-checkbox-background, #0e639c);
    cursor: pointer;
  }
  .toolbar-actions select {
    padding: 3px 6px;
    font-size: 12px;
    font-family: inherit;
    color: var(--vscode-foreground, #ccc);
    background: var(--vscode-dropdown-background, #2a2a2a);
    border: 1px solid var(--vscode-dropdown-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    cursor: pointer;
  }
  .toolbar-actions select option { background: var(--vscode-dropdown-background, #2a2a2a); }
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
  .toolbar-actions .group-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground, #888);
  }
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
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${ui.title}</button>
    <div class="toolbar-actions">
      <span class="group-label" data-i18n="keywordCase">${ui.keywordCase}</span>
      <label>
        <input type="radio" name="kwCase" id="kwUpper" checked>
        <span data-i18n="keywordUpper">${ui.keywordUpper}</span>
      </label>
      <label>
        <input type="radio" name="kwCase" id="kwLower">
        <span data-i18n="keywordLower">${ui.keywordLower}</span>
      </label>
      <span class="group-label" data-i18n="indent">${ui.indent}</span>
      <select id="indentWidth">
        <option value="2">2</option>
        <option value="4" selected>4</option>
        <option value="8">8</option>
      </select>
      <label><input type="checkbox" id="cbWrap" checked><span data-i18n="wrap">${ui.wrap}</span></label>
      <label><input type="checkbox" id="cbLines"><span data-i18n="lineNumbers">${ui.lineNumbers}</span></label>
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="panes">
    <div class="pane">
      <div class="pane-header">
        <span class="pane-label" data-i18n="input">${ui.input}</span>
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
    <div class="pane">
      <div class="pane-header">
        <span class="pane-label" data-i18n="output">${ui.output}</span>
        <button class="icon-btn" id="copyRight" data-tooltip="${ui.copy}" data-i18n-tip="copy" type="button">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/>
          </svg>
        </button>
      </div>
      <div class="editor" id="editorRight">
        <div class="gutter" id="gutterRight"></div>
        <textarea id="right" placeholder="${ui.placeholderRight}" data-i18n-ph="placeholderRight" spellcheck="false" readonly></textarea>
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
  const cbWrap = document.getElementById('cbWrap');
  const cbLines = document.getElementById('cbLines');
  const kwUpper = document.getElementById('kwUpper');
  const kwLower = document.getElementById('kwLower');
  const indentWidth = document.getElementById('indentWidth');

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
    editorRight.classList.toggle('show-gutter', show);
    if (show) {
      updateGutter(left, gutterLeft);
      updateGutter(right, gutterRight);
    }
  }
  cbLines.addEventListener('change', applyLineNumbers);
  left.addEventListener('scroll', () => { gutterLeft.scrollTop = left.scrollTop; });
  right.addEventListener('scroll', () => { gutterRight.scrollTop = right.scrollTop; });

  function refreshGutters() {
    if (cbLines.checked) {
      updateGutter(left, gutterLeft);
      updateGutter(right, gutterRight);
    }
  }

  // —— SQL 格式化核心逻辑 ——
  // 关键字（大写）列表：大小写归一化与换行缩进都依赖它
  // 注意：本脚本在模板字符串内，正则中的词边界统一用双反斜杠 \\\\b 表示，避免被转义为退格符
  const CLAUSES = [
    'SELECT','FROM','WHERE','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','JOIN',
    'INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','LEFT OUTER JOIN','RIGHT OUTER JOIN','CROSS JOIN',
    'UNION','UNION ALL','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM',
    'CREATE TABLE','CREATE DATABASE','CREATE INDEX','CREATE VIEW','ALTER TABLE','DROP TABLE','DROP INDEX','DROP VIEW',
  ];

  function escapeRegExp(s) { return s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'); }

  /** 将输入 SQL 格式化：统一大小写 + 子句换行 + 缩进 */
  function formatSql(sql, kwCase, indentSize) {
    const indentUnit = ' '.repeat(indentSize);
    // 1. 保护字符串字面量，避免内部内容被当作关键字处理
    const strings = [];
    const protectedSql = sql.replace(/'(?:''|[^'])*'|"(?:[^"]|"")*"/g, function(m) {
      strings.push(m);
      return '\\u0000' + (strings.length - 1) + '\\u0000';
    });
    // 2. 统一空白为单空格
    let oneLine = protectedSql.replace(/\\s+/g, ' ');
    // 3. 关键字大小写归一化
    const kwRegex = new RegExp(
      '\\\\b(?:SELECT|FROM|WHERE|GROUP\\\\s+BY|ORDER\\\\s+BY|HAVING|LIMIT|OFFSET|JOIN|INNER\\\\s+JOIN|LEFT\\\\s+JOIN|RIGHT\\\\s+JOIN|FULL\\\\s+JOIN|LEFT\\\\s+OUTER\\\\s+JOIN|RIGHT\\\\s+OUTER\\\\s+JOIN|CROSS\\\\s+JOIN|UNION\\\\s+ALL|UNION|INSERT\\\\s+INTO|VALUES|UPDATE|SET|DELETE\\\\s+FROM|CREATE\\\\s+TABLE|CREATE\\\\s+DATABASE|CREATE\\\\s+INDEX|CREATE\\\\s+VIEW|ALTER\\\\s+TABLE|DROP\\\\s+TABLE|DROP\\\\s+INDEX|DROP\\\\s+VIEW|ADD\\\\s+COLUMN|DROP\\\\s+COLUMN|PRIMARY\\\\s+KEY|FOREIGN\\\\s+KEY|UNIQUE|NOT\\\\s+NULL|DEFAULT|REFERENCES|ON|AS|AND|OR|NOT|IN|IS|NULL|BETWEEN|LIKE|EXISTS|DISTINCT|CASE|WHEN|THEN|ELSE|END|ASC|DESC|COUNT|SUM|AVG|MIN|MAX|GROUP_CONCAT)\\\\b',
      'gi'
    );
    oneLine = oneLine.replace(kwRegex, function(m) {
      return kwCase === 'upper' ? m.toUpperCase() : m.toLowerCase();
    });
    // 4. 在子句关键字前插入换行
    const clauseRegex = new RegExp('\\\\b(' + CLAUSES.map(escapeRegExp).join('|') + ')\\\\b', 'gi');
    oneLine = oneLine.replace(clauseRegex, '\\n$1');
    oneLine = oneLine.replace(/^\\n+/, '');
    // 5. 缩进与去重空行
    const lines = oneLine.split('\\n');
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      result.push(line);
    }
    // 6. 恢复字符串字面量
    return result.join('\\n').replace(/\\u0000(\\d+)\\u0000/g, function(_m, idx) {
      return strings[parseInt(idx, 10)];
    });
  }

  // —— 实时格式化（防抖）——
  let formatTimer = null;
  function runFormat() {
    const kwCase = kwUpper.checked ? 'upper' : 'lower';
    const indentSize = parseInt(indentWidth.value, 10) || 4;
    try {
      right.value = formatSql(left.value, kwCase, indentSize);
    } catch (e) {
      right.value = '';
    }
    refreshGutters();
  }
  left.addEventListener('input', () => {
    clearTimeout(formatTimer);
    formatTimer = setTimeout(runFormat, 150);
  });
  kwUpper.addEventListener('change', runFormat);
  kwLower.addEventListener('change', runFormat);
  indentWidth.addEventListener('change', runFormat);

  // —— 示例 ——
  document.getElementById('btnSample').addEventListener('click', () => {
    const sample = "SELECT u.id, u.name, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND u.created_at > '2024-01-01' GROUP BY u.id, u.name HAVING COUNT(o.id) > 3 ORDER BY order_count DESC LIMIT 10";
    left.value = sample;
    runFormat();
  });

  // —— 清空 ——
  document.getElementById('btnClear').addEventListener('click', () => {
    left.value = '';
    right.value = '';
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

  // 接收扩展发来的文本，填充到输入窗并触发格式化（由 Open SQL 命令发送）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setInput') {
      left.value = e.data.text;
      left.dispatchEvent(new Event('input'));
    }
  });

  // 初始文本（由 Open SQL 命令通过 run(context, initialText) 传入）
  var initialText = ${initialTextSource};
  if (initialText) {
    left.value = initialText;
    left.dispatchEvent(new Event('input'));
  }
</script>
</body>
</html>`;
}
