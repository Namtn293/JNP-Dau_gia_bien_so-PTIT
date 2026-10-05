import styled, { createGlobalStyle } from "styled-components";

const PRIMARY = "var(--primary, #7a1f36)";
const PRIMARY_SOFT = "#fbf3f5";
const PRIMARY_BORDER = "rgba(122, 31, 54, 0.16)";
const SURFACE = "#ffffff";
const SURFACE_SUB = "#f7f8fa";
const BORDER = "#e7ebf0";
const TEXT_MAIN = "#182230";
const TEXT_MUTED = "#667085";
const TEXT_SOFT = "#98a2b3";
const SHADOW = "0 14px 34px rgba(15, 23, 42, 0.06)";

export const DatePickerHighlightStyle = createGlobalStyle`
  .thong-bao-quarter-picker-popup .current-quarter-cell {
    color: ${PRIMARY};
    font-weight: 700;
    border: 1px solid rgba(122, 31, 54, 0.32);
    background: linear-gradient(180deg, #fff7f8 0%, #fdecef 100%);
    box-shadow: inset 0 0 0 1px rgba(122, 31, 54, 0.08);
  }

  .thong-bao-year-picker-popup .current-year-cell {
    color: ${PRIMARY};
    font-weight: 700;
    border: 1px solid rgba(122, 31, 54, 0.32);
    background: linear-gradient(180deg, #fff7f8 0%, #fdecef 100%);
    box-shadow: inset 0 0 0 1px rgba(122, 31, 54, 0.08);
  }
`;

export const ContentWrapper = styled.div`
  min-height: 100%;
  padding: 24px;
  background:
    linear-gradient(180deg, #f8f9fb 0%, #f3f5f8 100%);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const PageHeaderCard = styled.section`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid ${PRIMARY_BORDER};
  background:
    radial-gradient(circle at top right, rgba(122, 31, 54, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fcf8f9 100%);
  box-shadow: ${SHADOW};
  overflow: hidden;

  @media (max-width: 992px) {
    flex-direction: column;
    padding: 24px;
  }

  @media (max-width: 768px) {
    border-radius: 20px;
    padding: 20px;
  }
`;

export const PageHeaderText = styled.div`
  max-width: 760px;
`;

export const PageEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: ${PRIMARY};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export const PageTitle = styled.h1`
  margin: 0;
  color: ${TEXT_MAIN};
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export const PageDescription = styled.p`
  margin: 12px 0 0;
  color: ${TEXT_MUTED};
  font-size: 15px;
  line-height: 1.7;
`;

export const PageHeaderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 12px;
  width: min(360px, 100%);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    width: 100%;
  }
`;

export const StatCard = styled.div<{ $accent?: boolean }>`
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid ${({ $accent }) => ($accent ? PRIMARY_BORDER : BORDER)};
  background: ${({ $accent }) =>
    $accent
      ? "linear-gradient(180deg, #fff7f8 0%, #fff1f4 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)"};

  .label {
    display: block;
    margin-bottom: 10px;
    color: ${TEXT_MUTED};
    font-size: 13px;
    font-weight: 600;
  }

  .value {
    color: ${({ $accent }) => ($accent ? PRIMARY : TEXT_MAIN)};
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }
`;

export const PageGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  margin-top: 24px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterSidebar = styled.aside`
  position: sticky;
  top: 24px;

  @media (max-width: 1080px) {
    position: static;
  }
`;

export const FilterCard = styled.section`
  padding: 22px;
  border-radius: 22px;
  border: 1px solid ${BORDER};
  background: ${SURFACE};
  box-shadow: ${SHADOW};

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-picker,
  .ant-select {
    width: 100%;
  }

  .ant-picker,
  .ant-input,
  .ant-input-affix-wrapper,
  .ant-select-selector,
  .ant-btn {
    min-height: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .ant-picker,
  .ant-input,
  .ant-input-affix-wrapper,
  .ant-select-selector {
    border-color: #d7dde5;
    box-shadow: none;
    background: #ffffff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .ant-picker:hover,
  .ant-input:hover,
  .ant-input-affix-wrapper:hover,
  .ant-select:hover .ant-select-selector {
    border-color: #cfd6e0;
  }

  .ant-picker-focused,
  .ant-input:focus,
  .ant-input-affix-wrapper-focused,
  .ant-select-focused .ant-select-selector {
    border-color: #cfd6e0 !important;
    box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.04) !important;
  }

  .ant-input {
    padding: 0 14px;
    line-height: 44px;
  }

  .ant-input-affix-wrapper,
  .ant-picker,
  .ant-select-single .ant-select-selector {
    padding: 0 14px;
  }

  .ant-input-affix-wrapper {
    display: flex;
    align-items: center;
  }

  .ant-input-affix-wrapper .ant-input,
  .ant-input-affix-wrapper input {
    height: auto;
    min-height: auto;
    padding: 0;
    line-height: 1.5715;
  }

  .ant-picker {
    display: flex;
    align-items: center;
  }

  .ant-picker-input {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .ant-picker-input > input {
    height: 100%;
    line-height: 1.5715;
  }

  .ant-select-single {
    height: 44px;
  }

  .ant-select-single .ant-select-selector {
    display: flex;
    align-items: center;
    height: 44px !important;
    padding-right: 36px !important;
  }

  .ant-select-single .ant-select-selection-wrap {
    height: 100%;
  }

  .ant-select-single .ant-select-selection-search {
    inset: 0 14px;
  }

  .ant-select-single .ant-select-selection-search,
  .ant-select-single .ant-select-arrow {
    display: flex;
    align-items: center;
  }

  .ant-select-single .ant-select-selection-item,
  .ant-select-single .ant-select-selection-placeholder {
    display: block;
    line-height: 42px !important;
  }

  .ant-select-selection-search-input {
    height: 42px !important;
  }

  .ant-select-arrow,
  .ant-picker-suffix,
  .ant-picker-clear,
  .ant-input-clear-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-picker-input > input,
  .ant-input,
  .ant-input-affix-wrapper input,
  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    font-size: 14px;
  }

  .ant-btn {
    font-weight: 600;
  }
`;

export const FilterTitle = styled.h2`
  margin: 0;
  color: ${TEXT_MAIN};
  font-size: 22px;
  font-weight: 700;
`;

export const FilterDescription = styled.p`
  margin: 10px 0 0;
  color: ${TEXT_MUTED};
  font-size: 14px;
  line-height: 1.6;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

export const FilterLabel = styled.div`
  color: ${TEXT_MAIN};
  font-size: 14px;
  font-weight: 700;
`;

export const FilterStatus = styled.div`
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px dashed rgba(122, 31, 54, 0.22);
  background: ${PRIMARY_SOFT};

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${PRIMARY};
    font-size: 13px;
    font-weight: 700;
  }

  .value {
    margin-top: 8px;
    color: ${TEXT_MAIN};
    font-size: 14px;
    line-height: 1.6;
  }
`;

export const FilterActionRow = styled.div`
  margin-top: 16px;

  .ant-btn {
    border-color: ${PRIMARY_BORDER};
    color: ${PRIMARY};

    &:hover {
      border-color: ${PRIMARY};
      color: ${PRIMARY};
      background: ${PRIMARY_SOFT};
    }
  }
`;

export const MainSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
`;

export const ReadFilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid ${BORDER};
  background: ${SURFACE};
  box-shadow: ${SHADOW};

  .bar-left {
    min-width: 0;
    flex: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ReadFilterGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const ReadFilterBtn = styled.button<{ $active?: boolean }>`
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? PRIMARY_BORDER : BORDER)};
  background: ${({ $active }) => ($active ? PRIMARY_SOFT : SURFACE_SUB)};
  color: ${({ $active }) => ($active ? PRIMARY : TEXT_MUTED)};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(122, 31, 54, 0.28);
    color: ${PRIMARY};
    background: #fff7f8;
  }
`;

export const ResultsSummary = styled.div`
  margin-top: 14px;
  min-width: 0;
  color: ${TEXT_MUTED};
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  word-break: break-word;

  strong {
    color: ${PRIMARY};
  }
`;

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  .ant-btn {
    min-height: 42px;
    border-radius: 12px;
    font-weight: 600;
    border-color: ${PRIMARY_BORDER};
    color: ${PRIMARY};

    &:hover {
      border-color: ${PRIMARY};
      color: ${PRIMARY};
      background: ${PRIMARY_SOFT};
    }
  }
`;

export const NotificationPanel = styled.section`
  border-radius: 22px;
  border: 1px solid ${BORDER};
  background: ${SURFACE};
  box-shadow: ${SHADOW};
  overflow: hidden;
`;

export const NotificationPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid #edf0f3;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
`;

export const NotificationPanelActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  .ant-checkbox-wrapper {
    color: ${TEXT_MUTED};
    font-size: 14px;
    font-weight: 500;
  }

  .selection-count {
    color: ${PRIMARY};
    font-size: 14px;
    font-weight: 700;
  }

  .bulk-delete-btn {
    border-color: ${PRIMARY};
    background: ${PRIMARY};
    color: #ffffff;

    .anticon {
      color: #ffffff;
    }

    &:hover,
    &:focus {
      border-color: #64172c !important;
      background: #64172c !important;
      color: #ffffff !important;
    }

    &:disabled {
      border-color: #d7dde5 !important;
      background: #eef1f5 !important;
      color: #98a2b3 !important;

      .anticon {
        color: #98a2b3 !important;
      }
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const NotificationPanelTitleGroup = styled.div`
  min-width: 0;
`;

export const NotificationPanelTitle = styled.h2`
  margin: 0;
  color: ${TEXT_MAIN};
  font-size: 20px;
  font-weight: 700;
`;

export const NotificationPanelSubtitle = styled.p`
  margin: 6px 0 0;
  color: ${TEXT_MUTED};
  font-size: 13px;
`;

export const NotificationListBody = styled.div`
  padding: 20px;
  background: linear-gradient(180deg, #fbfcfd 0%, #ffffff 100%);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const NotificationCard = styled.article<{ $unread?: boolean; $selected?: boolean }>`
  position: relative;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid
    ${({ $selected, $unread }) =>
      $selected ? "rgba(122, 31, 54, 0.34)" : $unread ? PRIMARY_BORDER : "#edf0f3"};
  background: ${({ $unread }) =>
    $unread
      ? "linear-gradient(180deg, #fffdfd 0%, #fbf2f5 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)"};
  box-shadow: ${({ $selected, $unread }) =>
    $selected
      ? "0 16px 36px rgba(122, 31, 54, 0.12)"
      : $unread
        ? "0 10px 24px rgba(122, 31, 54, 0.08)"
        : "0 8px 20px rgba(15, 23, 42, 0.04)"};
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &::before {
    content: "";
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 0;
    width: 4px;
    border-radius: 999px;
    background: ${({ $unread }) => ($unread ? PRIMARY : "transparent")};
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ $selected, $unread }) =>
      $selected ? "rgba(122, 31, 54, 0.42)" : $unread ? "rgba(122, 31, 54, 0.28)" : "#d9dee5"};
    box-shadow: ${({ $selected, $unread }) =>
      $selected
        ? "0 18px 38px rgba(122, 31, 54, 0.14)"
        : $unread
          ? "0 16px 32px rgba(122, 31, 54, 0.12)"
          : "0 14px 28px rgba(15, 23, 42, 0.08)"};
  }

  & + & {
    margin-top: 16px;
  }

  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 16px;
  }
`;

export const NotificationCardTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;

  .ant-checkbox-wrapper {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

export const NotificationCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const NotificationCardActions = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;

  .ant-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    min-width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 10px;
  }
`;

export const NotificationTitle = styled.h3`
  margin: 0;
  color: ${TEXT_MAIN};
  font-size: 18px;
  font-weight: 700;
  line-height: 1.45;
`;

export const NotificationBody = styled.p`
  margin: 12px 0 0;
  color: ${TEXT_MUTED};
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-line;
`;

export const UnreadBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${PRIMARY};
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

export const DateLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: ${TEXT_SOFT};
  font-size: 13px;
  font-weight: 500;
`;

export const LoadingState = styled.div`
  display: grid;
  gap: 16px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 24px;
  text-align: center;

  .empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin-bottom: 16px;
    border-radius: 20px;
    background: ${PRIMARY_SOFT};
    color: ${PRIMARY};
    font-size: 28px;
  }
`;

export const EmptyStateTitle = styled.div`
  color: ${TEXT_MAIN};
  font-size: 18px;
  font-weight: 700;
`;

export const EmptyStateText = styled.div`
  max-width: 420px;
  margin-top: 8px;
  color: ${TEXT_MUTED};
  font-size: 14px;
  line-height: 1.6;
`;

export const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px 20px;
  border-top: 1px solid #edf0f3;
  background: #ffffff;
  flex-wrap: wrap;

  .ant-select-selector {
    min-height: 40px !important;
    border-radius: 12px !important;
  }

  .ant-pagination {
    margin-left: auto;
  }

  .ant-pagination-item-active {
    border-color: ${PRIMARY};
  }

  .ant-pagination-item-active a {
    color: ${PRIMARY};
  }

  .ant-pagination .ant-pagination-item:hover,
  .ant-pagination .ant-pagination-prev:hover .ant-pagination-item-link,
  .ant-pagination .ant-pagination-next:hover .ant-pagination-item-link {
    border-color: rgba(122, 31, 54, 0.42);
    color: ${PRIMARY};
  }
`;

export const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: ${TEXT_MUTED};
  font-size: 14px;
  line-height: 1.6;

  strong {
    color: ${TEXT_MAIN};
  }
`;
