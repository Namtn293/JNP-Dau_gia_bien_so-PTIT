import styled from "styled-components";

export const SidebarWrapper = styled.div<{ collapsed: boolean }>`
  width: ${({ collapsed }) => (collapsed ? "6rem" : "var(--sidebar-width)")};
  height: 96%;
  background-color: var(--design-primary-text);
  transition: width 0.2s ease;
  position: fixed;
  left: 0;
  top: var(--header-admin-height);
  z-index: 99;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--design-primary-border);
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--design-primary-border);
    border-radius: 4px;

    &:hover {
      background: var(--design-primary-subtitle);
    }
  }

  .ant-menu-title-content {
    font-weight: 500;
  }
  .ant-menu-item-disabled,
  .ant-menu-submenu-disabled {
    cursor: not-allowed !important;

    /* Hiệu ứng đen trắng cho icon và text */
    .ant-menu-item-icon,
    .ant-menu-title-content {
      filter: grayscale(100%);
      opacity: 0.5;
    }
  }

  .collapsed-icons {
    .menu-item-disabled {
      filter: grayscale(100%);
      opacity: 0.5;
      pointer-events: none;
    }
  }
  .sidebar-header {
    height: 4.2rem;
    padding: 0 22px;
    border-bottom: 1px solid var(--design-primary-border);
    /* background-color: var(--design-primary-bg-sub); */
    display: flex;
    align-items: center;
    justify-content: ${({ collapsed }) =>
    collapsed ? "center" : "flex-start"};
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #fff;
    .logo {
      color: var(--text-primary);
      font-size: 1.6rem;
      font-weight: 400;
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
      color: var(--design-primary-title);
      margin-left: -3px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: var(--design-primary-border);
        color: var(--design-primary);
      }
    }

    .sidebar-header-title {
      font-weight: 500;
      font-size: 1.8rem;
      text-transform: uppercase;
      color: var(--design-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      /* margin-left: 1rem; */
    }
  }

  .ant-menu {
    border-right: none;
    flex: 1;
    background-color: var(--design-primary-text);
    margin-bottom: 24px;
  }

  .ant-menu:not(.ant-menu-inline-collapsed)::-webkit-scrollbar {
    width: 6px;
  }

  .ant-menu:not(.ant-menu-inline-collapsed)::-webkit-scrollbar-thumb {
    background: var(--design-primary-border);
    border-radius: 4px;

    &:hover {
      background: var(--design-primary-subtitle);
    }
  }

  .ant-menu:not(.ant-menu-inline-collapsed) {
    .ant-menu-item,
    .ant-menu-submenu-title {
      min-height: 3.2rem;
      margin: 4px 8px;
      border-radius: 6px;
      color: var(--design-primary-title) !important;
      font-size: 1.5rem;

      &:hover {
        color: var(--design-primary) !important;
        background-color: var(--design-primary-bg-sub) !important;
      }
    }

    .ant-menu-submenu-open > .ant-menu-submenu-title {
      color: var(--design-primary) !important;
      font-weight: 600;
    }

    .ant-menu-item-selected {
      background-color: var(--design-primary-bg-sub) !important;
      color: var(--design-primary) !important;
      font-weight: 600;

      &::after {
        border-right: 3px solid var(--design-primary);
      }
    }


    /* Thụt lề submenu */
    /* .ant-menu-submenu .ant-menu-item {
      padding-left: 48px !important;
    } */
  }

  .ant-menu-inline-collapsed {
    .ant-menu-item,
    .ant-menu-submenu-title {
      height: 5rem !important;
      width: 4.4rem;
      border-radius: 6px;

      .ant-menu-item-icon {
        font-size: 2rem;
        color: var(--design-primary-subtitle);
      }

      &:hover {
        background-color: var(--design-primary-bg-hover);

        .ant-menu-item-icon {
          color: var(--design-primary);
        }
      }
    }

    .ant-menu-item-selected {
      background-color: var(--design-primary-bg-hover);

      .ant-menu-item-icon {
        color: var(--design-primary);
      }
    }
  }
  .ant-menu-inline .ant-menu-item {
    height: 4rem !important;
  }
  .collapsed-icons .collapsed-menu-item img {
    width: 22px;
    height: 22px;
  }
  .collapsed-icons {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding: 12px 0;
  }
  .ant-popover .ant-popover-inner-content {
    overflow-y: auto;
    max-height: 300px;
  }
  .ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title {
    height: 4rem;
    line-height: 4rem;
  }
  .menu-label {
    display: -webkit-box;
    -webkit-line-clamp: 2; /* tối đa 2 dòng */
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
    line-height: 1.4;
    font-weight: 500;
  }
  .ant-menu-light.ant-menu-inline .ant-menu-sub.ant-menu-inline {
    overflow: visible;
  }

  .sidebar-menu {
    .ant-menu-submenu-title {
      .menu-label {
        width: 90% !important;
      } 
    }
  }
`;
export const PopoverMenuWrapper = styled.div`
  padding: 4px 0;

  .popover-item {
    padding: 10px 16px;
    border-radius: 6px;
    color: var(--design-primary-title);
    display: flex;
    gap: 10px;
    font-size: 1.4rem;
    cursor: pointer;

    .anticon {
      font-size: 1.6rem;
      color: var(--design-primary-subtitle);
    }

    &:hover {
      background-color: var(--design-primary-bg-hover);
      color: var(--design-primary);

      .anticon {
        color: var(--design-primary);
      }
    }
  }

  .popover-header {
    padding: 10px 16px;
    font-weight: 600;
    color: var(--design-primary);
    border-bottom: 1px solid var(--design-primary-border);
    font-size: 1.4rem;
  }

  .popover-submenu-item {
    padding: 8px 16px 8px 36px;
    color: var(--design-primary-subtitle);
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background-color: var(--design-primary-bg-hover);
      color: var(--design-primary);
    }
  }
`;
