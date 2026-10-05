import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  background: #f4f8fa;
  color: #14202b;
  font-family: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
`;

export const TopNav = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #dbe6ee;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(37, 107, 140, 0.05);
`;

export const NavInner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

export const BrandIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9ccade 0%, #256b8c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(37, 107, 140, 0.25);
`;

export const BrandText = styled.div`
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.3px;
    color: #256b8c;
    text-transform: uppercase;
  }
  span {
    font-size: 11px;
    color: #586979;
    font-weight: 500;
  }
`;

export const UserTrigger = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  transition: all 0.2s ease;

  &:hover {
    color: #256b8c;
    background: #f0f7fb;
  }

  .user-icon {
    font-size: 16px;
    color: #4a5568;
  }

  .caret-icon {
    font-size: 11px;
    color: #a0aec0;
    transition: transform 0.2s ease;
  }

  &:hover .caret-icon {
    transform: rotate(180deg);
  }
`;

export const MainContent = styled.main`
  max-width: 1240px;
  margin: 0 auto;
  padding: 24px 18px 60px;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #14202b;
    margin: 0 0 4px;
    letter-spacing: -0.3px;
  }

  p {
    color: #586979;
    margin: 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const ControlBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

export const TabButtonGroup = styled.div`
  display: flex;
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

export const TabButton = styled.button<{ $active: boolean }>`
  border: 0;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #9ccade 0%, #256b8c 100%)"
      : "none"};
  color: ${(props) => (props.$active ? "#ffffff" : "#586979")};
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${(props) =>
    props.$active ? "0 3px 10px rgba(37, 107, 140, 0.3)" : "none"};

  &:hover {
    color: ${(props) => (props.$active ? "#ffffff" : "#14202b")};
  }
`;

export const ViewButtonGroup = styled.div`
  display: flex;
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 12px;
  padding: 4px;
  margin-left: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

export const ViewButton = styled.button<{ $active: boolean }>`
  border: 0;
  background: ${(props) => (props.$active ? "#256b8c" : "none")};
  color: ${(props) => (props.$active ? "#ffffff" : "#586979")};
  font-weight: 600;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: ${(props) => (props.$active ? "#ffffff" : "#14202b")};
  }
`;

export const FilterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  .ant-input-affix-wrapper,
  .ant-select-selector {
    height: 40px !important;
    border-radius: 10px !important;
    display: flex !important;
    align-items: center !important;
    box-sizing: border-box !important;
  }

  .ant-select-single {
    height: 40px !important;
  }

  .ant-select-selection-search,
  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    line-height: 1 !important;
  }
`;

export const PlateDisplay = styled.span<{ $small?: boolean }>`
  display: inline-block;
  background: #ffffff;
  color: #111111;
  border: ${(props) => (props.$small ? "3px" : "4px")} solid #9ccade;
  border-radius: ${(props) => (props.$small ? "6px" : "10px")};
  padding: ${(props) => (props.$small ? "2px 10px" : "4px 18px")};
  font: 800 ${(props) => (props.$small ? "24px" : "42px")}/1.15 "Barlow Condensed", Impact, sans-serif;
  letter-spacing: ${(props) => (props.$small ? "1.5px" : "2.5px")};
  white-space: nowrap;
  box-shadow: inset 0 0 0 ${(props) => (props.$small ? "1.5px" : "2px")} #111111,
    0 6px 16px rgba(37, 107, 140, 0.12);
  transition: transform 0.2s ease, border-color 0.2s ease;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
`;

export const AuctionCard = styled.article`
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(37, 107, 140, 0.1);
    border-color: #b8dbeb;

    ${PlateDisplay} {
      border-color: #256b8c;
    }
  }
`;

export const PlateBox = styled.div`
  text-align: center;
  background: #f0f7fb;
  border: 1px solid #b8dbeb;
  border-radius: 12px;
  padding: 20px 10px;
`;

export const RowBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

export const PriceText = styled.div<{ $small?: boolean }>`
  font-weight: 800;
  font-size: ${(props) => (props.$small ? "16px" : "20px")};
  color: #123d50;
`;

export const MuteLabel = styled.div`
  font-size: 12px;
  color: #586979;
  font-weight: 500;
`;

export const ActionButton = styled.button<{ $ghost?: boolean }>`
  border: ${(props) => (props.$ghost ? "1px solid #b8dbeb" : "0")};
  border-radius: 10px;
  background: ${(props) =>
    props.$ghost
      ? "#ffffff"
      : "linear-gradient(135deg, #9ccade 0%, #256b8c 100%)"};
  color: ${(props) => (props.$ghost ? "#256b8c" : "#ffffff")};
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${(props) =>
    props.$ghost ? "none" : "0 4px 12px rgba(37, 107, 140, 0.25)"};
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$ghost ? "#f0f7fb" : "linear-gradient(135deg, #86bed6 0%, #1e5975 100%)"};
    transform: translateY(-1px);
  }
`;

export const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
`;

export const BoardColumn = styled.section`
  background: #f0f7fb;
  border: 1px solid #dbe6ee;
  border-radius: 16px;
  padding: 14px;
  min-width: 280px;

  h3 {
    margin: 4px 6px 14px;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export const MiniCard = styled.div`
  background: #ffffff;
  border: 1px solid #dbe6ee;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(37, 107, 140, 0.08);
    border-color: #b8dbeb;
  }
`;

export const StatusTag = styled.span<{ $st: "live" | "soon" | "end" }>`
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 99px;
  background: ${(props) =>
    props.$st === "live"
      ? "#ffefef"
      : props.$st === "soon"
      ? "#fff9ea"
      : "#f2f7fa"};
  color: ${(props) =>
    props.$st === "live"
      ? "#e03838"
      : props.$st === "soon"
      ? "#d89b00"
      : "#586979"};

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32px;
  padding: 16px 20px;
  position: relative;
  width: 100%;

  .ant-pagination {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .ant-pagination-item-active {
    background: linear-gradient(135deg, #9ccade 0%, #256b8c 100%);
    border-color: transparent;
    a {
      color: #ffffff !important;
    }
  }

  .ant-pagination-item:hover,
  .ant-pagination-prev:hover .ant-pagination-item-link,
  .ant-pagination-next:hover .ant-pagination-item-link {
    border-color: #9ccade;
    color: #256b8c;
  }
`;

