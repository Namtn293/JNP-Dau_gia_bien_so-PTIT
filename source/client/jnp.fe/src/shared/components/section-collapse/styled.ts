import { Collapse } from 'antd';
import styled from 'styled-components';
import { colors } from '@/configs/antDesign';

/** Nền header section màu trắng cho đồng bộ với các màn chi tiết chung. */
const HEADER_BG = '#ffffff';

/**
 * Chiều cao dòng title; icon và mũi tên căn theo dòng này để nằm ngang hàng title
 * thay vì canh giữa cả header khi có thêm subtitle bên dưới.
 */
const TITLE_LINE_HEIGHT = '24px';

/**
 * Khung collapse của một section.
 * Các thuộc tính nền và bo góc của header phải dùng !important vì CSS-in-JS
 * của antd thắng specificity của styled-components.
 */
export const Wrapper = styled(Collapse)`
  background-color: ${colors.white};
  border: 1px solid ${colors.primaryBorder};
  border-radius: 9px;
  box-shadow: 0 2px 9px rgba(0, 0, 0, 0.02);

  .ant-collapse-item {
    border-bottom: none;
  }

  .ant-collapse-header {
    background-color: ${HEADER_BG} !important;
    border-radius: 9px 9px 0 0 !important;
    align-items: flex-start !important;
    padding: 14px 18px !important;
  }

  /* Mũi tên căn theo dòng title, không canh giữa cả header hai dòng. */
  .ant-collapse-expand-icon {
    height: ${TITLE_LINE_HEIGHT} !important;
    display: inline-flex !important;
    align-items: center !important;
  }

  .ant-collapse-content-box {
    padding: 18px !important;
  }
`;

/** Cụm icon, tiêu đề và dòng mô tả đặt ở header của section. */
export const Heading = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;

  .section-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    height: ${TITLE_LINE_HEIGHT};
    color: ${colors.sectionTitle};
    font-size: 16px;
  }

  .section-text {
    min-width: 0;
  }

  .section-title {
    font-size: 18px;
    font-weight: 700;
    line-height: ${TITLE_LINE_HEIGHT};
    text-transform: uppercase;
    color: ${colors.sectionTitle};
  }

  .section-subtitle {
    margin: 2px 0 0;
    font-size: 13px;
    font-weight: 400;
    color: rgba(29, 29, 29, 0.45);
  }
`;
