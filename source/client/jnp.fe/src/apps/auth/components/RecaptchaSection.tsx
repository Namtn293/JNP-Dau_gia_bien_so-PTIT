import { Alert, Spin } from "antd";
import { useEffect, useState } from "react";

interface GoogleRecaptcha {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: GoogleRecaptcha;
  }
}

interface RecaptchaSectionProps {
  /** Nhận hàm sinh token — gọi hàm này ngay trước khi submit */
  onExecutorChange: (executor: (() => Promise<string>) | null) => void;
}

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-script";
const RECAPTCHA_BADGE_STYLE_ID = "google-recaptcha-badge-style";
const RECAPTCHA_LOAD_TIMEOUT = 10000;
const RECAPTCHA_ACTION = "login";
const DEFAULT_RECAPTCHA_BASE_URL = "https://www.google.com";
const FALLBACK_RECAPTCHA_BASE_URL = "https://www.recaptcha.net";

export const RecaptchaSection = ({ onExecutorChange }: RecaptchaSectionProps) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const recaptchaBaseUrl =
    (import.meta.env.VITE_RECAPTCHA_BASE_URL as string | undefined) ??
    DEFAULT_RECAPTCHA_BASE_URL;

  const [loadStatus, setLoadStatus] = useState<"idle" | "loading" | "ready" | "error">(
    siteKey ? "loading" : "idle",
  );

  useEffect(() => {
    if (!siteKey) {
      onExecutorChange(null);
      return;
    }

    // Ẩn badge reCAPTCHA mặc định ở góc màn hình
    if (!document.getElementById(RECAPTCHA_BADGE_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = RECAPTCHA_BADGE_STYLE_ID;
      style.textContent = `
        .grecaptcha-badge {
          visibility: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }

    let cancelled = false;
    let ready = false;
    let loadTimer: number | undefined;

    const clearLoadTimer = () => {
      if (!loadTimer) {
        return;
      }

      window.clearTimeout(loadTimer);
      loadTimer = undefined;
    };

    // Hàm sinh token — gọi khi cần submit form
    const executeRecaptcha = () =>
      new Promise<string>((resolve, reject) => {
        if (!window.grecaptcha) {
          reject(new Error("reCAPTCHA is not available"));
          return;
        }

        window.grecaptcha.ready(() => {
          if (cancelled || !window.grecaptcha) {
            reject(new Error("reCAPTCHA is not available"));
            return;
          }

          window.grecaptcha
            .execute(siteKey, { action: RECAPTCHA_ACTION })
            .then(resolve)
            .catch(reject);
        });
      });

    // Đánh dấu sẵn sàng và truyền executor ra ngoài
    const markReady = () => {
      if (cancelled || !window.grecaptcha) {
        return;
      }

      window.grecaptcha.ready(() => {
        if (cancelled) {
          return;
        }

        clearLoadTimer();
        ready = true;
        setLoadStatus("ready");
        onExecutorChange(executeRecaptcha);
      });
    };

    const buildScriptSrc = (baseUrl: string) => {
      const url = new URL("/recaptcha/api.js", baseUrl);
      url.searchParams.set("render", siteKey);
      return url.toString();
    };

    const hasExpectedScript = () => {
      const script = document.getElementById(
        RECAPTCHA_SCRIPT_ID,
      ) as HTMLScriptElement | null;

      if (!script?.src) {
        return false;
      }

      return new URL(script.src).searchParams.get("render") === siteKey;
    };

    // Tải script — nếu lỗi hoặc timeout, thử fallback URL
    const loadScript = (baseUrl: string, canFallback: boolean) => {
      clearLoadTimer();
      setLoadStatus("loading");
      document.getElementById(RECAPTCHA_SCRIPT_ID)?.remove();

      const script = Object.assign(document.createElement("script"), {
        id: RECAPTCHA_SCRIPT_ID,
        src: buildScriptSrc(baseUrl),
        async: true,
        defer: true,
      });

      const handleScriptError = () => {
        if (cancelled) return;
        if (canFallback && baseUrl !== FALLBACK_RECAPTCHA_BASE_URL) {
          loadScript(FALLBACK_RECAPTCHA_BASE_URL, false);
          return;
        }
        setLoadStatus("error");
      };

      script.addEventListener("load", markReady);
      script.addEventListener("error", handleScriptError);
      document.body.appendChild(script);

      loadTimer = window.setTimeout(() => {
        if (cancelled || ready) {
          return;
        }

        if (canFallback && baseUrl !== FALLBACK_RECAPTCHA_BASE_URL) {
          loadScript(FALLBACK_RECAPTCHA_BASE_URL, false);
          return;
        }

        setLoadStatus("error");
      }, RECAPTCHA_LOAD_TIMEOUT);
    };

    // Nếu script đã load rồi thì dùng luôn, không load lại
    if (window.grecaptcha && hasExpectedScript()) {
      markReady();
    } else {
      loadScript(recaptchaBaseUrl, true);
    }

    // Cleanup khi component unmount
    return () => {
      cancelled = true;
      if (loadTimer) {
        window.clearTimeout(loadTimer);
      }
      onExecutorChange(null);
    };
  }, [onExecutorChange, recaptchaBaseUrl, siteKey]);

  // ─── UI ──────────────────────────────────────────────────────────────────
  if (!siteKey) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Chưa cấu hình Site Key reCAPTCHA"
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <div className="mt-[-30px]!">
      {loadStatus === "loading" && (
        <Spin size="small" tip="Đang tải xác thực bảo mật..." />
      )}

      {loadStatus === "ready" && (
        <Alert
          className="recaptcha-alert"
          type="info"
          showIcon
          message="reCAPTCHA đã sẵn sàng"
          description={
            <>
              <div>Hệ thống sẽ tự xác thực khi bạn gửi biểu mẫu.</div>
              <div>
                Trang này được bảo vệ bởi reCAPTCHA và{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: 700, textDecoration: "underline", color: "#1d1d1d" }}
                >
                  Chính sách quyền riêng tư
                </a>
                ,{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontWeight: 700, textDecoration: "underline", color: "#1d1d1d" }}
                >
                  Điều khoản dịch vụ
                </a>
                {" "}của Google được áp dụng.
              </div>
            </>
          }
        />
      )}

      {loadStatus === "error" && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải xác thực bảo mật. Vui lòng kiểm tra kết nối mạng và thử lại."
        />
      )}
    </div>
  );
};

export default RecaptchaSection;
