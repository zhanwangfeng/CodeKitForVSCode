export function getHelloWorldWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
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
  <div class="hello"></div>
  <div class="card">
    <h2>CodeKit For VSCode</h2>
    <p>一个把常用开发小工具收进侧边栏的 VSCode 扩展工具箱，随时取用。</p>
    <ul>
      <li>Activity Bar 自定义图标入口，一键进入工具面板</li>
      <li>主侧边栏 Tree View 树形列表，集中展示全部工具</li>
      <li>工具可在编辑器主区域打开 WebView 标签页，支持动画与交互</li>
      <li>新增工具只需实现 Tool 接口并登记，零运行时依赖</li>
    </ul>
  </div>
  <script>
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
