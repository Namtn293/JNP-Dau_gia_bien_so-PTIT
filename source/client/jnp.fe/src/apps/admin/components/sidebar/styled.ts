import styled from "styled-components";

export const SidebarWrapper = styled.div<{ collapsed: boolean }>`
  width: ${({ collapsed }) => (collapsed ? "6rem" : "30rem")};
  height: calc(100vh - var(--header-admin-height));
  background-color: #e02f2fff;
  transition: width 0.2s ease;
  position: fixed;
  left: 0;
  top: var(--header-admin-height);
  z-index: 99;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
  overflow: ${({ collapsed }) => (collapsed ? "visible" : "hidden")};

  .ant-menu-title-content {
    font-weight: 500;
  }

  .sidebar-header {
    height: 4.2rem;
    padding: 0 1.6rem;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: ${({ collapsed }) =>
      collapsed ? "center" : "flex-start"};

    .logo {
      color: var(--text-primary);
      font-size: 1.6rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;

      /* Logo icon khi collapsed */
      .logo-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #1677ff, #69c0ff);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
      }

      /* Logo text khi expanded */
      span {
        display: ${({ collapsed }) => (collapsed ? "none" : "block")};
      }
    }

    .collapse-btn {
      color: #000000;
      margin-left: -3px;
      // display: ${({ collapsed }) => (collapsed ? "none" : "block")};
      &:hover {
        background-color: #f5f5f5;
        color: #000000;
      }
    }
    .sidebar-header-title {
      font-weight: 600;
      font-size: 1.8rem;
      text-transform: uppercase;
    }
  }

  /* Menu container */
  .ant-menu {
    border-right: none;
    flex: 1;
    overflow-y: ${({ collapsed }) => (collapsed ? "visible" : "auto")};
    background-color: #ffffff;
  }

  /* Custom scrollbar cho expanded mode */
  .ant-menu:not(.ant-menu-inline-collapsed)::-webkit-scrollbar {
    width: 8px;
  }
  .ant-menu:not(.ant-menu-inline-collapsed)::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .ant-menu:not(.ant-menu-inline-collapsed)::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  .ant-menu:not(.ant-menu-inline-collapsed)::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Menu items expanded mode */
  .ant-menu:not(.ant-menu-inline-collapsed) {
    .ant-menu-item,
    .ant-menu-submenu-title {
      height: auto !important;
      min-height: 3.5rem;
      line-height: 1.5 !important;
      margin: 0;

      // padding: 1.2rem 2.4rem !important;
      color: #000000 !important;

      white-space: normal !important;
      font-size: 1.6rem;
      &:hover {
        color: var(--primary) !important;
        background-color: #f5f5f5 !important;
      }
    }

    .ant-menu-submenu .ant-menu-item {
      position: relative;
      padding-left: 45px !important;
    }

    .ant-menu-submenu .ant-menu-item::before {
      content: "•";
      position: absolute;
      left: 32px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-primary);
      font-weight: bold;
      font-size: 14px;
    }
  }

  /* Menu items collapsed mode */
  .ant-menu-inline-collapsed {
    width: 6rem;

    .ant-menu-item,
    .ant-menu-submenu-title {
      padding: 0 1.6rem !important;
      text-align: center;
      height: 6rem !important;
      line-height: 6rem !important;
      display: flex !important;
      align-items: center;
      justify-content: center;

      .ant-menu-item-icon,
      .ant-menu-submenu-title-icon {
        font-size: 2rem;
        margin: 0;
      }

      .ant-menu-title-content {
        display: none;
      }
    }
  }

  /* Collapsed icons container */
  .collapsed-icons {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;

    .collapsed-menu-item {
      padding: 1.2rem;
      text-align: center;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.2s;
      margin: 2px 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 800;
      &:hover {
        background-color: #f0f5ff;
      }

      .anticon {
        font-size: 2rem;
        color: #666;
      }
    }
  }

  .ant-menu-item-selected {
    background-color: #e6f7ff !important;
    color: var(--primary) !important;
  }

  .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: var(--primary) !important;
  }

  /* Label and badge */
  .menu-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .menu-badge {
    background-color: #f0f5ff;
    border: 1px solid #d6e4ff;
    color: #1677ff;
    font-weight: 600;
    font-size: 1.2rem;
    padding: 0 6px;
    border-radius: 4px;
    margin-left: 8px;
    line-height: 1.5;
  }

  .menu-badge.zero {
    background-color: #f5f5f5;
    border-color: #e8e8e8;
    color: #8c8c8c;
  }
`;

// Popover menu style cho collapsed mode
export const PopoverMenuWrapper = styled.div`
  .popover-menu-content {
    .ant-menu {
      border: none;
      box-shadow: none;
      background: transparent;

      .ant-menu-item,
      .ant-menu-submenu-title {
        padding: 1.2rem 1.6rem !important;
        margin: 0 !important;
        height: auto !important;
        min-height: 4.8rem;
        line-height: 1.5 !important;
        border-radius: 6px;
        margin-bottom: 4px !important;

        &:hover {
          background-color: #f0f5ff !important;
          color: var(--primary) !important;
        }
      }

      /* Dấu chấm cho popover submenu items */
      .popover-submenu-item {
        position: relative;
        padding-left: 40px !important;

        &::before {
          content: "•";
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #666666;
          font-weight: bold;
          font-size: 12px;
        }
      }
    }
  }
`;
