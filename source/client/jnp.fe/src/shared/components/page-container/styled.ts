import { Breadcrumb, Button } from "antd";
import styled from "styled-components";

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--gap-global);
  height: 3.2rem; /* Đồng bộ với sidebar-header */
  padding: 0 1.6rem; /* Đồng bộ với sidebar-header */
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0; /* Đồng bộ với sidebar-header */
`;

export const BackButton = styled(Button)`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

export const StyledBreadcrumb = styled(Breadcrumb)`
  flex: 1;
  font-weight: 500;
  font-size: 18px;
  color: #112a46;
`;

export const HomeItem = styled.span<{ clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  color: ${({ clickable }) => (clickable ? "var(--primary)" : "#1f1f1f")};
`;

export const LinkItem = styled.span`
  color: var(--primary);
  cursor: pointer;
`;

export const CurrentItem = styled.span`
  color: #1f1f1f;
  font-weight: 500;
`;

export const PageContent = styled.div`
  flex: 1;
  overflow: auto;
`;
