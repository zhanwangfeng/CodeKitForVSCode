/** 密码生成器专用 WebView：长度/数量滑条 + 字符集勾选，生成多行密码并支持逐行复制。 */
import { getLocale, t } from '../i18n';

/** 密码生成器 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getPasswordUI() {
  return {
    title: t('tool.password.name'),
    length: t('password.length'),
    count: t('password.count'),
    uppercase: t('password.uppercase'),
    lowercase: t('password.lowercase'),
    digits: t('password.digits'),
    symbols: t('password.symbols'),
    excludeSimilar: t('password.excludeSimilar'),
    generate: t('password.generate'),
    output: t('password.output'),
    placeholder: t('password.placeholder'),
    noCharset: t('password.noCharset'),
    copy: t('common.copy'),
    copied: t('common.copied'),
  };
}

export function getPasswordWebviewContent(): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getPasswordUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.password.name')}</title>
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
  .options {
    flex-shrink: 0;
    padding: 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
  }
  .option-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
    font-size: 13px;
  }
  .option-row label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
  .option-row input[type="checkbox"] { accent-color: var(--vscode-checkbox-background, #0e639c); cursor: pointer; }
  .option-row input[type="number"] {
    width: 64px;
    padding: 4px 6px;
    font-family: inherit;
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
  }
  .option-row input[type="number"]:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  .option-row .range-wrap { display: flex; align-items: center; gap: 8px; }
  .option-row input[type="range"] { accent-color: var(--vscode-button-background, #0e639c); flex: 1; }
  .option-row .value-label {
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    color: var(--vscode-descriptionForeground, #888);
    min-width: 28px;
    text-align: right;
  }
  .gen-row {
    padding: 8px 12px 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn.primary {
    background: var(--vscode-button-background, #0e639c);
    border-color: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #fff);
    font-weight: 500;
  }
  .btn.primary:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
  .error-line {
    display: none;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--vscode-errorForeground, #f48771);
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .error-line.show { display: block; }
  .output-header {
    display: flex;
    align-items: center;
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
  textarea {
    flex: 1 1 auto;
    min-height: 0;
    resize: none;
    padding: 12px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: var(--vscode-editor-font-size, 13px);
    line-height: 1.6;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: none;
    outline: none;
    overflow: auto;
    white-space: pre;
  }
  textarea::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  textarea:focus { box-shadow: inset 0 0 0 1px var(--vscode-focusBorder, #007fd4); }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${ui.title}</button>
  </div>
  <div class="options">
    <div class="option-row">
      <span style="min-width:56px" data-i18n="length">${ui.length}</span>
      <span class="range-wrap" style="flex:1">
        <input type="range" id="length" min="4" max="64" value="16" style="flex:1">
        <span class="value-label" id="lengthVal">16</span>
      </span>
    </div>
    <div class="option-row">
      <span style="min-width:56px" data-i18n="count">${ui.count}</span>
      <input type="number" id="count" min="1" max="100" value="5">
    </div>
    <div class="option-row"><label><input type="checkbox" id="ckUpper" checked><span data-i18n="uppercase">${ui.uppercase}</span></label></div>
    <div class="option-row"><label><input type="checkbox" id="ckLower" checked><span data-i18n="lowercase">${ui.lowercase}</span></label></div>
    <div class="option-row"><label><input type="checkbox" id="ckDigit" checked><span data-i18n="digits">${ui.digits}</span></label></div>
    <div class="option-row"><label><input type="checkbox" id="ckSym" checked><span data-i18n="symbols">${ui.symbols}</span></label></div>
    <div class="option-row"><label><input type="checkbox" id="ckSimilar"><span data-i18n="excludeSimilar">${ui.excludeSimilar}</span></label></div>
  </div>
  <div class="gen-row">
    <button class="btn primary" id="btnGenerate" type="button" data-i18n="generate">${ui.generate}</button>
  </div>
  <div class="error-line" id="errorLine"></div>
  <div class="output-header">
    <span class="pane-label" data-i18n="output">${ui.output}</span>
  </div>
  <textarea id="output" placeholder="${ui.placeholder}" data-i18n-ph="placeholder" spellcheck="false" readonly></textarea>
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
  const lengthSlider = document.getElementById('length');
  const lengthVal = document.getElementById('lengthVal');
  const countInput = document.getElementById('count');
  const output = document.getElementById('output');
  const errorLine = document.getElementById('errorLine');

  lengthSlider.addEventListener('input', () => { lengthVal.textContent = lengthSlider.value; });

  const SIMILAR = new Set(['I', 'l', '1', 'O', '0', 'o']);
  function charSets() {
    const sets = [];
    if (document.getElementById('ckUpper').checked) sets.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
    if (document.getElementById('ckLower').checked) sets.push('abcdefghjkmnpqrstuvwxyz');
    if (document.getElementById('ckDigit').checked) sets.push('23456789');
    if (document.getElementById('ckSym').checked) sets.push('!@#$%^&*()-_=+[]{};:,.<>?/');
    const exclude = document.getElementById('ckSimilar').checked;
    if (exclude) {
      return sets.join('').split('').filter(function (c) { return !SIMILAR.has(c); }).join('');
    }
    return sets.join('');
  }

  function randomIndex(max) { return Math.floor(Math.random() * max); }

  function generate() {
    const len = parseInt(lengthSlider.value, 10) || 16;
    const count = Math.max(1, Math.min(100, parseInt(countInput.value, 10) || 1));
    const charset = charSets();
    if (!charset) {
      errorLine.classList.add('show');
      errorLine.textContent = ui.noCharset;
      output.value = '';
      return;
    }
    errorLine.classList.remove('show');
    const lines = [];
    for (let n = 0; n < count; n++) {
      let pw = '';
      for (let i = 0; i < len; i++) pw += charset.charAt(randomIndex(charset.length));
      lines.push(pw);
    }
    output.value = lines.join('\\n');
  }

  document.getElementById('btnGenerate').addEventListener('click', generate);
  countInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') generate(); });
  // 初次进入自动生成一组示例
  generate();

  // 点击输出区可将单行复制到剪贴板（双击选择当前行由浏览器处理）
  output.addEventListener('click', () => {
    if (!output.value) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(output.value).then(() => {
        output.setAttribute('data-tooltip', ui.copied);
        setTimeout(() => { output.removeAttribute('data-tooltip'); }, 1200);
      });
    }
  });
</script>
</body>
</html>`;
}
