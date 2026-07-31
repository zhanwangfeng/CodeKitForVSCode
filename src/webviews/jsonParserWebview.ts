export function getJsonParserWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>JSON Parser</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; font-family: var(--vscode-font-family); }

  body {
    display: flex;
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
  }

  .container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .left-panel {
    width: 50%;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--vscode-panel-border);
  }

  .right-panel {
    width: 50%;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .panel-header {
    padding: 12px 16px;
    background: var(--vscode-editorGroupHeader-tabsBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
  }

  .panel-content {
    flex: 1;
    padding: 12px;
    overflow: auto;
  }

  textarea {
    width: 100%;
    height: 100%;
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    border: 1px solid var(--vscode-input-border);
    padding: 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    resize: none;
    outline: none;
    line-height: 1.6;
  }

  textarea:focus {
    border-color: var(--vscode-focusBorder);
  }

  .tree-container {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
  }

  .tree-node {
    margin-left: 0;
  }

  .tree-children {
    margin-left: 20px;
  }

  .tree-item {
    margin: 4px 0;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  .tree-key {
    color: var(--vscode-json-property-syntax);
    font-weight: 500;
  }

  .tree-colon {
    color: var(--vscode-editor-foreground);
    opacity: 0.6;
  }

  .tree-value {
    border-radius: 3px;
    padding: 1px 4px;
    cursor: default;
  }

  .tree-value.string { color: var(--vscode-json-string-syntax); }
  .tree-value.number { color: var(--vscode-json-number-syntax); }
  .tree-value.boolean { color: var(--vscode-json-boolean-syntax); }
  .tree-value.null { color: var(--vscode-json-null-foreground); font-style: italic; }
  .tree-value.empty-object,
  .tree-value.empty-array { color: var(--vscode-editor-foreground); opacity: 0.5; }

  .tree-toggle {
    cursor: pointer;
    user-select: none;
    width: 16px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--vscode-editor-foreground);
    opacity: 0.6;
    font-size: 12px;
    transition: opacity 0.15s;
  }

  .tree-toggle:hover { opacity: 1; }

  .tree-type-badge {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    margin-left: 8px;
    font-weight: 500;
    cursor: default;
  }

  .error-container {
    padding: 16px;
    background: var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1));
    border: 1px solid var(--vscode-inputValidation-errorBorder, rgba(255, 0, 0, 0.3));
    border-radius: 4px;
    color: var(--vscode-errorForeground, #f48771);
  }

  .error-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .error-message {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--vscode-descriptionForeground);
    opacity: 0.6;
    font-size: 14px;
  }
</style>
</head>
<body>
<div class="container">
  <div class="left-panel">
    <div class="panel-header">JSON 输入</div>
    <div class="panel-content">
      <textarea id="jsonInput" placeholder="在此输入 JSON 字符串..."></textarea>
    </div>
  </div>

  <div class="right-panel">
    <div class="panel-header">解析结果</div>
    <div class="panel-content">
      <div id="resultContainer" class="tree-container">
        <div class="placeholder">等待输入 JSON...</div>
      </div>
    </div>
  </div>
</div>

<script>
  const input = document.getElementById('jsonInput');
  const resultContainer = document.getElementById('resultContainer');

  let parseTimer = null;

  input.addEventListener('input', () => {
    clearTimeout(parseTimer);
    parseTimer = setTimeout(parseJSON, 300);
  });

  function parseJSON() {
    const text = input.value.trim();

    if (!text) {
      resultContainer.innerHTML = '<div class="placeholder">等待输入 JSON...</div>';
      return;
    }

    try {
      const data = JSON.parse(text);
      resultContainer.innerHTML = '';
      resultContainer.appendChild(renderValue(data));
    } catch (e) {
      showError(e);
    }
  }

  function renderValue(value, key = null, depth = 0) {
    const container = document.createElement('div');
    container.className = 'tree-node';

    if (value === null) {
      container.appendChild(renderPrimitive(key, 'null', 'null'));
    } else if (Array.isArray(value)) {
      container.appendChild(renderArray(key, value, depth));
    } else if (typeof value === 'object') {
      container.appendChild(renderObject(key, value, depth));
    } else {
      const type = typeof value;
      container.appendChild(renderPrimitive(key, type, value));
    }

    return container;
  }

  function renderPrimitive(key, type, value) {
    const item = document.createElement('div');
    item.className = 'tree-item';

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = key;
      item.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'tree-colon';
      colon.textContent = ':';
      item.appendChild(colon);
    }

    const valueSpan = document.createElement('span');
    valueSpan.className = 'tree-value ' + type;

    if (type === 'string') {
      valueSpan.textContent = '"' + escapeHtml(value) + '"';
    } else if (type === 'boolean') {
      valueSpan.textContent = value ? 'true' : 'false';
    } else if (type === 'null') {
      valueSpan.textContent = 'null';
    } else {
      valueSpan.textContent = value;
    }

    item.appendChild(valueSpan);

    const badge = document.createElement('span');
    badge.className = 'tree-type-badge';
    badge.textContent = type;
    item.appendChild(badge);

    return item;
  }

  function renderArray(key, array, depth) {
    const item = document.createElement('div');
    item.className = 'tree-item';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    toggle.textContent = '▼';
    toggle.addEventListener('click', () => {
      const children = item.nextElementSibling;
      if (children) {
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
        toggle.textContent = children.style.display === 'none' ? '▶' : '▼';
      }
    });
    item.appendChild(toggle);

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = key;
      item.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'tree-colon';
      colon.textContent = ':';
      item.appendChild(colon);
    }

    const count = document.createElement('span');
    count.className = 'tree-value';
    count.textContent = array.length === 0 ? '[]' : '[...]';
    item.appendChild(count);

    const badge = document.createElement('span');
    badge.className = 'tree-type-badge';
    badge.textContent = 'array';
    item.appendChild(badge);

    if (array.length === 0) {
      count.classList.add('empty-array');
      toggle.style.visibility = 'hidden';
    }

    const container = document.createElement('div');
    container.className = 'tree-children';

    if (array.length > 0) {
      array.forEach((val, i) => {
        container.appendChild(renderValue(val, i.toString(), depth + 1));
      });
    }

    const wrapper = document.createElement('div');
    wrapper.appendChild(item);
    if (array.length > 0) {
      wrapper.appendChild(container);
    }

    return wrapper;
  }

  function renderObject(key, obj, depth) {
    const item = document.createElement('div');
    item.className = 'tree-item';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    toggle.textContent = '▼';
    toggle.addEventListener('click', () => {
      const children = item.nextElementSibling;
      if (children) {
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
        toggle.textContent = children.style.display === 'none' ? '▶' : '▼';
      }
    });
    item.appendChild(toggle);

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = key;
      item.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'tree-colon';
      colon.textContent = ':';
      item.appendChild(colon);
    }

    const keys = Object.keys(obj);
    const count = document.createElement('span');
    count.className = 'tree-value';
    count.textContent = keys.length === 0 ? '{}' : '{...}';
    item.appendChild(count);

    const badge = document.createElement('span');
    badge.className = 'tree-type-badge';
    badge.textContent = 'object';
    item.appendChild(badge);

    if (keys.length === 0) {
      count.classList.add('empty-object');
      toggle.style.visibility = 'hidden';
    }

    const container = document.createElement('div');
    container.className = 'tree-children';

    if (keys.length > 0) {
      Object.entries(obj).forEach(([k, val]) => {
        container.appendChild(renderValue(val, k, depth + 1));
      });
    }

    const wrapper = document.createElement('div');
    wrapper.appendChild(item);
    if (keys.length > 0) {
      wrapper.appendChild(container);
    }

    return wrapper;
  }

  function showError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';

    const title = document.createElement('div');
    title.className = 'error-title';
    title.textContent = 'JSON 解析失败';
    errorDiv.appendChild(title);

    const message = document.createElement('div');
    message.className = 'error-message';

    let errorMessage = error.message;

    const lineMatch = errorMessage.match(/line (\\d+)/);
    const columnMatch = errorMessage.match(/column (\\d+)/);

    if (lineMatch && columnMatch) {
      message.innerHTML = '<strong>位置:</strong> 行 ' + lineMatch[1] + ', 列 ' + columnMatch[1] + '<br><br>';
      message.innerHTML += '<strong>错误:</strong> ' + escapeHtml(errorMessage);
    } else {
      message.textContent = errorMessage;
    }

    errorDiv.appendChild(message);
    resultContainer.innerHTML = '';
    resultContainer.appendChild(errorDiv);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
</script>
</body>
</html>`;
}