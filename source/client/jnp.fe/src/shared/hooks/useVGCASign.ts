import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

// Type declaration cho VGCA
declare global {
  interface Window {
    vgca_sign_issued?: (params: string, callback: (response: string) => void) => void;
    vgca_sign_approved?: (params: string, callback: (response: string) => void) => void;
    vgca_sign_income?: (params: string, callback: (response: string) => void) => void;
    vgca_comment?: (params: string, callback: (response: string) => void) => void;
    vgca_sign_appendix?: (params: string, callback: (response: string) => void) => void;
    vgca_sign_copy?: (params: string, callback: (response: string) => void) => void;
    vgca_sign_files?: (params: string, callback: (response: string) => void) => void;
  }
}

// Các loại ký số VGCA
export const SignType = {
  ISSUED: 'ISSUED',           // Đóng dấu phát hành
  APPROVED: 'APPROVED',       // Ký phê duyệt
  INCOME: 'INCOME',           // Ký công văn đến
  COMMENT: 'COMMENT',         // Thêm ý kiến
  APPENDIX: 'APPENDIX',       // Ký phụ lục/đính kèm
  COPY: 'COPY',               // Ký bản sao điện tử
  FILES: 'FILES',             // Ký danh sách file
  ISSUED_MA_DU_AN: 'ISSUED_MA_DU_AN', // Đóng dấu phát hành theo mã dự án (DocNumber = mã dự án, kèm IssuedDate)
  MOCK: 'MOCK'                // Mock để test (không gọi VGCA)
} as const;

export type SignType = typeof SignType[keyof typeof SignType];

export interface VGCASignParams {
  fileUrl: string;
  docNumber?: string;
  sessionId?: string;
  jwtToken?: string;
  fileUploadHandler?: string;
  signType?: SignType;         // Loại ký số
  metaData?: Array<{ Key: string, Value: string }>;  // Metadata cho comment/appendix
  issuedDate?: string;         // Ngày cấp/phát hành (dùng cho ISSUED_MA_DU_AN)
}

export interface VGCASignResponse {
  Status: number;
  Message?: string;
  FileServer?: string;
  [key: string]: any;
}

export interface UseVGCASignOptions {
  onSuccess?: (signedFileUrl: string, originalFileUrl: string) => void;
  onError?: (error: string) => void;
  // Phiên ký quá hạn: WebSocket đã bị đóng nên callback từ VGCA sẽ không bao giờ về nữa.
  // Consumer nên dọn UI đang chờ ký (đóng popup...) thay vì để user kẹt ở màn hình chết.
  onTimeout?: () => void;
  autoAddMinioPrefix?: boolean;
  minioBaseUrl?: string;
}

// Thời gian tối đa cho một phiên ký số trước khi hủy. Phải đủ dài để user chọn chứng thư,
// nhập PIN và đặt vị trí dấu trong phần mềm VGCA: WebSocket bị đóng sớm sẽ làm mất
// callback khi user bấm "Hoàn thành" (popup không đóng, không có thông báo).
const VGCA_SIGN_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Custom hook để xử lý ký số VGCA
 * @param options - Các tùy chọn cho hook
 * @returns signing state và hàm handleSign
 */
export const useVGCASign = (options: UseVGCASignOptions = {}) => {
  const {
    onSuccess,
    onError,
    onTimeout,
    autoAddMinioPrefix = true,
    minioBaseUrl = `${import.meta.env.VITE_RESOURCE_URL}`
  } = options;

  const { showSuccessNotify, showErrorNotify, showWarningNotify, showInfoNotify } = useNotification();
  const [signing, setSigning] = useState<string | null>(null);

  /**
   * Thêm prefix Minio vào URL nếu cần
   */
  const buildFullUrl = useCallback((url: string): string => {
    if (!autoAddMinioPrefix) return url;
    if (url.startsWith('blob:')) return url; // Không thêm prefix cho blob URL (file local vừa chọn)

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const fullUrl = `${minioBaseUrl}${url.startsWith('/') ? url.slice(1) : url}`;
    console.log('[VGCA] Added Minio prefix. Full URL:', fullUrl);
    return fullUrl;
  }, [autoAddMinioPrefix, minioBaseUrl]);

  /**
   * Xử lý callback từ VGCA
   */
  const handleSignCallback = useCallback((
    originalFileUrl: string,
    responseString: string
  ) => {
    console.log('[VGCA] Received callback response:', responseString);

    try {
      const response: VGCASignResponse = JSON.parse(responseString);
      console.log('[VGCA] Parsed response:', response);

      if (response.Status === 0) {
        console.log('[VGCA] Sign successful, new file URL:', response.FileServer);
        showSuccessNotify('Ký số thành công!');

        if (onSuccess && response.FileServer) {
          onSuccess(response.FileServer, originalFileUrl);
        }
      } else {
        const errorMsg = response.Message || 'Ký số thất bại';
        console.error('[VGCA] Sign failed with status:', response.Status, errorMsg);
        showErrorNotify(errorMsg);

        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = 'Lỗi xử lý response từ VGCA';
      showErrorNotify(errorMsg);
      console.error('[VGCA] Error parsing response:', error);

      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setSigning(null);
    }
  }, [onSuccess, onError, showSuccessNotify, showErrorNotify]);

  /**
   * Mock signing để test (không cần USB)
   */
  const mockSign = useCallback(async (fileUrl: string, signType: SignType) => {
    console.log('[VGCA MOCK] Simulating signing...', signType);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Sử dụng file gốc mà không thêm đuôi _signed
    const signedUrl = fileUrl;

    const mockResponse: VGCASignResponse = {
      Status: 0,
      FileServer: signedUrl,
      Message: 'Mock signing successful'
    };

    console.log('[VGCA MOCK] Mock response:', mockResponse);
    handleSignCallback(fileUrl, JSON.stringify(mockResponse));
  }, [handleSignCallback, showInfoNotify]);

  /**
   * Hàm ký số file
   */
  const handleSign = useCallback(async (params: VGCASignParams, signId?: string) => {
    const { fileUrl, docNumber, sessionId = '', jwtToken, signType = SignType.ISSUED, metaData, issuedDate } = params;

    console.log('[VGCA] handleSign called');
    console.log('[VGCA] Original file URL:', fileUrl);
    console.log('[VGCA] Sign type:', signType);

    if (!fileUrl) {
      showErrorNotify('Vui lòng tải file lên trước khi ký số');
      console.error('[VGCA] No fileUrl provided');
      return;
    }

    // Mock mode
    if (signType === SignType.MOCK) {
      if (signId) setSigning(signId);
      await mockSign(fileUrl, signType);
      return;
    }

    // Map signType to VGCA function
    const vgcaFunctions = {
      [SignType.ISSUED]: window.vgca_sign_issued,
      [SignType.APPROVED]: window.vgca_sign_approved,
      [SignType.INCOME]: window.vgca_sign_income,
      [SignType.COMMENT]: window.vgca_comment,
      [SignType.APPENDIX]: window.vgca_sign_appendix,
      [SignType.COPY]: window.vgca_sign_copy,
      [SignType.FILES]: window.vgca_sign_files,
      // Đóng dấu phát hành theo mã dự án dùng chung hàm ký phát hành của VGCA
      [SignType.ISSUED_MA_DU_AN]: window.vgca_sign_issued,
    };

    const vgcaFunction = vgcaFunctions[signType];

    // Kiểm tra VGCA plugin
    console.log('[VGCA] Checking VGCA function:', signType, vgcaFunction);

    if (!vgcaFunction) {
      showWarningNotify('Plugin VGCA chưa được tải. Vui lòng:\n1. Cài đặt phần mềm VGCA\n2. Copy vgcaplugin.js vào thư mục public\n3. Tải lại trang');
      console.error('[VGCA] VGCA function not available:', signType);
      return;
    }

    if (signId) {
      setSigning(signId);
    }

    // Build full URL với Minio prefix (nếu không phải blob URL)
    const fullUrl = buildFullUrl(fileUrl);

    const vgcaParams: any = {
      FileUploadHandler: params.fileUploadHandler,
      FileName: fullUrl,
      //FileName: "",
      SessionId: sessionId,
      JWTToken: jwtToken || localStorage.getItem('token') || ''
    };

    // Thêm params tùy theo loại ký
    if (signType === SignType.ISSUED || signType === SignType.APPROVED) {
      vgcaParams.DocNumber = docNumber || '';
    }

    // Đóng dấu phát hành theo mã dự án: DocNumber = mã dự án, kèm ngày cấp
    if (signType === SignType.ISSUED_MA_DU_AN) {
      vgcaParams.DocNumber = docNumber || '';
      vgcaParams.IssuedDate = issuedDate || '';
    }

    if (signType === SignType.COMMENT || signType === SignType.APPENDIX || signType === SignType.COPY) {
      vgcaParams.MetaData = metaData || [];
      if (signType !== SignType.COMMENT) {
        vgcaParams.DocNumber = docNumber || '';
      }
    }

    // Khởi tạo các biến để theo dõi trạng thái kết nối WebSocket của VGCA
    let createdWs: WebSocket | null = null;
    let hasOpened = false;
    let isSuccess = false;
    let safetyTimeout: any = null;

    // Lưu lại hàm khởi tạo WebSocket gốc của trình duyệt
    const OriginalWebSocket = window.WebSocket;

    // Ghi đè tạm thời WebSocket để bắt được instance được tạo bởi plugin VGCA
    window.WebSocket = function (url: string, protocols?: string | string[]) {
      const ws = new OriginalWebSocket(url, protocols);
      createdWs = ws;
      return ws;
    } as any;
    window.WebSocket.prototype = OriginalWebSocket.prototype;

    try {
      console.log('[VGCA] Calling VGCA function:', signType);
      console.log('[VGCA] Params:', vgcaParams);
      console.log('[VGCA] File URL to sign (full):', fullUrl);
      console.log('[VGCA] Starting VGCA plugin...');

      // Định nghĩa callback tùy biến để phát hiện ký số thành công
      const customCallback = (responseString: string) => {
        try {
          const response = JSON.parse(responseString);
          if (response && response.Status === 0) {
            isSuccess = true;
          }
        } catch (e) {
          console.error('[VGCA] Error parsing response in custom callback:', e);
        }
        handleSignCallback(fileUrl, responseString);
      };

      // Gọi VGCA function tương ứng với callback
      vgcaFunction(
        JSON.stringify(vgcaParams),
        customCallback
      );

      // Thiết lập timeout bảo vệ tối đa 5 phút nếu tiến trình bị treo ở CONNECTING hoặc treo phần mềm
      safetyTimeout = setTimeout(() => {
        if (!isSuccess) {
          console.log('[VGCA] Signing process timed out after 5 minutes.');
          setSigning(null);

          // Chỉ báo quá hạn khi đã kết nối được tới phần mềm ký số. Nếu chưa mở được
          // kết nối, 'close' listener bên dưới báo lỗi sát nguyên nhân hơn (phần mềm chưa chạy).
          if (hasOpened) {
            showErrorNotify('Phiên ký số đã quá hạn. Vui lòng thực hiện ký lại.');
          }

          // Đóng WebSocket nếu vẫn đang kết nối hoặc treo
          try {
            const activeWs: any = createdWs;
            if (activeWs && (activeWs.readyState === 0 || activeWs.readyState === 1)) {
              activeWs.close();
            }
          } catch (e) {
            console.error('[VGCA] Error closing WebSocket on timeout:', e);
          }

          onTimeout?.();
        }
      }, VGCA_SIGN_TIMEOUT_MS);

      console.log('[VGCA] vgca_sign_issued called successfully, waiting for user to sign...');
    } catch (error) {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
      showErrorNotify('Lỗi khi gọi VGCA');
      console.error('[VGCA] Error calling vgca_sign_issued:', error);
      setSigning(null);

      if (onError) {
        onError('Lỗi khi gọi VGCA');
      }
    } finally {
      window.WebSocket = OriginalWebSocket;
    }

    const activeWs: any = createdWs;
    if (activeWs) {
      activeWs.addEventListener('open', () => {
        hasOpened = true;
        console.log('[VGCA] WebSocket connection opened successfully.');
      });

      activeWs.addEventListener('close', () => {
        console.log('[VGCA] WebSocket connection closed. wasOpened:', hasOpened);

        // Xóa safety timeout nếu kết nối đóng bình thường trước 1 phút
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
        }

        setTimeout(() => {
          if (!isSuccess) {
            console.log('[VGCA] Connection closed without success. Resetting signing state.');
            setSigning(null);

            if (!hasOpened) {
              showErrorNotify('Không thể kết nối đến phần mềm ký số VGCA. Vui lòng đảm bảo phần mềm đang chạy.');
            }
          }
        }, 300);
      });

      activeWs.addEventListener('error', (err: any) => {
        console.error('[VGCA] WebSocket error event:', err);
      });
    }
  }, [buildFullUrl, handleSignCallback, onError, onTimeout, mockSign, showErrorNotify, showWarningNotify]);

  return {
    signing,
    handleSign,
    isPluginAvailable: typeof window !== 'undefined' && !!window.vgca_sign_issued,
    SignType  // Export SignType để component có thể sử dụng
  };
};
