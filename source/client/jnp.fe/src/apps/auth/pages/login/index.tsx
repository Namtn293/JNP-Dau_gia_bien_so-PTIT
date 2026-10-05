import React from "react";
import { Form, Input, Button, Divider } from "antd";
import { MailOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";

// Components & styled from ./components
import { LoginContainer, LoginHeader, GoogleButton } from "./components/styled";

// Hooks & types
import { useLogin } from "./hooks/useLogin";
import type { LoginCredentials } from "./services/type";

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginCredentials>();
  const { isLoading, handleEmailLogin, handleGoogleLogin } = useLogin();

  return (
    <LoginContainer>
      <LoginHeader>
        <h1>Đăng Nhập</h1>
        <p>Hệ thống Đấu giá Biển số Xe Trực tuyến</p>
      </LoginHeader>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleEmailLogin}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Tài khoản / Email</span>}
          rules={[
            { required: true, message: "Vui lòng nhập tài khoản hoặc email!" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Nhập tài khoản (ví dụ: admin)"
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

      <GoogleButton type="button" onClick={handleGoogleLogin}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
          />
        </svg>
        Đăng nhập với Google
      </GoogleButton>
    </LoginContainer>
  );
};

export default LoginPage;
