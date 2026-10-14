import { Form, Modal, Tabs } from "antd";
import styled from "styled-components";

export const LayoutWrapper = styled.div`
  // min-height: 100vh;
  height: 100%;
  background-color: var(--bg-secondary);
  position: relative;
`;

export const ContentWrapper = styled.main<{ $sidebarCollapsed: boolean }>`
  margin-left: ${({ $sidebarCollapsed }) =>
    $sidebarCollapsed ? "6rem" : "var(--sidebar-width)"};
  padding: 0;
  padding-top: var(--header-admin-height);
  height: 100%;

  transition: left 0.2s ease;
  overflow-y: auto;

  background: #ffffff;
`;

export const StyledForm = styled(Form)`
  font-size: 14px;

  .ant-form-item {
    margin-bottom: 6px !important; /* (VI) Khoảng cách dọc giữa các trường trong modal form */
  }

  .ant-form-item-row {
    display: flex !important;
    align-items: flex-start !important;
  }

  .ant-form-item-label {
    padding: 0 !important;
    padding-top: 5px !important;
    margin: 0 !important;
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
    width: 180px;

    > label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      height: auto;
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      text-align: left;
      word-wrap: break-word;
      word-break: break-word;
      white-space: normal;
      line-height: 1.5;
      margin-right: 16px;
      margin-bottom: 0 !important;

      &.ant-form-item-required::before {
        display: inline-block !important;
        color: #ff4d4f !important;
        margin-right: 0 !important;
      }

      &.ant-form-item-required.ant-form-item-required-mark-hidden::before {
        display: none !important;
      }

      &.ant-form-item-required::after {
        display: inline-block !important;
        color: #ff4d4f !important;
        margin-left: 0 !important;
      }
    }
  }

  .ant-select.ant-select-in-form-item,
  .ant-input-number {
    max-width: 100%;
    width: 100%;
  }
  .ant-form-item-control {
    flex: 1;
  }

  .ant-input,
  .ant-input-number-input,
  .ant-select-selector,
  .ant-select .ant-select-selector,
  .ant-select-selection-item,
  .ant-select-selection-placeholder,
  .ant-input-textarea textarea,
  textarea.ant-input,
  .ant-input-number,
  .ant-table,
  .ant-table-cell,
  .ant-form-item-explain {
    font-size: 14px !important;
    border-radius: 4px !important;
  }

  .ant-input,
  .ant-select-selector,
  .ant-select .ant-select-selector,
  .ant-input-textarea textarea {
    width: 100%;
  }

  .ant-input:focus,
  .ant-select-selector:focus,
  .ant-input-textarea textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  /* (VI) Override height 3.5rem từ _input.scss cho wrapper chứa textarea.
     Khi TextArea có prop count/showCount, Ant Design bọc textarea trong .ant-input-affix-wrapper.
     Nếu không ghi đè, wrapper bị ép 3.5rem khiến textarea bẹp dẹt, không co giãn theo rows.
     margin-bottom: 22px chừa chỗ cho bộ đếm ký tự hiển thị phía dưới. */
  .ant-input-affix-wrapper:has(textarea) {
    height: auto !important;
    margin-bottom: 22px;
    overflow: visible !important;
  }

  &.ant-form-vertical,
  &.author-form {
    .ant-form-item {
      margin-bottom: 18px; /* Tăng khoảng cách dọc tránh bị đè bởi showCount */
    }

    .ant-form-item-row {
      flex-direction: column !important;
      align-items: stretch !important;
      width: 100% !important;
    }

    .ant-form-item-label {
      flex: none !important; /* Vô hiệu hóa flex-basis: 160px inline từ Antd để không bị gán chiều cao 160px */
      width: 100% !important;
      max-width: 100% !important;
      padding-bottom: 6px !important;
      padding-top: 0 !important;

      > label {
        margin-right: 0 !important;
        min-height: auto !important;
        font-size: 13px !important;
      }
    }

    .ant-form-item-control {
      flex: none !important; /* Reset flex-grow/shrink của Antd */
      width: 100% !important;
    }
  }
`;
export const StyledConfirmModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }

  .ant-modal-header {
    background-color: #f9fafb;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;

    .ant-modal-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
  }

  .ant-modal-close {
    top: 14px;
    right: 14px;
    color: #fff;
    .ant-modal-close-x {
      font-size: 16px;
      color: #fff;
      transition: color 0.2s;

      &:hover {
        color: #374151;
      }
    }
  }

  .ant-modal-body {
    padding: 24px;
    background: #ffffff;
    font-size: 15px;
    color: #374151;
    line-height: 1.6;
  }

  .ant-modal-footer {
    border-top: 1px solid #e5e7eb;
    padding: 12px 16px !important;
    background: #fff;
    text-align: right;
    border-radius: 4px;

    .ant-btn {
      min-width: 100px;
      height: 40px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;

      &:first-child {
        margin-right: 2px;
      }
    }

    .ant-btn-default {
      border-color: #d1d5db;
      color: #374151;

      &:hover {
        border-color: #9ca3af;
        color: #111827;
      }
    }

    .ant-btn-primary {
      background-color: var(--primary);
      border: none;

      &:hover {
        background-color: var(--btn-hover-primary);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(122, 31, 54, 0.3);
      }
    }

    .ant-btn-dangerous {
      background-color: #ef4444;
      border: none;
      color: #fff;

      &:hover {
        background-color: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }
    }
  }
`;

export const StyledModalDescription = styled(Modal)`
  .ant-modal-content {
    border-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }

  .ant-modal-header {
    background-color: var(--primary);
    padding: 12px 24px;

    .ant-modal-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--white);
      margin: 0;
    }
  }

  .ant-modal-close {
    top: 12px;
    right: 24px;
    color: var(--white);

    .ant-modal-close-x {
      font-size: 20px;
      color: var(--white);
      width: 32px;
      height: 32px;
      line-height: 32px;
      border-radius: 50%;
      &:hover {
        color: var(--white);
      }
    }
  }

  }
`;

export const StyledDescriptionWrapper = styled.div`
  /* FIX: Selector cho label trong Descriptions (Bắt buộc phải mạnh hơn) */
  .ant-descriptions-title, /* Tiêu đề chính (nếu có) */
  .ant-descriptions-item-label {
    font-weight: 700 !important; /* Dùng !important nếu cần ghi đè */
    color: #3b82f6 !important; /* MÀU XANH: Áp dụng màu xanh */
    background-color: #f7f9fc !important; /* Thêm màu nền nhạt để nổi bật label */

    // thành thêm
    white-space: nowrap !important; /* Không xuống dòng */
    overflow: hidden !important; /* Ẩn text vượt quá */
    text-overflow: ellipsis !important; /* Hiển thị dấu ... */
  }

  /* Selector này bắt label cho Descriptions có bordered */
  .ant-descriptions-bordered .ant-descriptions-item-label {
    font-weight: 700 !important;
    color: #3b82f6 !important;
    background-color: #f7f9fc !important;

    // thành thêm
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  /* Chỉnh màu cho Value trong Descriptions (giữ nguyên) */
  .ant-descriptions-item-content {
    color: #1f2937;
    /* Nếu value cũng không đổi màu, thêm !important vào đây: */
    /* color: #1f2937 !important; */
  }
`;

export const DetailContent = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 8px;
`;

export const DetailItem = styled.div<{ span?: number }>`
  grid-column: span ${({ span }) => span || 1};
  background: var(--white);
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

export const DetailLabel = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #000;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.div`
  font-size: 15px;
  color: #333;
  word-wrap: break-word;
  line-height: 1.6;

  /* Styling cho các trạng thái đặc biệt */
  .status-active {
    color: #52c41a;
    font-weight: 500;
  }

  .status-inactive {
    color: #ff4d4f;
    font-weight: 500;
  }

  .status-pending {
    color: #faad14;
    font-weight: 500;
  }
`;

export const MessageContent = styled.div`
  font-size: 15px;
  color: #374151;
  line-height: 1.6;

  strong {
    color: #111827;
    font-weight: 600;
  }
`;

export const StyledTabs = styled(Tabs)`
  &.ant-tabs {
    .ant-tabs-nav {
      margin-bottom: 20px;
      padding: 0 12px;
    }

    .ant-tabs-nav-wrap {
      border: none;
    }
    .ant-tabs-tab {
      font-size: 15px !important;
      padding: 10px 16px !important;
      margin: 0 !important;
      color: #555 !important;
    }

    .ant-tabs-tab-btn {
      font-size: 15px !important;
    }

    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
      font-weight: 600 !important;
      color: #1890ff !important;
    }

    .ant-tabs-ink-bar {
      height: 3px !important;
      background: #1890ff !important;
      border-radius: 999px;
    }
  }
`;

export const StyledFilterContent = styled.div`
  /* Match sample sizing: allow responsive width that fits popover padding */
  width: min(642px, calc(100vw - 48px));
  display: flex;
  flex-direction: column;
  max-height: 450px;
  font-family: Roboto, sans-serif;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
  background: #fff;
  border-radius: 6px;

  /* --- BODY --- */
  .filter-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    /* Grid 2 cột */
    .ant-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 8px;
      row-gap: 8px;
    }

    .ant-form-item {
      min-width: 0;
      margin-bottom: 0;
    }

    .ant-form-item-label {
      padding-bottom: 4px;
      > label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
    }

    /* === KHU VỰC SỬA LỖI CĂN GIỮA === */

    /* 1. INPUT: Dùng công thức Line-height = Height - 2px */
    .ant-input {
      // height: 36px !important;
      // padding: 0 11px !important;
      font-size: 14px !important;

      display: flex;
      align-items: center;

      border-radius: 6px;
      box-sizing: border-box;
    }
    .ant-input-affix-wrapper {
      // height: 36px !important;
      border-radius: 6px;
      // padding: 0 11px !important;

      display: flex;
      align-items: center;
    }

    .ant-input-affix-wrapper > input.ant-input {
      height: 100%;
      padding: 0;
    }

    /* 2. INPUT NUMBER: Đồng bộ với Input thường */
    .ant-input-number {
      width: 100%;
      height: 36px !important;
      border-radius: 6px;

      .ant-input-number-input {
        height: 34px !important; /* Content height */
        font-size: 14px !important;
        // padding: 0 11px !important;
        line-height: 30px !important; /* Đồng bộ line-height */
      }
    }

    /* 3. SELECT: Sử dụng Flexbox (Phương pháp tối ưu nhất cho div) */
    .ant-select {
      width: 100%;
      .ant-select-selector {
        height: 36px !important;
        border-radius: 6px !important;
        font-size: 14px !important;
        // padding: 0 11px !important;

        /* Flexbox để căn giữa theo trục dọc */
        display: flex !important;
        align-items: center !important;

        .ant-select-selection-search {
          display: flex;
          align-items: center;
          inset-block-start: 0 !important; /* Reset vị trí search của antd */

          .ant-select-selection-search-input {
            height: 34px !important; /* Đồng bộ height */
            line-height: 34px !important;
          }
        }

        .ant-select-selection-item,
        .ant-select-selection-placeholder {
          position: static !important; /* Reset position absolute của antd */
          padding: 0 !important;
          margin: 0 !important;
          line-height: 34px !important; /* Đồng bộ line-height */
          display: flex;
          align-items: center;
        }
      }
    }

    /* 4. PICKER (Datepicker): Căn chỉnh lại input bên trong */
    .ant-picker {
      height: 36px !important;
      border-radius: 6px;
      padding: 0 11px !important;
      display: flex;
      align-items: center; /* Flexbox cho container */

      .ant-picker-input {
        height: 100%; /* Full height */

        > input {
          font-size: 14px;
          line-height: 34px !important; /* Chuẩn 34px */
        }
      }
    }
  }

  /* --- FOOTER --- */
  .filter-footer {
    border-top: 1px solid #e5e7eb;
    padding: 10px 16px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    background: #fff;
    border-radius: 0 0 8px 8px;

    .ant-btn {
      border-radius: 6px;
      height: 36px; /* Đồng bộ chiều cao nút với input luôn cho đẹp */
      font-size: 14px;
      font-weight: 500;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close-danger {
      color: #ef4444;
      border-color: #ef4444;
      &:hover {
        background-color: #ef4444;
        color: #fff;
        border-color: #ef4444;
      }
    }
  }
`;
