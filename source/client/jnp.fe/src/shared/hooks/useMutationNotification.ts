import { App, Button } from "antd";
import React from "react";
import useNotification from "~/shared/hooks/useNotification";
import useServerErrorMsg from "~/shared/hooks/useServerErrorMsg";
import type { IResponse } from "~/shared/types/response.type";

type MutationResponse<TData = unknown> = Partial<
  Omit<IResponse<TData>, "message" | "messages">
> & {
  message?: string | null;
  messages?: string[] | null;
};

type MutationResultOptions<TResponse extends MutationResponse> = {
  successMessage?: string;
  fallbackErrorMessage?: string;
  onSuccess?: (res: TResponse) => void;
  onFinally?: (res: TResponse) => void;
};

type MutationNotificationOptions = {
  fallbackErrorMessage: string;
};

// Hook dung chung cho cac mutation POST/PUT/DELETE:
// - Chuan hoa response loi nghiep vu tu BE.
// - Dich ma loi bang ERROR_CODE_MSG.
// - Giu callback onSuccess/onError/onFinally tai man hinh nghiep vu.
export const useMutationNotification = () => {
  const { notification } = App.useApp();
  const { showSuccessNotify } = useNotification();
  const { ERROR_CODE_MSG } = useServerErrorMsg();
  const errorMessages = ERROR_CODE_MSG as Record<string, string>;
  const errorNotificationKeysRef = React.useRef<string[]>([]);
  const closeAllNotificationKey = "mutation-error-close-all";

  const clearMutationErrorNotifications = () => {
    errorNotificationKeysRef.current.forEach((key) =>
      notification.destroy(key),
    );
    errorNotificationKeysRef.current = [];
    notification.destroy(closeAllNotificationKey);
  };

  const getErrorMessages = (
    res: MutationResponse,
    { fallbackErrorMessage }: MutationNotificationOptions,
  ) => {
    const hasMessages = Array.isArray(res.messages) && res.messages.length > 0;
    const rawMessages = hasMessages
      ? (res.messages ?? [])
      : res.message
        ? [res.message]
        : [fallbackErrorMessage];

    return rawMessages
      .map((message) => {
        const trimmedMessage = typeof message === 'string' ? message.trim() : message;
        if (typeof trimmedMessage === 'string' && trimmedMessage.includes(':')) {
          const idx = trimmedMessage.indexOf(':');
          const errCode = trimmedMessage.substring(0, idx).trim();
          const details = trimmedMessage.substring(idx + 1).trim();
          if (errorMessages[errCode]) {
            return `${errorMessages[errCode]}: ${details}`;
          }
        }
        return errorMessages[trimmedMessage as string] ?? message;
      })
      .filter(Boolean);
  };

  const showMutationErrorNotify = (
    res: MutationResponse,
    fallbackErrorMessage: string,
  ) => {
    const messages = getErrorMessages(res, { fallbackErrorMessage });

    const shouldShowCloseAll = messages.length > 1;

    clearMutationErrorNotifications();

    const errorKeys = messages.map(
      (_, index) => `mutation-error-${Date.now()}-${index}`,
    );
    errorNotificationKeysRef.current = errorKeys;
    if (shouldShowCloseAll) {
      notification.open({
        key: closeAllNotificationKey,
        className: "close-all-notification",
        message: null,
        description: React.createElement(
          Button,
          {
            type: "text",
            block: true,
            onClick: clearMutationErrorNotifications,
            style: {
              color: "var(--design-primary)",
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
    }
    messages.forEach((msg, index) => {
      const notificationKey = errorKeys[index];
      notification.error({
        key: notificationKey,
        message: "Thất bại!",
        description: msg,
        duration: 0,

        onClose: () => {
          errorNotificationKeysRef.current =
            errorNotificationKeysRef.current.filter(
              (key) => key !== notificationKey,
            );

          if (errorNotificationKeysRef.current.length === 0) {
            notification.destroy(closeAllNotificationKey);
          }
        },
      });
    });
  };

  const handleMutationResult = <TResponse extends MutationResponse>(
    res: TResponse,
    options: MutationResultOptions<TResponse> = {},
  ) => {
    const {
      successMessage,
      fallbackErrorMessage = "Có lỗi xảy ra",
      onSuccess,
      onFinally,
    } = options;

    try {
      if (res?.success) {
        if (successMessage) {
          showSuccessNotify(successMessage);
        }

        onSuccess?.(res);
        return true;
      }

      showMutationErrorNotify(res ?? {}, fallbackErrorMessage);

      return false;
    } finally {
      onFinally?.(res);
    }
  };

  return {
    handleMutationResult,
  };
};
