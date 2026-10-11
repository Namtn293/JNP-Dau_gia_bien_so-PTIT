import { Form } from "antd";
import styled from "styled-components";

export const StyledForm = styled(Form)`
  /* Sắp xếp form theo cột để tạo khoảng cách đồng đều */
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
`;
export const AuthWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  /* Background với ảnh watercolor */
  background-color: #fbf5ef;
  background-image: url("/login-bg.png");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  /* Flexbox layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// 6. Container cho nội dung chính (Layer 1 - Nằm trên)
export const ContentOverlay = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Vùng chứa nội dung chính (form đăng nhập)
export const StyledContentArea = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.5rem;
`;

// Nền tổng thể chuyển sắc theo màu thương hiệu mới #6098c7 và #ffffff để làm giao diện sáng sủa hơn
export const Wrapper = styled.div`
  min-height: calc(100vh / var(--zoom, 1));
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    var(--design-primary) 0%,
    var(--design-primary-bg) 100%
  );

  /* Đảm bảo màu chữ mặc định dễ đọc trên nền sáng */
  color: #fff;

  /* Thêm một lớp phủ nhẹ để tăng chiều sâu nếu cần */
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 20% 30%,
      rgba(242, 166, 13, 0.05) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

// Thanh header chứa logo và ngôn ngữ ở phía trên cùng
export const HeaderBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem clamp(1.6rem, 4vw, 6rem) 1.2rem;
  font-size: 1.4rem;
  color: var(--design-primary-title);

  @media (max-height: 800px) {
    padding: 1.2rem clamp(1.6rem, 4vw, 6rem) 0.6rem;
  }
  @media (max-height: 650px) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 1.2rem clamp(1.6rem, 4vw, 6rem) 0;
    pointer-events: none;
    z-index: 20;
    & * {
      pointer-events: auto;
    }
  }
`;

// Khối logo và mô tả hệ thống ở góc trái
export const HeaderBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.4;
    color: var(--design-primary);

    /* Improve clarity on zoom */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    transform: translateZ(0);
  }

  span {
    font-size: clamp(1.2rem, 3vw, 1.4rem);
    color: var(--design-primary-subtitle);
    line-height: 1.4;

    /* Improve clarity on zoom */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    transform: translateZ(0);
  }
`;

// Vùng chọn ngôn ngữ đơn giản ở góc phải
export const LanguageSelect = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--design-primary-border);
  font-weight: 500;
`;

// Vùng chứa card đăng nhập đặt ở chính giữa màn hình
export const ContentArea = styled.section`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.6rem;
`;

// Card đăng nhập nổi bật với bóng đổ nhẹ và glassmorphism
export const AuthCard = styled.div`
  width: min(46rem, 100%);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 2rem;
  box-shadow: 0 24px 48px -12px rgba(37, 107, 140, 0.18), 0 0 0 1px rgba(156, 202, 222, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;

  @media (max-height: 800px) {
    padding: 24px;
    gap: 1.2rem;
    border-radius: 1.2rem;
  }
  @media (max-height: 650px) {
    padding: 20px 24px;
    gap: 0.8rem;
  }
  @media (max-height: 580px) {
    padding: 14px 20px;
    gap: 0.6rem;
  }
`;

export const RegisterCard = styled.div`
  background: #ffffff;
  border-radius: 1.6rem;
  box-shadow: 0 28px 42px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);

  padding: clamp(2.4rem, 4vw, 4rem);
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
`;

// Phần tiêu đề của card nhấn mạnh yêu cầu đăng nhập
export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  strong {
    font-size: 1.2rem;
    color: #5b5b5b;
    text-transform: uppercase;
  }

  h3 {
    margin: 0;
    font-size: clamp(2.2rem, 3vw, 2.8rem);
    font-weight: 700;
    color: var(--design-primary);
  }

  p {
    margin: 0;
    font-size: 1.28rem;
    color: #6c6c6c;
    line-height: 1.5;
  }

  @media (max-height: 750px) {
    gap: 0.3rem;
    strong {
      font-size: 1.1rem;
    }
    h3 {
      font-size: 2.2rem;
    }
    p {
      font-size: 1.2rem;
    }
  }

  @media (max-height: 650px) {
    strong {
      display: none;
    }
    p {
      display: none;
    }
    h3 {
      font-size: 1.8rem;
      margin-top: 0;
    }
  }
`;

// Phần thân card bao bọc form để giữ khoảng cách đều
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  // gap: 1.6rem;

  .ant-input,
  .ant-input-affix-wrapper {
    padding: 0.9rem 1.2rem;
    border-radius: 0.6rem;
    width: 100%;
    height: 48px;
    &::placeholder,
    input::placeholder {
      font-size: 15px !important;
      color: #6c6c6c !important;
    }
  }
  .ant-input-affix-wrapper .ant-input {
    height: auto !important;
  }
  .ant-btn-primary {
    font-weight: 600;
  }
  /* Giữ khoảng cách thống nhất giữa các Form.Item */
  .ant-form-item {
    margin-bottom: 10px !important;
  }

  /* Tăng tính dễ đọc cho thông báo lỗi */
  .ant-form-item-explain-error {
    margin-top: 0.6rem;
    font-size: 1.2rem;
  }

  .ant-form-item-label {
    padding-bottom: 5px !important;

    label {
      font-weight: 500;
      font-size: 16px;
      color: var(--design-primary) !important ;
      height: auto !important;
    }
  }
  .ant-form-item .ant-form-item-label > label::after {
    margin-inline-end: 0rem;
  }

  .recaptcha-alert {
    background-color: #e6f4ff !important;
    border: 1px solid #91caff !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.05);
    transition: all 0.3s ease;

    &:hover {
      background-color: #f0f5ff !important;
      border-color: #69b1ff !important;
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.08);
    }

    .ant-alert-icon {
      color: #1677ff !important;
      font-size: 15px !important;
      margin-top: 2px !important;
    }

    .ant-alert-message {
      color: #1f1f1f !important;
      font-weight: 600 !important;
      font-size: 13.5px !important;
    }

    .ant-alert-description {
      color: #595959 !important;
      font-size: 11.5px !important;
      line-height: 1.55 !important;
      margin-top: 2px !important;

      div {
        margin-bottom: 2px;
        &:last-child {
          margin-bottom: 0;
        }
      }

      a {
        color: #0958d9 !important;
        font-weight: 600 !important;
        text-decoration: none !important;
        border-bottom: 1px dashed #0958d9;
        transition: all 0.2s ease;
        padding: 0 1px;

        &:hover {
          color: #002c8c !important;
          border-bottom-style: solid;
          background-color: rgba(22, 119, 255, 0.08);
          border-radius: 2px;
        }
      }
    }
  }

  @media (max-height: 800px) {
    .ant-input,
    .ant-input-affix-wrapper {
      height: 42px;
      padding: 0.6rem 1rem;
    }
    .ant-form-item-label label {
      font-size: 14px;
    }
    .ant-alert {
      padding: 8px 12px !important;
    }
    .ant-alert-message {
      font-size: 13px !important;
    }
    .ant-alert-description {
      font-size: 11px !important;
      line-height: 1.3 !important;
      margin-top: 2px !important;
      display: block !important;
    }
  }

  @media (max-height: 650px) {
    .ant-input,
    .ant-input-affix-wrapper {
      height: 38px;
      padding: 0.4rem 0.8rem;
    }
    .ant-form-item-label {
      padding-bottom: 2px !important;
      label {
        font-size: 13px;
      }
    }
    .ant-form-item {
      margin-bottom: 6px !important;
    }
    .ant-alert {
      padding: 6px 10px !important;
      margin-bottom: 8px !important;
    }
    .ant-alert-description {
      font-size: 10.5px !important;
      line-height: 1.25 !important;
    }
  }
`;

// Đường phân cách "Hoặc" giữa các lựa chọn
export const DividerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: #aaaaaa;
  font-size: 1.2rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #dadada;
  }
`;

// Liên kết phụ ở cuối card để dẫn đến trang đăng ký
export const AuxiliaryLink = styled.a`
  align-self: left;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--primary);

  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
`;

// Chú thích nhỏ ở đáy màn hình để tăng độ tin cậy
export const FooterNote = styled.footer`
  text-align: center;
  padding: 1.6rem;
  font-size: 1.4rem;
  color: #fff;
`;
export const FormActions = styled.div`
  /* Gom nhóm hành động để giữ layout cân bằng */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.2rem;
  margin-top: 0.4rem;

  & > * {
    width: 100%;
  }

  @media (max-height: 800px) {
    gap: 0.8rem;
  }
  @media (max-height: 650px) {
    gap: 0.6rem;
    margin-top: 0;
  }
`;

export const MobileBlockWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: var(--design-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.2rem;
  text-align: center;
  color: #ffffff;
  background-image:
    linear-gradient(
      135deg,
      rgba(122, 31, 54, 0.95) 0%,
      rgba(138, 25, 29, 0.98) 100%
    ),
    url("/trongdong.png");
  background-size: cover;
  background-position: center;

  .icon-box {
    width: 8rem;
    height: 8rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2.4rem;
    border: 1px solid rgba(255, 255, 255, 0.2);

    svg {
      font-size: 4rem;
      color: var(--design-primary-gold);
    }
  }

  h2 {
    font-size: 2.4rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    color: #ffffff;
    text-transform: uppercase;
  }

  p {
    font-size: 1.6rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    max-width: 32rem;
    margin-bottom: 3.2rem;
  }

  .divider {
    width: 4rem;
    height: 0.2rem;
    background: var(--design-primary-gold);
    margin: 2.4rem 0;
  }
`;
