/** 进制转换专用 WebView：二进制/八进制/十进制/十六进制四个输入框，任意一个输入实时更新其他三个。 */
import { getLocale, t } from '../i18n';

/** 进制转换 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getNumberBaseUI() {
  return {
    title: t('tool.numberBase.name'),
    binary: t('numberBase.binary'),
    octal: t('numberBase.octal'),
    decimal: t('numberBase.decimal'),
    hex: t('numberBase.hex'),
    invalid: t('numberBase.invalid'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
  };
}

export function getNumberBaseWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getNumberBaseUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  const bases: { id: string; key: 'binary' | 'octal' | 'decimal' | 'hex'; radix: number }[] = [
    { id: 'bin', key: 'binary', radix: 2 },
    { id: 'oct', key: 'octal', radix: 8 },
    { id: 'dec', key: 'decimal', radix: 10 },
    { id: 'hex', key: 'hex', radix: 16 },
  ];
  const inputRows = bases
    .map(
      (b) => `      <div class="base-row">
        <span class="base-label" data-i18n="${b.key}">${ui[b.key]}</span>
        <input class="base-input" id="in_${b.id}" data-base="${b.id}" data-radix="${b.radix}"
          data-i18n-label="${b.key}" placeholder="0" spellcheck="false" autocapitalize="off" autocomplete="off">
        <button class="icon-btn" data-tooltip="${ui.copy}" data-i18n-tip="copy" data-target="in_${b.id}" type="button">
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
<title>${t('tool.numberBase.name')}</title>
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
  .error-line {
    display: none;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--vscode-errorForeground, #f48771);
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .error-line.show { display: block; }
  .bases {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 8px 0;
  }
  .base-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
  }
  .base-row:hover { background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04)); }
  .base-label {
    font-size: 12px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    color: var(--vscode-descriptionForeground, #888);
    min-width: 96px;
    flex-shrink: 0;
  }
  .base-input {
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
  .base-input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  .base-input::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  .base-input.invalid {
    border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    box-shadow: inset 0 0 0 1px var(--vscode-inputValidation-errorBorder, #be1100);
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
    <button class="title-badge" type="button" disabled data-i18n="title">${ui.title}</button>
    <div class="toolbar-actions">
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="error-line" id="errorLine"></div>
  <div class="bases">
${inputRows}
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
  const ui = ${uiSource};
  const inputs = Array.prototype.slice.call(document.querySelectorAll('.base-input'));
  const errorLine = document.getElementById('errorLine');

  function digit(c) { return c.toLowerCase().charCodeAt(0) >= 97 ? c.toLowerCase().charCodeAt(0) - 97 + 10 : c.charCodeAt(0) - 48; }

  // 解析某进制输入；空串返回 0，非法返回 null
  function parseValue(text, radix) {
    if (text === '') return 0;
    for (var i = 0; i < text.length; i++) {
      var d = digit(text[i]);
      if (d >= radix) return null;
    }
    var v = 0;
    for (var j = 0; j < text.length; j++) v = v * radix + digit(text[j]);
    return v;
  }

  // 十进制 → 某进制字符串（去除前缀，便于回填各输入框）
  function toBase(value, radix) {
    if (value === 0) return '';
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var out = '';
    while (value > 0) {
      out = chars.charAt(value % radix) + out;
      value = Math.floor(value / radix);
    }
    return out;
  }

  let syncing = false;
  function updateAll(sourceId, sourceText, sourceRadix) {
    const value = parseValue(sourceText, sourceRadix);
    if (value === null) {
      inputs.forEach(function (el) {
        if (el.id !== sourceId) el.value = '';
        el.classList.remove('invalid');
      });
      errorLine.classList.add('show');
      errorLine.textContent = ui.invalid;
      return;
    }
    errorLine.classList.remove('show');
    syncing = true;
    inputs.forEach(function (el) {
      if (el.id === sourceId) {
        el.classList.remove('invalid');
        return;
      }
      const radix = parseInt(el.getAttribute('data-radix'), 10);
      el.value = value === 0 ? '' : toBase(value, radix);
      el.classList.remove('invalid');
    });
    syncing = false;
  }

  inputs.forEach(function (el) {
    const radix = parseInt(el.getAttribute('data-radix'), 10);
    let timer = null;
    el.addEventListener('input', () => {
      if (syncing) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const raw = el.value.trim();
        const value = parseValue(raw, radix);
        el.classList.toggle('invalid', value === null);
        if (value === null) {
          // 非法：清空其他，显示错误
          updateAll(el.id, el.value, radix);
          return;
        }
        updateAll(el.id, el.value, radix);
      }, 120);
    });
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    const input = document.getElementById('in_hex');
    input.value = 'ff';
    input.dispatchEvent(new Event('input'));
  });
  document.getElementById('btnClear').addEventListener('click', () => {
    inputs.forEach(function (el) { el.value = ''; el.classList.remove('invalid'); });
    errorLine.classList.remove('show');
    document.getElementById('in_bin').focus();
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

  // 接收扩展发来的文本：尝试识别进制（前缀或内容），填入对应输入框并触发转换
  function classify(text) {
    const s = text.trim();
    if (s === '') return { id: 'in_hex', radix: 16, body: s };
    if (/^0x[0-9a-fA-F]+$/.test(s)) return { id: 'in_hex', radix: 16, body: s.slice(2) };
    if (/^0b[01]+$/.test(s)) return { id: 'in_bin', radix: 2, body: s.slice(2) };
    if (/^0o[0-7]+$/.test(s)) return { id: 'in_oct', radix: 8, body: s.slice(2) };
    if (/^[0-9]+$/.test(s)) return { id: 'in_dec', radix: 10, body: s };
    if (/^[01]+$/.test(s)) return { id: 'in_bin', radix: 2, body: s };
    if (/^[0-7]+$/.test(s)) return { id: 'in_oct', radix: 8, body: s };
    if (/^[0-9a-fA-F]+$/.test(s)) return { id: 'in_hex', radix: 16, body: s };
    return null;
  }
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setInput') {
      const hit = classify(e.data.text);
      if (hit) {
        const input = document.getElementById(hit.id);
        input.value = hit.body;
        input.dispatchEvent(new Event('input'));
      }
    }
  });

  // 初始文本（由 Open xxx 命令通过 run(context, initialText) 传入）
  var initialText = ${initialTextSource};
  if (initialText) {
    const hit = classify(initialText);
    if (hit) {
      const input = document.getElementById(hit.id);
      input.value = hit.body;
      input.dispatchEvent(new Event('input'));
    }
  }
</script>
</body>
</html>`;
}
