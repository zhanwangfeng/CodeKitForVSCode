/** 变量名转换专用 WebView：输入变量名，实时输出 camel/snake/kebab/pascal/constant 五种命名风格。 */
import { getLocale, t } from '../i18n';

/** 变量名转换 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getVarNameUI() {
  return {
    title: t('tool.varName.name'),
    placeholder: t('varName.placeholder'),
    sample: t('common.sample'),
    clear: t('common.clear'),
    copy: t('common.copy'),
    copied: t('common.copied'),
  };
}

export function getVarNameWebviewContent(initialText?: string): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const formats = [
    { id: 'camel', label: t('varName.camel') },
    { id: 'snake', label: t('varName.snake') },
    { id: 'kebab', label: t('varName.kebab') },
    { id: 'pascal', label: t('varName.pascal') },
    { id: 'constant', label: t('varName.constant') },
  ];

  const ui = getVarNameUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');
  const initialTextSource = initialText ? JSON.stringify(initialText).replace(/</g, '\\u003c') : 'null';

  const formatRows = formats
    .map(
      (f) => `      <div class="format-row">
        <span class="format-label">${f.label}</span>
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
<title>${t('tool.varName.name')}</title>
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
    padding: 12px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    flex-shrink: 0;
  }
  .input-section input {
    width: 100%;
    padding: 8px 10px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #2a2a2a);
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
  }
  .input-section input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  .input-section input::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
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
    min-width: 120px;
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
</style>
</head>
<body>
  <div class="toolbar">
    <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.varName.name')}</button>
    <div class="toolbar-actions">
      <button class="btn" id="btnSample" type="button" data-i18n="sample">${ui.sample}</button>
      <button class="btn" id="btnClear" type="button" data-i18n="clear">${ui.clear}</button>
    </div>
  </div>
  <div class="input-section">
    <input id="input" type="text" placeholder="${ui.placeholder}" data-i18n-ph="placeholder" spellcheck="false" autofocus>
  </div>
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
  const ui = ${uiSource};
  const input = document.getElementById('input');

  function convert(text, op) {
    text = text.trim();
    if (!text) return '';
    var words;
    if (/[_\\-.\\s]/.test(text)) {
      words = text.split(/[_\\-.\\s]+/);
    } else {
      words = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\\s+/);
    }
    words = words.map(function (w) { return w.toLowerCase(); }).filter(function (w) { return w.length > 0; });
    if (!words.length) return '';
    switch (op) {
      case 'camel':
        return words[0] + words.slice(1).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
      case 'snake':
        return words.join('_');
      case 'kebab':
        return words.join('-');
      case 'pascal':
        return words.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('');
      case 'constant':
        return words.map(function (w) { return w.toUpperCase(); }).join('_');
      default:
        return text;
    }
  }

  function update() {
    const text = input.value;
    ['camel', 'snake', 'kebab', 'pascal', 'constant'].forEach(function (op) {
      document.getElementById('out_' + op).value = convert(text, op);
    });
  }

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(update, 100);
  });

  document.getElementById('btnSample').addEventListener('click', () => {
    input.value = 'some_variableName-Test';
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

  // 接收扩展发来的文本，填充到输入窗并触发转换（由 Open Variable Name 命令发送）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'setInput') {
      input.value = e.data.text;
      input.dispatchEvent(new Event('input'));
    }
  });

  // 初始文本（由 Open Variable Name 命令通过 run(context, initialText) 传入）
  var initialText = ${initialTextSource};
  if (initialText) {
    input.value = initialText;
    input.dispatchEvent(new Event('input'));
  }
</script>
</body>
</html>`;
}
