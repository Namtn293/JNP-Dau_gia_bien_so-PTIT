import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget';
import { StyleSheetManager } from 'styled-components';

/**
 * Entry point cho Chat Widget.
 */
const initWidget = () => {
  // 1. Tìm script tag
  let scriptTag = document.currentScript as HTMLScriptElement;
  if (!scriptTag) {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('ai-widget.js')) {
        scriptTag = scripts[i];
        break;
      }
    }
  }

  if (!scriptTag) {
    return;
  }

  const url = new URL(scriptTag.src);
  const widgetKey = url.searchParams.get('key');

  // 2. Tạo container
  if (!document.body) {
    setTimeout(initWidget, 100);
    return;
  }

  // Tránh tạo nhiều container nếu script bị load lại
  if (document.getElementById('ai-chat-widget-root')) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'ai-chat-widget-root';
  container.style.position = 'fixed';
  container.style.bottom = '0';
  container.style.right = '0';
  container.style.zIndex = '2147483647';
  document.body.appendChild(container);

  const shadowRoot = container.attachShadow({ mode: 'open' });
  const reactRootDiv = document.createElement('div');
  reactRootDiv.id = 'react-root';
  // Thêm text loading để debug
  reactRootDiv.innerHTML = '<div style="position:fixed; bottom:20px; right:20px; font-family:sans-serif; color:#8b1d2c; font-size:12px;">AI Loading...</div>';
  shadowRoot.appendChild(reactRootDiv);

  // 3. Khởi tạo React
  try {
    const root = createRoot(reactRootDiv);
    root.render(
      <React.StrictMode>
        <StyleSheetManager target={shadowRoot}>
          <ChatWidget widgetKey={widgetKey || ''} />
        </StyleSheetManager>
      </React.StrictMode>
    );
  } catch (err) {
    // Ignore error in prod
  }
};

// Đảm bảo chạy sau khi DOM sẵn sàng
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initWidget, 1);
} else {
  document.addEventListener('DOMContentLoaded', initWidget);
}
