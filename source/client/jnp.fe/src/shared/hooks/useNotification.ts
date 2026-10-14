import { App } from 'antd'
export const useNotification = () => {
  const { notification } = App.useApp();

  const showSuccessNotify = (msg: string, duration?: number) => {
    notification.success({ message: msg, duration });
  }
  const showErrorNotify = (msg: string, duration?: number) => {
    notification.error({ message: 'Thất bại!', description: msg, duration });
  };

  // Hiển thị thông báo cảnh báo
  const showWarningNotify = (msg: string, duration?: number) => {
    notification.warning({ message: 'Cảnh báo!', description: msg, duration });
  };

  // Hiển thị thông tin chung
  const showInfoNotify = (msg: string, duration?: number) => {
    notification.info({ message: 'Thông tin', description: msg, duration });
  };

  return {
    showSuccessNotify,
    showErrorNotify,
    showWarningNotify,
    showInfoNotify
  };
};

export default useNotification;