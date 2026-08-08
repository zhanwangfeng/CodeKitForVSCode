/** 颜色转换专用 WebView：输入任意格式颜色（HEX/RGB/HSL），实时输出三种格式与色块预览。 */
import { getLocale, t } from '../i18n';

/** 颜色转换 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getColorUI() {
  return {
    title: t('tool.color.name'),
    input: t('color.input'),
    placeholder: t('color.placeholder'),
    preview: t('color.preview'),
    hex: t('color.hex'),
    rgb: t('color.rgb'),
    hsl: t('color.hsl'),
    invalid: t('color.invalid'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
  };
}

export function getColorWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getColorUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  const formats: { id: string; key: 'hex' | 'rgb' | 'hsl' }[] = [
    { id: 'hex', key: 'hex' },
    { id: 'rgb', key: 'rgb' },
    { id: 'hsl', key: 'hsl' },
  ];
  const formatRows = formats
    .map(
      (f) => `      <div class="format-row">
        <span class="format-label" data-i18n="${f.key}">${ui[f.key]}</span>
        <input class="format-output" id="out_${f.id}" readonly>
        <button class="icon-btn" data-tooltip="${ui.copy}" data-i18n-tip="copy" data-target="out_${f.id}" type="button">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M4 2h7v2H4V2zm-1 3h9v1H3V5zm0 2h9v7H3V7zm1 1v5h7V8H4z"/>
          </svg>
        </button>
      </div>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.color.name')}</title>
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
  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
  }
  input#input {
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
  input#input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  input#input::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  .swatch {
    width: 44px;
    height: 34px;
    border-radius: 3px;
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.12));
    flex-shrink: 0;
    background-color: transparent;
  }
  .error-line {
    display: none;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--vscode-errorForeground, #f48771);
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .error-line.show { display: block; }
  .formats {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 8px 0;
  }
  .format-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
  }
  .format-row:hover { background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04)); }
  .format-label {
    font-size: 12px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    color: var(--vscode-descriptionForeground, #888);
    min-width: 40px;
    flex-shrink: 0;
  }
  .format-output {
    flex: 1 1 auto;
    min-width: 0;
    padding: 5px 8px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.03));
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    border-radius: 3px;
    outline: none;
  }
  .icon-btn {
    padding: 4px;
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
    position: absolute; top: calc(100% + 4px); right: 0;
    padding: 3px 8px;
    background: var(--vscode-editorWidget-background, #252526);
    border: 1px solid var(--vscode-editorWidget-border, rgba(255,255,255,0.1));
    border-radius: 3px; font-size: 11px; white-space: nowrap;
    color: var(--vscode-foreground, #ccc); z-index: 100; pointer-events: none;
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.color.name')}</button>
    <div class="toolbar-actions">
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="input-section">
    <span class="pane-label" data-i18n="input">${ui.input}</span>
    <div class="input-row">
      <input id="input" type="text" placeholder="${ui.placeholder}" data-i18n-ph="placeholder" spellcheck="false" autofocus>
      <div class="swatch" id="swatch"></div>
    </div>
  </div>
  <div class="error-line" id="errorLine"></div>
  <div class="formats">
${formatRows}
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
    if (e.data && e.data.type === 'localeChanged') update();
  });
  const ui = ${uiSource};
  const input = document.getElementById('input');
  const swatch = document.getElementById('swatch');
  const errorLine = document.getElementById('errorLine');

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function hslToRgb(h, s, l) {
    const f = function (n) {
      const k = (n + h / 30) % 12;
      const c = s * Math.min(l, 1 - l);
      return Math.round((l - c * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
    };
    return { r: f(0), g: f(8), b: f(4) };
  }
  function parseColor(str) {
    str = str.trim().toLowerCase();
    let m;
    if ((m = str.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/))) {
      let hex = m[1];
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(function (c) { return c + c; }).join('');
      }
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      };
    }
    if ((m = str.match(/^rgba?\\(\\s*([0-9.]+%?)\\s*,\\s*([0-9.]+%?)\\s*,\\s*([0-9.]+%?)\\s*(?:,\\s*([0-9.]+%?)\\s*)?\\)$/))) {
      const toVal = function (v) {
        if (v.endsWith('%')) return Math.round((parseFloat(v) / 100) * 255);
        return Math.round(parseFloat(v));
      };
      return {
        r: clamp(toVal(m[1]), 0, 255),
        g: clamp(toVal(m[2]), 0, 255),
        b: clamp(toVal(m[3]), 0, 255),
        a: m[4] ? clamp(m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]), 0, 1) : 1,
      };
    }
    if ((m = str.match(/^hsla?\\(\\s*([0-9.]+)(?:deg)?\\s*,\\s*([0-9.]+)%\\s*,\\s*([0-9.]+)%\\s*(?:,\\s*([0-9.]+%?)\\s*)?\\)$/))) {
      const h = ((parseFloat(m[1]) % 360) + 360) % 360;
      const s = clamp(parseFloat(m[2]) / 100, 0, 1);
      const l = clamp(parseFloat(m[3]) / 100, 0, 1);
      const rgb = hslToRgb(h, s, l);
      return {
        r: rgb.r, g: rgb.g, b: rgb.b,
        a: m[4] ? clamp(m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]), 0, 1) : 1,
      };
    }
    return null;
  }
  function toHex(c) {
    const part = function (n) { return ('0' + n.toString(16)).slice(-2); };
    let s = '#' + part(c.r) + part(c.g) + part(c.b);
    if (c.a < 1) s += part(Math.round(c.a * 255));
    return s;
  }
  function toRgb(c) {
    if (c.a < 1) return 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + (Math.round(c.a * 1000) / 1000) + ')';
    return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
  }
  function toHsl(c) {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    const a = c.a < 1 ? ', ' + (Math.round(c.a * 1000) / 1000) : '';
    const alpha = c.a < 1 ? 'a' : '';
    return 'hsl' + alpha + '(' + Math.round(h) + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%' + a + ')';
  }

  function update() {
    const c = parseColor(input.value);
    if (!c) {
      errorLine.classList.add('show');
      errorLine.textContent = ui.invalid;
      swatch.style.backgroundColor = 'transparent';
      ['hex', 'rgb', 'hsl'].forEach(function (k) { document.getElementById('out_' + k).value = ''; });
      return;
    }
    errorLine.classList.remove('show');
    swatch.style.backgroundColor = 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + c.a + ')';
    document.getElementById('out_hex').value = toHex(c);
    document.getElementById('out_rgb').value = toRgb(c);
    document.getElementById('out_hsl').value = toHsl(c);
  }

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(update, 100);
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    input.value = '#3498db';
    update();
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });

  document.querySelectorAll('.icon-btn[data-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('data-target'));
      if (!target.value) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(target.value).then(() => {
          btn.setAttribute('data-tooltip', ui.copied);
          setTimeout(() => { btn.setAttribute('data-tooltip', ui.copy); }, 1200);
        });
      }
    });
  });

  // 接收扩展发来的文本，填充到输入窗并触发转换（由 Open xxx 命令发送）
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
