import React from "react";
import { Form, Input, Button, Divider } from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

// Components & styled from ./components
import {
  LoginContainer,
  LoginHeader,
  GoogleButton,
} from "./components/styled";
import { GoogleRegisterForm } from "./components/GoogleRegisterForm";
import IconGoogle from "@assets/icons/IconGoogle";

// Hooks & types
import { useLogin } from "./hooks/useLogin";
import type { LoginCredentials } from "./services/type";

export const LoginPage: React.FC = () => {
  const [loginForm] = Form.useForm<LoginCredentials>();

  const {
    isLoading,
    isGoogleRegistering,
    googleProfile,
    handleEmailLogin,
    handleOpenGoogleLogin,
    handleCompleteGoogleRegistration,
    handleCancelGoogleRegistration,
  } = useLogin();

  return (
    <>
      <LoginContainer $isRegistering={isGoogleRegistering}>
        {isGoogleRegistering ? (
          <GoogleRegisterForm
            googleProfile={googleProfile}
            isLoading={isLoading}
            onSubmit={handleCompleteGoogleRegistration}
            onCancel={handleCancelGoogleRegistration}
          />
        ) : (
          <div>
            <LoginHeader>
              <h1>Đăng Nhập</h1>
              <p>Hệ thống Đấu giá Biển số Xe Trực tuyến</p>
            </LoginHeader>

            <Form
              form={loginForm}
              layout="vertical"
              onFinish={handleEmailLogin}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600, color: "#2d3748" }}> Email</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tài khoản email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Nhập tài khoản email"
                  style={{ borderRadius: 12, height: 48 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Mật khẩu</span>}
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="••••••••"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone twoToneColor="#256b8c" /> : <EyeInvisibleOutlined />
                  }
                  style={{ borderRadius: 12, height: 48 }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    background: "linear-gradient(135deg, #9ccade 0%, #256b8c 100%)",
                    border: 0,
                    boxShadow: "0 6px 18px rgba(37, 107, 140, 0.3)",
                  }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "20px 0", color: "#8c9ba5", fontSize: 13 }}>
              hoặc
            </Divider>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <GoogleButton
                type="button"
                onClick={handleOpenGoogleLogin}
              >
                <IconGoogle size={18} />
                Đăng nhập với Google
              </GoogleButton>

              {/* Nút đăng nhập Google Identity Services ẩn/hỗ trợ chuẩn từ Google SDK */}
              <div id="google-signin-btn-container" style={{ display: "none" }} />
            </div>
          </div>
        )}
      </LoginContainer>
    </>
  );
};

export default LoginPage;



