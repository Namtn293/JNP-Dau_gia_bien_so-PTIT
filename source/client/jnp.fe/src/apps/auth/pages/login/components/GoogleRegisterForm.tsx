import React, { useEffect } from "react";
import { Form, Input, Button, DatePicker, Tag } from "antd";
import {
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import IconGoogle from "@assets/icons/IconGoogle";
import {
  LoginHeader,
  GoogleAccountCard,
} from "./styled";
import type { GoogleProfile, GoogleRegistrationFormValues } from "../services/type";

interface GoogleRegisterFormProps {
  googleProfile: GoogleProfile | null;
  isLoading: boolean;
  onSubmit: (values: GoogleRegistrationFormValues) => void;
  onCancel: () => void;
}

export const GoogleRegisterForm: React.FC<GoogleRegisterFormProps> = ({
  googleProfile,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<GoogleRegistrationFormValues>();

  useEffect(() => {
    if (googleProfile) {
      form.setFieldsValue({
        fullName: googleProfile.fullName,
        email: googleProfile.email,
        phoneNumber: "",
        address: "",
      });
    }
  }, [googleProfile, form]);

  return (
    <div>
      <LoginHeader>
        <h1>Hoàn Tất Đăng Ký</h1>
      </LoginHeader>

      {googleProfile && (
        <GoogleAccountCard>
          <div className="google-avatar">
            <IconGoogle size={20} />
          </div>
          <div className="google-details">
            <div className="name">{googleProfile.fullName}</div>
            <div className="meta">
              <span>{googleProfile.email}</span>
              <Tag color="success" style={{ margin: 0, padding: "0 6px", fontSize: 11, borderRadius: 4 }}>
                <CheckCircleFilled style={{ marginRight: 3 }} /> Xác thực Google
              </Tag>
            </div>
          </div>
        </GoogleAccountCard>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={true}
        size="large"
      >
        {/* 1. Họ và tên */}
        <Form.Item
          name="fullName"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Họ và tên</span>}
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên!" },
            { min: 2, message: "Họ và tên tối thiểu 2 ký tự!" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Nhập họ và tên đầy đủ"
            style={{ borderRadius: 12, height: 48 }}
          />
        </Form.Item>

        {/* 2. Email (Disable - không cho chỉnh sửa) */}
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Email</span>}
          extra={
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Email được lấy tự động từ tài khoản Google và không thể thay đổi.
            </span>
          }
        >
          <Input
            prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
            disabled={true}
            style={{
              borderRadius: 12,
              height: 48,
              backgroundColor: "#f1f5f9",
              color: "#334155",
              fontWeight: 600,
              cursor: "not-allowed",
            }}
          />
        </Form.Item>

        {/* 3. Ngày sinh */}
        <Form.Item
          name="dob"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Ngày sinh</span>}
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="Chọn ngày / tháng / năm sinh"
            disabledDate={(current) => current && current.isAfter(dayjs().endOf("day"))}
            prefix={<CalendarOutlined style={{ color: "#9ca3af", marginRight: 8 }} />}
            style={{ width: "100%", borderRadius: 12, height: 48 }}
          />
        </Form.Item>

        {/* 4. Số điện thoại */}
        <Form.Item
          name="phoneNumber"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Số điện thoại</span>}
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
              message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)!",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined style={{ color: "#9ca3af" }} />}
            placeholder="Ví dụ: 0912345678"
            maxLength={10}
            style={{ borderRadius: 12, height: 48 }}
          />
        </Form.Item>

        {/* 5. Địa chỉ */}
        <Form.Item
          name="address"
          label={<span style={{ fontWeight: 600, color: "#2d3748" }}>Địa chỉ</span>}
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ!" },
            { min: 5, message: "Địa chỉ quá ngắn, vui lòng nhập chi tiết hơn!" },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Ví dụ: Số 123 đường Giải Phóng, Phường Đồng Tâm, Quận Hai Bà Trưng, Hà Nội"
            style={{ borderRadius: 12, padding: "10px 14px", resize: "none" }}
          />
        </Form.Item>

        {/* Nút hành động */}
        <Form.Item style={{ marginTop: 24, marginBottom: 8 }}>
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
            Hoàn tất đăng ký & Đăng nhập
          </Button>
        </Form.Item>

        <Button
          type="text"
          block
          onClick={onCancel}
          icon={<ArrowLeftOutlined />}
          style={{
            height: 40,
            color: "#586979",
            fontWeight: 600,
          }}
        >
          Quay lại đăng nhập
        </Button>
      </Form>
    </div>
  );
};

export default GoogleRegisterForm;
