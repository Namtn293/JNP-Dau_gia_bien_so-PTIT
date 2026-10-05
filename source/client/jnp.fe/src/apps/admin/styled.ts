import { Col, Row, Select, Switch, Tree } from "antd";
import styled from "styled-components";

export const WrapInputSearch = styled.div`
  display: flex;
  gap: 0.5rem;
  .ant-input-group-wrapper {
    display: flex;        
    flex: 1;             
    min-width: 0;         
    vertical-align: top;
  }
  .ant-input-search-large .ant-input-affix-wrapper,
  .ant-input-search-large .ant-input-search-button {
    height: 3.5rem;
  }

  .ant-input-affix-wrapper {
    width: 45rem;
  }

  .ant-btn-lg {
    height: 3.5rem;
  }

  .ant-select-single.ant-select-lg {
    font-size: 1.6rem;
    height: 3.5rem !important;
  }
  .ant-select-selector {
    height: 3.5rem !important;
  }
`;

export const LayoutContent = styled.div`
  padding: var(--gap-global);
  background-color: #fff;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--gap-global);
`;

export const ButtonLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-left: 8px;
`;

export const buttonPrimary = {
  height: "36px",
  padding: "0 16px",
  fontSize: "14.4px",
  backgroundColor: "#7a1f36",
  // borderColor: "#1890ff",
  color: "#fff",
  borderRadius: "4px",
};

export const ButtonPrimary = styled.button`
  height: 36px;
  padding: 0 16px;
  font-weight: 900;
  font-size: 14.4px;
  background-color: #6098c7;
  border: 1px solid #1890ff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;

  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
`;

export const buttonPrimaryHover = {
  backgroundColor: "#40a9ff",
  borderColor: "#40a9ff",
};

export const buttonSecondary = {
  height: "36px",
  padding: "0 16px",
  fontSize: "14px",
  backgroundColor: "#dc4446",
  borderColor: "#dc4446",
  color: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  
  transition: "all 0.3s ease",
};

export const buttonSecondaryHover = {
  backgroundColor: "#e0e0e0",
  borderColor: "#bfbfbf",
};

export const SwitchStyled = styled(Switch)`
  &.ant-switch {
    width: 36px;
    height: 20px;
    background-color: #d9d9d9;
    border: none;
  }

  &.ant-switch-checked {
    background-color: #1677ff;
  }

  .ant-switch-handle {
    width: 16px;
    height: 16px;
    top: 2px;
  }

  &.ant-switch-checked .ant-switch-handle {
    left: calc(100% - 18px);
  }
`;

export const PopoverMenuWrapper = styled.div`
  min-width: 200px;
  max-width: 280px;

  .popover-submenu-item {
    &:hover {
      background-color: #f0f0f0 !important;
    }
  }
`;

export const StyledSelect = styled(Select)`
  width: 200px;
  margin-left: 0.4rem;
  .ant-select-selector {
    width: 165px !important;
    height: 3.5rem;
    align-items: center;
    padding: 0 2.5rem 0 1rem !important;
  }
`;

export const StyledRow = styled(Row)`
  /* height: calc(100vh - 120px); */
  // padding: 16px;
  /* overflow: hidden; */
`;

export const StyledColSidebar = styled(Col)`
  height: 100%;
  overflow: auto;
`;

export const StyledColContent = styled(Col)`
  height: 100%;
  overflow: auto;

  .layout-content {
    border-top: 1px solid #f0f0f0;
    padding-top: 0;
  }
`;

export const StyledTree = styled(Tree)`
  .ant-tree-treenode {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .ant-tree-switcher {
    /* line-height: 18px !important; */
  }

  .ant-tree-node-content-wrapper {
    /* padding: 0 !important;
    line-height: 18px !important; */
  }
`;
