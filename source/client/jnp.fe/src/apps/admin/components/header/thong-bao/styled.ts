import styled, { keyframes, createGlobalStyle } from 'styled-components';

const PRIMARY = '#7a1f36';
const PRIMARY_SUB = '#8a191d';
const UNREAD_BG = '#f9f0f2';
const UNREAD_DOT = '#7a1f36';
const HOVER_BG = '#f4e6e9';
const BORDER = '#e8dada';
const TEXT_MAIN = '#1d1d1d';
const TEXT_MUTED = '#6b7280';
const TIME_UNREAD = '#7a1f36';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

export const PopoverGlobalStyle = createGlobalStyle`
  html body div.ant-popover.admin-thong-bao-popover .ant-popover-inner-content {
    overflow: hidden !important;
    overflow-y: hidden !important;
    max-height: none !important;
    padding: 0 !important;
  }
`;

export const PopoverWrapper = styled.div<{ $expanded: boolean }>`
  width: 450px;
  max-height: 85vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease;
  box-shadow: 0 10px 40px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.08);
  border: 1px solid ${BORDER};
`;

// ─── Header ──────────────────────────────────────────────────────────────────
export const NotificationHeader = styled.div`
  padding: 4px 16px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1px solid ${BORDER};
  background: linear-gradient(135deg, #f9f0f2 0%, #fff 100%);

  .title {
    font-size: 17px;
    font-weight: 700;
    color: ${TEXT_MAIN};
    letter-spacing: -0.2px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: ${PRIMARY};
    cursor: pointer;
    transition: background 0.2s;
    border: 1px solid transparent;

    &:hover {
      background: #f4e6e9;
      border-color: #e8dada;
    }

    &.icon-only {
      padding: 6px;
      border-radius: 50%;
      font-size: 16px;
    }
  }
`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export const FilterTabsWrapper = styled.div`
  display: flex;
  padding: 10px 12px 6px;
  gap: 6px;
  flex-shrink: 0;
`;

export const FilterTab = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s;
  background: ${({ $active }) => ($active ? PRIMARY : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : TEXT_MUTED)};
  box-shadow: ${({ $active }) => ($active ? '0 2px 6px rgba(122,31,54,.25)' : 'none')};

  &:hover {
    background: ${({ $active }) => ($active ? PRIMARY_SUB : '#f4e6e9')};
    color: ${({ $active }) => ($active ? '#fff' : PRIMARY)};
  }
`;

// ─── Section row ──────────────────────────────────────────────────────────────
export const SectionHeaderWrapper = styled.div`
  padding: 4px 16px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  .section-title {
    font-size: 12px;
    font-weight: 700;
    color: ${TEXT_MUTED};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .view-all-link {
    font-size: 14px;
    font-weight: 700;
    color: ${PRIMARY};
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 10px;
    transition: background 0.2s;

    &:hover {
      background: #f4e6e9;
    }
  }
`;

// ─── Scroll list ──────────────────────────────────────────────────────────────
export const NotificationListWrapper = styled.div<{ $isExpanded: boolean }>`
  flex: 1;
  min-height: 0;
  // max-height: ${({ $isExpanded }) => ($isExpanded ? 'min(60vh, 420px)' : '320px')};
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 8px;
  // overscroll-behavior: contain;

  /* Ẩn thanh kéo Scrollbar đi nhưng vẫn cuộn được */
  scrollbar-width: none !important; /* Dành cho Firefox */
  -ms-overflow-style: none !important; /* Dành cho IE và Edge */
  
  &::-webkit-scrollbar { 
    display: none !important; /* Dành cho Chrome, Safari, Opera */
    width: 0px !important;
    background: transparent !important;
  }
`;

// ─── Notification item ────────────────────────────────────────────────────────
export const NotificationItemStyled = styled.div<{ $unread: boolean }>`
  padding: 16px 14px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 14px;
  transition: background 0.18s, transform 0.18s;
  position: relative;
  align-items: flex-start;
  margin-bottom: 4px;
  background: ${({ $unread }) => ($unread ? UNREAD_BG : 'transparent')};
  animation: ${slideIn} 0.2s ease;

  &:hover {
    background: ${({ $unread }) => ($unread ? '#f4e6e9' : HOVER_BG)};
    transform: translateX(2px);
  }

  .nghiep-vu-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    word-break: break-word;
    width: fit-content;
    line-height: 1.1;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    flex-shrink: 0;
  }

  /* ── Content ── */
  .content-container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 2px;

    .item-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .title-text {
      flex: 1;
      font-size: 18px;
      font-weight: 700;
      color: ${({ $unread }) => ($unread ? PRIMARY : TEXT_MAIN)};
      line-height: 1.4;
      word-break: break-word;
    }

    .item-text {
      font-size: 13.5px;
      line-height: 1.5;
      color: ${TEXT_MUTED};
      word-break: break-word;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      line-clamp: 5;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-time {
      margin-top: 4px;
      font-size: 12px;
      color: ${({ $unread }) => ($unread ? TIME_UNREAD : TEXT_MUTED)};
      font-weight: ${({ $unread }) => ($unread ? '600' : '400')};
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  /* ── Unread dot ── */
  .unread-dot {
    flex-shrink: 0;
    margin-top: 6px;
    margin-left: 8px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${UNREAD_DOT};
    box-shadow: 0 0 0 2px rgba(122,31,54,.2);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 2px rgba(122,31,54,.2); }
    50%      { box-shadow: 0 0 0 4px rgba(122,31,54,.08); }
  }
`;

// ─── Footer ───────────────────────────────────────────────────────────────────
export const NotificationFooter = styled.div`
  padding: 8px 12px 12px;
  flex-shrink: 0;
  background: #fafafa;
  border-top: 1px solid ${BORDER};

  .footer-button {
    width: 100%;
    padding: 9px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f4e6e9, #f9f0f2);
    color: ${PRIMARY};
    font-weight: 700;
    font-size: 13.5px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #e8dada;
    letter-spacing: -0.1px;

    &:hover {
      background: linear-gradient(135deg, #f0e1e4, #e8dada);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(122,31,54,.15);
    }
  }
`;

// ─── Bell button ──────────────────────────────────────────────────────────────
export const BellButton = styled.div`
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  flex-shrink: 0;

  &:hover {
    background: rgba(122, 31, 54, 0.08);
    box-shadow: 0 4px 10px rgba(122, 31, 54, 0.1);
  }

  .anticon {
    font-size: 24px;
    color: ${PRIMARY};
    line-height: 1;
  }
`;
