import { getLocale, t } from '../i18n';

export function getHelloWorldWebviewContent(): string {
  const locale = getLocale();

  return `<!DOCTYPE html>
<html lang="${locale === 'zh-cn' ? 'zh-CN' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:;">
<title>Hello World</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 48px;
    overflow: hidden;
    font-family: "Segoe UI", system-ui, sans-serif;
    background: radial-gradient(circle at 50% 45%, #14163a, #05060f 70%);
  }
  .lang-switch {
    position: fixed;
    top: 18px;
    right: 22px;
    display: flex;
    gap: 6px;
    z-index: 10;
  }
  .lang-btn {
    padding: 5px 12px;
    font-size: 12px;
    font-family: inherit;
    color: #c9d2ff;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .lang-btn:hover { background: rgba(255, 255, 255, 0.12); }
  .lang-btn.active {
    color: #05060f;
    background: linear-gradient(135deg, #ff6ec4, #4adede);
    border-color: transparent;
    font-weight: 600;
  }
  .card {
    max-width: 720px;
    margin: 0 24px;
    padding: 28px 32px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    color: #dbe2ff;
    text-align: left;
    animation: rise 1s ease-out both;
  }
  .card h2 {
    margin-bottom: 14px;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(90deg, #ff6ec4, #7873f5, #4adede);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .card p { font-size: 15px; line-height: 1.9; }
  .card ul {
    margin-top: 12px;
    padding-left: 20px;
    font-size: 14px;
    line-height: 2.1;
    list-style: none;
  }
  .card li::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6ec4, #4adede);
    vertical-align: middle;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hello { display: flex; gap: 6px; }
  .hello span {
    font-size: clamp(32px, 9vw, 110px);
    font-weight: 800;
    letter-spacing: 4px;
    background: linear-gradient(135deg, #ff6ec4, #7873f5, #4adede, #ff6ec4);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: wave 1.8s ease-in-out infinite, flow 5s linear infinite;
  }
  .hello .space { width: 0.6em; }
  @keyframes wave {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-18px); }
  }
  @keyframes flow {
    0% { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }
  .dot {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    animation: float 8s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); opacity: 0.15; }
    50% { transform: translateY(-36px); opacity: 0.9; }
  }
</style>
</head>
<body>
  <div class="lang-switch" role="group" aria-label="${t('hello.lang.label')}">
    <button class="lang-btn${locale === 'en' ? ' active' : ''}" id="langEn" type="button">${t('hello.lang.en')}</button>
    <button class="lang-btn${locale === 'zh-cn' ? ' active' : ''}" id="langZh" type="button">${t('hello.lang.zh')}</button>
  </div>
  <div class="hello"></div>
  <div class="card">
    <h2>${t('hello.title')}</h2>
    <p>${t('hello.intro')}</p>
    <ul>
      <li>${t('hello.feature.1')}</li>
      <li>${t('hello.feature.2')}</li>
      <li>${t('hello.feature.3')}</li>
      <li>${t('hello.feature.4')}</li>
    </ul>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const currentLocale = ${JSON.stringify(locale)};

    document.getElementById('langEn').addEventListener('click', () => {
      if (currentLocale !== 'en') vscode.postMessage({ type: 'setLocale', locale: 'en' });
    });
    document.getElementById('langZh').addEventListener('click', () => {
      if (currentLocale !== 'zh-cn') vscode.postMessage({ type: 'setLocale', locale: 'zh-cn' });
    });

    const container = document.querySelector('.hello');
    const text = 'Hello World';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      if (ch === ' ') { s.classList.add('space'); }
      s.style.animationDelay = i * 0.07 + 's';
      container.appendChild(s);
    });

    for (let i = 0; i < 26; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      d.style.left = Math.random() * 100 + '%';
      d.style.top = Math.random() * 100 + '%';
      const size = 2 + Math.random() * 4;
      d.style.width = size + 'px';
      d.style.height = size + 'px';
      d.style.animationDuration = 6 + Math.random() * 8 + 's';
      d.style.animationDelay = -Math.random() * 10 + 's';
      document.body.appendChild(d);
    }
  </script>
</body>
</html>`;
}
