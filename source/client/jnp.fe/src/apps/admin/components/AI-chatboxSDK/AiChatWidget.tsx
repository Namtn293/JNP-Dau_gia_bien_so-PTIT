import { useEffect } from "react";
import tokenManager from "~/shared/utils/tokenManager";

const AI_CHAT_WIDGET_SCRIPT_ID = "ai-chat-widget-sdk";

declare global {
  interface Window {
    AI_WIDGET_CONFIG?: {
      token: string;
      apiUrl?: string;
    };
  }
}
const AiChatWidget = () => {
  useEffect(() => {
    const domain = import.meta.env.VITE_DOMAIN_AI_CHATBOX?.trim();
    const key = import.meta.env.VITE_KEY_AI_CHATBOX?.trim();

    if (!domain || !key) {
      console.warn("AI Chat Widget env is missing");
      return;
    }
    // Lấy Token của người dùng khi đã đăng nhập thành công
    const token = tokenManager.getAccessToken() || "";

    // Khai báo cấu hình cho Widget
    window.AI_WIDGET_CONFIG = {
      token,
    };

    const scriptUrl = new URL(domain);

    scriptUrl.searchParams.set("key", key);

    const scriptSrc = scriptUrl.toString();

    const currentScript = document.getElementById(
      AI_CHAT_WIDGET_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    // Không load lại nếu đã tồn tại đúng script
    if (currentScript?.src === scriptSrc) {
      return;
    }

    // Xóa script cũ nếu khác src
    currentScript?.remove();

    const script = document.createElement("script");

    script.id = AI_CHAT_WIDGET_SCRIPT_ID;
    script.src = scriptSrc;
    script.async = true;
    script.charset = "UTF-8";

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
};

export default AiChatWidget;
