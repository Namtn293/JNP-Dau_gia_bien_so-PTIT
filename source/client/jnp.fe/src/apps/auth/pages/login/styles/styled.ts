import { Link } from "@tanstack/react-router";
import { Button } from "antd";
import styled from "styled-components";

// Sử dụng biến CSS (CSS Variables) thay vì mã màu Hex cứng
// Đảm bảo bạn đã khai báo các biến này trong file global CSS hoặc :root
export const PALETTE = {
  primary: "var(--design-primary)",
  primarySub: "var(--design-primary-sub)",
  primaryGold: "var(--design-primary-gold)",
  primaryGoldBg: "var(--design-primary-gold-bg)",
  primaryText: "var(--design-primary-text)",
  primaryTitle: "var(--design-primary-title)",
  primarySubtitle: "var(--design-primary-subtitle)",
  primaryBgHighlight: "var(--design-primary-bg-highlight)",
  primaryBg: "var(--design-primary-bg)",
  primaryBgSub: "var(--design-primary-bg-sub)",
  primaryTextHighlight: "var(--design-primary-text-highlight)",
  primaryBorder: "var(--design-primary-border)",
  primaryBgHover: "var(--design-primary-bg-hover)",
};

export const FloatingField = styled.div`
  /* Bọc input để tạo nền trắng mờ và viền bo mềm mại */
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${PALETTE.primaryBorder};
  border-radius: 1.2rem;
  padding: 1.6rem 1.6rem 0.8rem;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;

  &[data-focused="true"],
  &:focus-within,
  &:hover {
    border-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }

  &[data-filled="true"] label,
  &[data-focused="true"] label,
  &:hover label {
    top: 0.6rem;
    font-size: 14px;
    color: ${PALETTE.primary};
  }

  label {
    position: absolute;
    left: 1.6rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.4rem;
    color: rgba(31, 45, 61, 0.72);
    transition: all 0.2s ease;
    cursor: text;
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-size: 1.4rem;
    color: #1f2d3d;
    padding: 0;
    outline: none;
  }

  .password-toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    margin-left: 0.4rem;
    cursor: pointer;
    color: rgba(31, 45, 61, 0.45);
    transition: color 0.2s ease;
    font-size: 1.6rem;

    &:hover {
      color: #276aa6;
    }
  }

  input::placeholder {
    color: transparent;
  }

  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px transparent inset;
    -webkit-text-fill-color: #1f2d3d;
  }
`;

export const ForgotPasswordLink = styled(Link)`
  /* Căn giữa và nhấn mạnh liên kết quên mật khẩu */
  align-self: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${PALETTE.primaryTextHighlight};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${PALETTE.primary};
    text-decoration: underline;
  }
`;

// Override Button của Ant Design để theo màu Design System
export const StyledSubmitButton = styled(Button)`
  &.ant-btn-primary {
    background-color: ${PALETTE.primary};
    border-color: ${PALETTE.primary};
    /* Shadow mờ đậm hơn cho nút */
    box-shadow: 0 4px 14px
      color-mix(in srgb, var(--design-primary), transparent 60%);
    font-weight: 600;
    height: 48px; /* Tăng chiều cao cho nút bấm sang trọng hơn */
    font-size: 1.6rem;

    @media (max-height: 800px) {
      height: 42px;
      font-size: 1.4rem;
    }
    @media (max-height: 650px) {
      height: 38px;
      font-size: 1.32rem;
    }
    
    &:hover,
    &:focus {
      background-color: ${PALETTE.primarySub} !important;
      border-color: ${PALETTE.primarySub} !important;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    /* Loading state */
    &.ant-btn-loading {
      opacity: 0.8;
    }
  }
`;
