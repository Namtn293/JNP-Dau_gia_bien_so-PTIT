import router from "@/Route";
import AppContextProvider from "@shared/context/AppContext";
import { RouterProvider } from "@tanstack/react-router";
import { getZoomRatio } from "@utils/getZoomRatio";
import { App as AntdApp, Button } from "antd";
import React, { useLayoutEffect } from "react";
import { NotificationStaticHolder } from "./apps/admin/components/common/CommonNotification";

// (VI) Patch App.useApp to show error notifications in Style 2 (multiple toast cards with "Đóng tất cả")
// khi phát hiện chuỗi thông báo lỗi có chứa dấu xuống dòng (\n) hoặc ký tự phân tách (|).
let errorNotificationKeys: string[] = [];
const closeAllNotificationKey = "global-mutation-error-close-all";

try {
  const originalUseApp = (AntdApp as any).useApp;
  if (originalUseApp && !(AntdApp as any).__patched) {
    (AntdApp as any).__patched = true;
    (AntdApp as any).useApp = () => {
      const hookVal = originalUseApp();
      const originalNotification = hookVal.notification;

      const clearErrorNotifications = () => {
        errorNotificationKeys.forEach((key) => originalNotification.destroy(key));
        errorNotificationKeys = [];
        originalNotification.destroy(closeAllNotificationKey);
      };

      const customNotification = {
        ...originalNotification,
        error: (config: any) => {
          const desc = config.description || config.message;

          if (typeof desc === 'string' && (desc.includes('\n') || desc.includes('|'))) {
            let lines = desc.split('\n');
            if (desc.includes('|') && lines.length === 1) {
              lines = desc.split('|');
            }

            const messages = lines
              .map((line: string) => {
                let cleaned = line.trim();
                if (cleaned.startsWith('-')) {
                  cleaned = cleaned.substring(1).trim();
                }
                return cleaned;
              })
              .filter(Boolean);

            if (messages.length > 1) {
              clearErrorNotifications();

              const errorKeys = messages.map(
                (_, index) => `global-mutation-error-${Date.now()}-${index}`,
              );
              errorNotificationKeys = errorKeys;

              originalNotification.open({
                key: closeAllNotificationKey,
                className: "close-all-notification",
                message: null,
                description: React.createElement(
                  Button,
                  {
                    type: "text",
                    block: true,
                    onClick: clearErrorNotifications,
                    style: {
                      color: "var(--design-primary, #7a1f36)",
                      fontSize: 16,
                      fontWeight: "bold",
                    },
                  },
                  "Đóng tất cả",
                ),
                closeIcon: null,
                duration: 0,
                style: {
                  padding: 5,
                },
              });

              messages.forEach((msg: string, index: number) => {
                const notificationKey = errorKeys[index];
                originalNotification.error({
                  ...config,
                  key: notificationKey,
                  message: config.message || "Thất bại!",
                  description: msg,
                  duration: 0,
                  onClose: () => {
                    if (config.onClose) config.onClose();
                    errorNotificationKeys = errorNotificationKeys.filter(
                      (key) => key !== notificationKey,
                    );

                    if (errorNotificationKeys.length === 0) {
                      originalNotification.destroy(closeAllNotificationKey);
                    }
                  },
                });
              });
              return;
            }
          }

          return originalNotification.error(config);
        }
      };

      return {
        ...hookVal,
        notification: customNotification,
      };
    };
  }
} catch (e) {
  console.warn("Failed to patch App.useApp", e);
}

function App() {
  //Auto zoom to fit the screen - chỉ áp dụng trên desktop lớn (1400px-1920px)
  // Tablet và laptop nhỏ (< 1400px) không dùng zoom để font-size giữ nguyên
  useLayoutEffect(() => {
    const viewportWidth =
      window.innerWidth || window.document.documentElement.clientWidth;
    const isMobile = viewportWidth < 768;

    if (!isMobile) {
      // getZoomRatio tự handle: screen width + OS scale (devicePixelRatio) compensation
      const zoom = getZoomRatio();
      document.documentElement.style.setProperty("--zoom", zoom.toString());
    } else {
      document.documentElement.style.setProperty("--zoom", "1");
    }
  }, []);

  return (
    <AppContextProvider>
       <NotificationStaticHolder />
      <RouterProvider router={router} />
    </AppContextProvider>
  );
}

export default App;
