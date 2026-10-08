import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { CallbackCard, LoadingSection } from "../style";

interface LoadingCallbackProps {
  message?: string;
  subMessage?: string;
}

export const LoadingCallback: React.FC<LoadingCallbackProps> = ({
  message = "Đang xác thực thông tin tài khoản Google...",
  subMessage = "Vui lòng đợi trong giây lát, hệ thống đang đồng bộ dữ liệu bảo mật.",
}) => {
  return (
    <CallbackCard>
      <LoadingSection>
        <div className="spinner-pulse">
          <LoadingOutlined />
        </div>
        <h3>{message}</h3>
        <p>{subMessage}</p>
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={() => window.close()}
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#64748b",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Đóng cửa sổ này
          </button>
        </div>
      </LoadingSection>
    </CallbackCard>
  );
};

export default LoadingCallback;
