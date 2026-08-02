/** Unix 时间专用 WebView：当前时间戳 + 时区选择 + 时间戳↔日期互转，支持全球所有时区。 */
import { getLocale, t } from '../i18n';

/** Unix 时间 WebView 全部文案（语言切换时由扩展侧重新取值并 postMessage 给 WebView） */
export function getUnixTimeUI() {
  return {
    title: t('tool.unixTime.name'),
    current: t('unix.current'),
    seconds: t('unix.seconds'),
    millis: t('unix.millis'),
    toDate: t('unix.toDate'),
    toStamp: t('unix.toStamp'),
    toStampQuick: t('unix.toStampQuick'),
    timezone: t('unix.timezone'),
    convert: t('unix.convert'),
    year: t('unix.year'),
    month: t('unix.month'),
    day: t('unix.day'),
    hour: t('unix.hour'),
    minute: t('unix.minute'),
    second: t('unix.second'),
    result: t('unix.result'),
    copy: t('unix.copy'),
    copied: t('unix.copied'),
    invalid: t('unix.invalid'),
    _locale: getLocale(),
  };
}

export function getUnixTimeWebviewContent(): string {
  const langAttr = getLocale() === 'zh-cn' ? 'zh-CN' : 'en';

  const ui = getUnixTimeUI();
  const uiSource = JSON.stringify(ui).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>${t('tool.unixTime.name')}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    font-family: var(--vscode-font-family, "Segoe UI", system-ui, sans-serif);
    font-size: 13px;
    color: var(--vscode-foreground, #ccc);
    background: var(--vscode-editor-background, #1e1e1e);
    padding: 12px 14px;
    overflow-y: auto;
  }
  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-foreground, #ccc);
    margin-bottom: 8px;
  }
  .card {
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    border-radius: 4px;
    overflow: hidden;
    background: var(--vscode-input-background, #2a2a2a);
  }
  .card-row {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    gap: 8px;
  }
  .card-row + .card-row {
    border-top: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
  }
  .card-row.output-row {
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.03));
  }
  .card-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground, #888);
    min-width: 60px;
    flex-shrink: 0;
  }
  .card-value {
    flex: 1;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: transparent;
    border: none;
    outline: none;
    min-width: 0;
  }
  .card-value::placeholder { color: var(--vscode-input-placeholderForeground, #666); }
  .card-value[readonly] { cursor: default; color: var(--vscode-foreground, #ccc); }
  .btn {
    padding: 5px 16px;
    font-size: 12px;
    font-family: inherit;
    color: var(--vscode-button-foreground, #fff);
    background: var(--vscode-button-background, #0e639c);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.12s;
  }
  .btn:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
  .btn.secondary {
    color: var(--vscode-button-secondaryForeground, #fff);
    background: var(--vscode-button-secondaryBackground, rgba(255,255,255,0.06));
    border: 1px solid var(--vscode-button-secondaryBorder, rgba(255,255,255,0.14));
  }
  .btn.secondary:hover { background: var(--vscode-button-secondaryHoverBackground, rgba(255,255,255,0.12)); }
  .btn-icon { padding: 4px 8px; font-size: 14px; line-height: 1; }
  /* 标题栏 */
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
    margin-bottom: 16px;
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
    gap: 16px;
    align-items: center;
    font-size: 12px;
    color: var(--vscode-foreground, #ccc);
  }
  .toolbar-actions label { display: flex; align-items: center; gap: 5px; cursor: pointer; user-select: none; }
  .toolbar-actions input[type="radio"], .radio-group input[type="radio"] {
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
  .toolbar-actions input[type="radio"]:checked, .radio-group input[type="radio"]:checked {
    border-color: #fff;
    background: #fff;
  }
  /* 时区选择 */
  .tz-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
  }
  .tz-row label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground, #888);
    flex-shrink: 0;
  }
  .tz-select {
    flex: 1;
    padding: 5px 8px;
    font-family: inherit;
    font-size: 12px;
    color: var(--vscode-dropdown-foreground, #ccc);
    background: var(--vscode-dropdown-background, #3a3a3a);
    border: 1px solid var(--vscode-dropdown-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    min-width: 0;
  }
  .tz-select:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  /* 逐项输入 */
  .date-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1; }
  .date-field { display: flex; align-items: center; gap: 3px; }
  .date-field input {
    width: 52px;
    padding: 5px 6px;
    font-family: var(--vscode-editor-font-family, "SF Mono", Menlo, monospace);
    font-size: 13px;
    color: var(--vscode-input-foreground, #ccc);
    background: var(--vscode-input-background, #3a3a3a);
    border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    outline: none;
    text-align: center;
  }
  .date-field input:focus { border-color: var(--vscode-focusBorder, #007fd4); }
  .date-field .sep { color: var(--vscode-descriptionForeground, #888); font-size: 12px; }
  .date-field .unit { color: var(--vscode-descriptionForeground, #888); font-size: 12px; }
  .output-error { color: var(--vscode-errorForeground, #f48771) !important; }
</style>
</head>
<body>

<!-- 标题栏 -->
<div class="toolbar">
  <button class="title-badge" type="button" disabled data-i18n="title">${t('tool.unixTime.name')}</button>
  <div class="toolbar-actions">
    <label><input type="radio" name="precision" value="s" checked><span data-i18n="seconds">${ui.seconds}</span></label>
    <label><input type="radio" name="precision" value="ms"><span data-i18n="millis">${ui.millis}</span></label>
  </div>
</div>

<!-- 当前时间戳 -->
<div class="section">
  <div class="section-title" data-i18n="current">${ui.current}</div>
  <div class="card">
    <div class="card-row">
      <input class="card-value" id="currentStamp" readonly>
      <button class="btn btn-icon secondary" id="copyCurrent" title="${ui.copy}" data-i18n-tit="copy">&#x2398;</button>
    </div>
  </div>
</div>

<!-- 时区选择 -->
<div class="section">
  <div class="card">
    <div class="tz-row">
      <label data-i18n="timezone">${ui.timezone}</label>
      <select class="tz-select" id="tzSelect"></select>
    </div>
  </div>
</div>

<!-- 时间戳 → 日期 -->
<div class="section">
  <div class="section-title" data-i18n="toDate">${ui.toDate}</div>
  <div class="card">
    <div class="card-row">
      <input class="card-value" id="tsInput" placeholder="${ui.current}" data-i18n-ph="current" autofocus spellcheck="false">
      <button class="btn" id="btnToDate" type="button" data-i18n="convert">${ui.convert}</button>
    </div>
    <div class="card-row output-row">
      <input class="card-value" id="dateOutput" readonly>
      <button class="btn btn-icon secondary" id="copyDate" title="${ui.copy}" data-i18n-tit="copy">&#x2398;</button>
    </div>
  </div>
</div>

<!-- 日期 → 时间戳（逐项输入） -->
<div class="section">
  <div class="section-title" data-i18n="toStamp">${ui.toStamp}</div>
  <div class="card">
    <div class="card-row">
      <div class="date-row">
        <div class="date-field"><input id="inY" type="text" maxlength="4" placeholder="YYYY"><span class="unit" data-i18n="year">${ui.year}</span></div>
        <span class="sep">-</span>
        <div class="date-field"><input id="inMo" type="text" maxlength="2" placeholder="MM"><span class="unit" data-i18n="month">${ui.month}</span></div>
        <span class="sep">-</span>
        <div class="date-field"><input id="inD" type="text" maxlength="2" placeholder="DD"><span class="unit" data-i18n="day">${ui.day}</span></div>
        <span class="sep">&nbsp;&nbsp;</span>
        <div class="date-field"><input id="inH" type="text" maxlength="2" placeholder="HH"><span class="unit" data-i18n="hour">${ui.hour}</span></div>
        <span class="sep">:</span>
        <div class="date-field"><input id="inMi" type="text" maxlength="2" placeholder="MM"><span class="unit" data-i18n="minute">${ui.minute}</span></div>
        <span class="sep">:</span>
        <div class="date-field"><input id="inS" type="text" maxlength="2" placeholder="SS"><span class="unit" data-i18n="second">${ui.second}</span></div>
      </div>
      <button class="btn" id="btnStampIndividual" type="button" data-i18n="convert">${ui.convert}</button>
    </div>
    <div class="card-row output-row">
      <input class="card-value" id="stampOutput" readonly>
      <button class="btn btn-icon secondary" id="copyStamp" title="${ui.copy}" data-i18n-tit="copy">&#x2398;</button>
    </div>
  </div>
</div>

<!-- 日期 → 时间戳（快速输入） -->
<div class="section">
  <div class="section-title" data-i18n="toStampQuick">${ui.toStampQuick}</div>
  <div class="card">
    <div class="card-row">
      <input class="card-value" id="quickInput" placeholder="YYYYMMDDHHMMSS" spellcheck="false">
      <button class="btn" id="btnQuick" type="button" data-i18n="convert">${ui.convert}</button>
    </div>
    <div class="card-row output-row">
      <input class="card-value" id="quickOutput" readonly>
      <button class="btn btn-icon secondary" id="copyQuick" title="${ui.copy}" data-i18n-tit="copy">&#x2398;</button>
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
    document.querySelectorAll('[data-i18n-tit]').forEach(function(el) { var v = val(el.getAttribute('data-i18n-tit')); if (v !== null) el.setAttribute('title', v); });
  });
  // 时区下拉需按新语言重建城市名（ui._locale 已由上面的监听器刷新）
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'localeChanged' && typeof buildTimezoneOptions === 'function') {
      buildTimezoneOptions();
    }
  });
  const ui = ${uiSource};

  // —— 时区下拉：GMT-12 到 GMT+12，每小时一个条目，每个带代表城市 ——
  const tzSelect = document.getElementById('tzSelect');
  const tzEntries = [
    { off: -12, zh: '贝克岛', en: 'Baker Island' },
    { off: -11, zh: '美属萨摩亚', en: 'American Samoa' },
    { off: -10, zh: '夏威夷', en: 'Hawaii' },
    { off: -9, zh: '阿拉斯加', en: 'Alaska' },
    { off: -8, zh: '太平洋时间', en: 'Pacific Time' },
    { off: -7, zh: '山地时间', en: 'Mountain Time' },
    { off: -6, zh: '中部时间', en: 'Central Time' },
    { off: -5, zh: '东部时间', en: 'Eastern Time' },
    { off: -4, zh: '大西洋时间', en: 'Atlantic Time' },
    { off: -3, zh: '布宜诺斯艾利斯', en: 'Buenos Aires' },
    { off: -2, zh: '中大西洋', en: 'Mid-Atlantic' },
    { off: -1, zh: '亚速尔群岛', en: 'Azores' },
    { off: 0, zh: '格林尼治', en: 'Greenwich' },
    { off: 1, zh: '中欧时间', en: 'Central Europe' },
    { off: 2, zh: '东欧时间', en: 'Eastern Europe' },
    { off: 3, zh: '莫斯科', en: 'Moscow' },
    { off: 4, zh: '迪拜', en: 'Dubai' },
    { off: 5, zh: '伊斯兰堡', en: 'Islamabad' },
    { off: 6, zh: '达卡', en: 'Dhaka' },
    { off: 7, zh: '曼谷', en: 'Bangkok' },
    { off: 8, zh: '北京', en: 'Beijing' },
    { off: 9, zh: '东京', en: 'Tokyo' },
    { off: 10, zh: '悉尼', en: 'Sydney' },
    { off: 11, zh: '所罗门群岛', en: 'Solomon Islands' },
    { off: 12, zh: '奥克兰', en: 'Auckland' },
  ];
  // 默认选中本地时区偏移
  const localOffset = -new Date().getTimezoneOffset() / 60;
  // 按当前 ui._locale 重建时区选项，保留已选偏移
  function buildTimezoneOptions() {
    const isZh = ui._locale === 'zh-cn';
    const prevValue = tzSelect.value;
    tzSelect.innerHTML = '';
    tzEntries.forEach((entry) => {
      const opt = document.createElement('option');
      opt.value = String(entry.off);
      const sign = entry.off >= 0 ? '+' : '';
      const base = isZh ? '格林尼治时间' : 'GMT';
      const city = isZh ? entry.zh : entry.en;
      opt.textContent = '(' + base + sign + entry.off + ') ' + city;
      const keep = prevValue ? String(entry.off) === prevValue : entry.off === localOffset;
      if (keep) opt.selected = true;
      tzSelect.appendChild(opt);
    });
  }
  buildTimezoneOptions();
  function currentOffset() { return parseInt(tzSelect.value, 10) || 0; }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  // —— 时间戳 → 指定偏移的墙上时间字符串（纯偏移计算，无夏令时干扰）——
  function timestampToWall(offsetHours, ms) {
    const d = new Date(ms + offsetHours * 3600000);
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' +
      pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
  }

  // —— 指定偏移的墙上时间 → 时间戳 ——
  function wallToTimestamp(offsetHours, y, mo, d, h, mi, s) {
    return Date.UTC(y, mo - 1, d, h, mi, s) - offsetHours * 3600000;
  }

  // —— 当前时间戳：每秒刷新 ——
  const currentStamp = document.getElementById('currentStamp');
  let precision = 's';
  function refreshCurrent() {
    const now = Date.now();
    currentStamp.value = precision === 'ms' ? String(now) : String(Math.floor(now / 1000));
  }
  document.querySelectorAll('input[name="precision"]').forEach((r) => {
    r.addEventListener('change', (e) => { precision = e.target.value; refreshCurrent(); });
  });
  refreshCurrent();
  setInterval(refreshCurrent, 1000);

  // —— 复制 ——
  function bindCopy(btnId, textFn) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      const text = textFn();
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const old = btn.title;
          btn.title = ui.copied;
          setTimeout(() => { btn.title = old; }, 1200);
        });
      }
    });
  }
  bindCopy('copyCurrent', () => currentStamp.value);
  bindCopy('copyDate', () => document.getElementById('dateOutput').value);
  bindCopy('copyStamp', () => document.getElementById('stampOutput').value);
  bindCopy('copyQuick', () => document.getElementById('quickOutput').value);

  // —— 时间戳 → 日期 ——
  function toDate() {
    const input = document.getElementById('tsInput');
    const output = document.getElementById('dateOutput');
    const text = input.value.trim();
    if (!text) { output.value = ''; output.classList.remove('output-error'); return; }
    const num = Number(text);
    if (isNaN(num)) { output.value = ui.invalid; output.classList.add('output-error'); return; }
    let ms = num;
    if (/^\\d+$/.test(text) && Math.abs(num) < 1e12) ms = num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { output.value = ui.invalid; output.classList.add('output-error'); return; }
    output.classList.remove('output-error');
    output.value = timestampToWall(currentOffset(), ms);
  }
  document.getElementById('btnToDate').addEventListener('click', toDate);
  document.getElementById('tsInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') toDate(); });

  // —— 日期 → 时间戳（逐项） ——
  function toStampIndividual() {
    const y = parseInt(document.getElementById('inY').value, 10);
    const mo = parseInt(document.getElementById('inMo').value, 10);
    const d = parseInt(document.getElementById('inD').value, 10);
    const h = parseInt(document.getElementById('inH').value, 10);
    const mi = parseInt(document.getElementById('inMi').value, 10);
    const s = parseInt(document.getElementById('inS').value, 10);
    const output = document.getElementById('stampOutput');
    if ([y,mo,d,h,mi,s].some((v) => isNaN(v))) { output.value = ui.invalid; output.classList.add('output-error'); return; }
    const ts = wallToTimestamp(currentOffset(), y, mo, d, h, mi, s);
    if (isNaN(ts)) { output.value = ui.invalid; output.classList.add('output-error'); return; }
    output.classList.remove('output-error');
    output.value = Math.floor(ts / 1000) + '  /  ' + ts + '  (s / ms)';
  }
  document.getElementById('btnStampIndividual').addEventListener('click', toStampIndividual);

  // —— 日期 → 时间戳（快速） ——
  function toStampQuick() {
    const input = document.getElementById('quickInput');
    const output = document.getElementById('quickOutput');
    const text = input.value.trim();
    if (!text) { output.value = ''; output.classList.remove('output-error'); return; }
    if (!/^\\d{14}$/.test(text)) { output.value = ui.invalid; output.classList.add('output-error'); return; }
    const y = parseInt(text.substr(0, 4), 10);
    const mo = parseInt(text.substr(4, 2), 10);
    const d = parseInt(text.substr(6, 2), 10);
    const h = parseInt(text.substr(8, 2), 10);
    const mi = parseInt(text.substr(10, 2), 10);
    const s = parseInt(text.substr(12, 2), 10);
    const ts = wallToTimestamp(currentOffset(), y, mo, d, h, mi, s);
    if (isNaN(ts)) { output.value = ui.invalid; output.classList.add('output-error'); return; }
    output.classList.remove('output-error');
    output.value = Math.floor(ts / 1000) + '  /  ' + ts + '  (s / ms)';
  }
  document.getElementById('btnQuick').addEventListener('click', toStampQuick);
  document.getElementById('quickInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') toStampQuick(); });

  ['inY','inMo','inD','inH','inMi','inS'].forEach((id) => {
    document.getElementById(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') toStampIndividual(); });
  });

  // —— 时区切换时：若已有输出，按新时区重算（保持结果与时区一致） ——
  tzSelect.addEventListener('change', () => {
    const dateOut = document.getElementById('dateOutput');
    const tsInput = document.getElementById('tsInput');
    if (tsInput.value.trim() && dateOut.value && !dateOut.classList.contains('output-error')) toDate();
  });

  // —— 默认填充当前时间 ——
  (function fillCurrentTime() {
    const now = Date.now();
    const offset = currentOffset();
    const d = new Date(now + offset * 3600000);
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth() + 1;
    const da = d.getUTCDate();
    const h = d.getUTCHours();
    const mi = d.getUTCMinutes();
    const s = d.getUTCSeconds();

    // 时间戳 → 日期：填充当前时间戳（秒级）
    document.getElementById('tsInput').value = String(Math.floor(now / 1000));

    // 日期 → 时间戳（逐项）：填充当前日期时间
    document.getElementById('inY').value = String(y);
    document.getElementById('inMo').value = pad(mo);
    document.getElementById('inD').value = pad(da);
    document.getElementById('inH').value = pad(h);
    document.getElementById('inMi').value = pad(mi);
    document.getElementById('inS').value = pad(s);

    // 日期 → 时间戳（快速）：填充 YYYYMMDDHHMMSS
    document.getElementById('quickInput').value = '' + y + pad(mo) + pad(da) + pad(h) + pad(mi) + pad(s);
  })();
</script>
</body>
</html>`;
}
