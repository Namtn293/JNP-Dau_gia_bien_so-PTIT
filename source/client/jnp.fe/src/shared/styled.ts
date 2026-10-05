import styled from "styled-components";

export const FileNameCell = styled.div<{ $clickable: boolean }>`
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  
  &:hover span {
    color: ${({ $clickable }) => $clickable ? '#1677ff' : 'inherit'};
  }
`;

export const LayoutWrapper = styled.div`
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
  overflow-y: auto;
  background: #ffffff;
  transition: margin-left 0.2s ease;
`;
