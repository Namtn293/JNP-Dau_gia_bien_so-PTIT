import React, { useEffect } from "react";
import { Form, Input, DatePicker } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  
} from "@ant-design/icons";
import IconGoogle from "@assets/icons/IconGoogle";
import {
  CallbackCard,
  HeaderSection,
  GoogleAccountCard,
  PrimarySubmitButton,
  CancelButton,
} from "../style";
import type { GoogleRegisterFormValues } from "../services/type";

interface GoogleRegisterFormProps {
  email: string;
  fullName: string;
  isLoading: boolean;
  onSubmit: (values: GoogleRegisterFormValues) => void;
  onCancel: () => void;
}

export const GoogleRegisterForm: React.FC<GoogleRegisterFormProps> = ({
  email,
  fullName,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<GoogleRegisterFormValues>();

  useEffect(() => {
    form.setFieldsValue({
      fullName: fullName || "",
    });
  }, [fullName, form]);

  return (
    <CallbackCard>
      <HeaderSection>
        <h2>Hoàn Tất Hồ Sơ Định Danh</h2>
        <p>Bổ sung thông tin cá nhân để kích hoạt tài khoản đấu giá biển số xe</p>
      </HeaderSection>

      {/* Thông tin tài khoản Google đã liên kết */}
      <GoogleAccountCard>
        <div className="google-icon-wrapper">
          <IconGoogle size={20} />
        </div>
        <div className="user-info">
          <div className="user-name">{fullName || "Tài khoản Google"}</div>
          <div className="user-email">{email}</div>
        </div>
        <div className="badge-tag">
        </div>
      </GoogleAccountCard>

    

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="fullName"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Họ và tên <span style={{ color: "#ef4444" }}>*</span></span>}
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên của bạn!" },
            { min: 2, message: "Họ và tên tối thiểu 2 ký tự!" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Ví dụ: Nguyễn Văn A"
            style={{ borderRadius: 12, height: 46 }}
          />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Số điện thoại định danh <span style={{ color: "#ef4444" }}>*</span></span>}
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
              message: "Số điện thoại không hợp lệ (ví dụ: 0987654321)!",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Ví dụ: 0987654321"
            maxLength={11}
            style={{ borderRadius: 12, height: 46 }}
          />
        </Form.Item>

        <Form.Item
          name="dob"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Ngày sinh</span>}
        >
          <DatePicker
            placeholder="Chọn ngày sinh (DD/MM/YYYY)"
            format="DD/MM/YYYY"
            style={{ width: "100%", borderRadius: 12, height: 46 }}
          />
        </Form.Item>

        <Form.Item
          name="address"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Địa chỉ thường trú / liên hệ</span>}
        >
          <Input
            prefix={<HomeOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Ví dụ: Số 10 Nguyễn Trãi, Thanh Xuân, Hà Nội"
            style={{ borderRadius: 12, height: 46 }}
          />
        </Form.Item>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          <PrimarySubmitButton
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Hoàn tất hồ sơ & Vào sàn đấu giá
          </PrimarySubmitButton>

          <CancelButton
            type="default"
            onClick={onCancel}
            disabled={isLoading}
            block
          >
            Quay lại trang đăng nhập
          </CancelButton>
        </div>
      </Form>
    </CallbackCard>
  );
};

export default GoogleRegisterForm;
