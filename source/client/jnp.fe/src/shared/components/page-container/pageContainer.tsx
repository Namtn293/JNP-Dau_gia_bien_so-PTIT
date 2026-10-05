import {
  BackButton,
  CurrentItem,
  Header,
  HomeItem,
  LinkItem,
  PageContent,
  PageWrapper,
  StyledBreadcrumb,
} from "@/shared/components/page-container/styled";
import type { AppMenuItem } from "@/shared/components/sidebar/types";
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Space } from "antd";
import React, { useMemo } from "react";
interface MenuLabelNumberProps {
  text: string;
  count: number;
}

interface PageContainerProps {
  children: React.ReactNode;
  menuItems: AppMenuItem[];
  showNavButtons?: boolean;
  onBack?: () => void;
  showBreadcrumb?: boolean;
  customBreadcrumb?: Array<{ title: string; path?: string }>;
  homeRoute?: string;
  homeLabel?: string;
  showHome?: boolean;
}

export const PageContainerBreadCrumb: React.FC<PageContainerProps> = ({
  children,
  menuItems,
  showNavButtons = true,
  showBreadcrumb = true,
  showHome = true,
  customBreadcrumb,
  onBack,
  homeRoute = "/",
  homeLabel = "Trang chủ",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm trích xuất text từ label (ReactNode hoặc string)
  const extractLabel = (label: string | React.ReactNode): string => {
    if (typeof label === "string") {
      return label;
    }

    // Nếu label là React component (ví dụ MenuLabelNumber) thì lấy prop text
    if (React.isValidElement<MenuLabelNumberProps>(label)) {
      if (label.props?.text) {
        return label.props.text;
      }
    }
    return "";
  };

  // Tạo danh sách breadcrumb dựa trên menu và đường dẫn hiện tại
  const breadcrumbItems = useMemo(() => {
    // Nếu có breadcrumb custom thì dùng luôn
    if (customBreadcrumb) {
      return customBreadcrumb;
    }

    const currentPath = location.pathname;

    const findMenuItem = (
      items: AppMenuItem[],
      targetKey: string,
      parentTrail: Array<{ title: string; path?: string }> = []
    ): Array<{ title: string; path?: string }> | null => {
      for (const item of items) {
        const itemLabel = extractLabel(item.label);

        if (item.key === targetKey) {
          return [...parentTrail, { title: itemLabel, path: item.key }];
        }

        if (item.children?.length) {
          const result = findMenuItem(item.children, targetKey, [
            ...parentTrail,
            { title: itemLabel, path: item.key },
          ]);
          if (result) return result;
        }
      }
      return null;
    };

    // ===== BUILD breadcrumb gốc =====
    let breadcrumb: Array<{ title: string; path?: string }> = [];

    const menuTrail = findMenuItem(menuItems, currentPath);

    if (menuTrail?.length) {
      breadcrumb = [...menuTrail];
    }

    // ===== THÊM HOME  =====
    if (showHome) {
      breadcrumb.unshift({
        title: homeLabel,
        path: homeRoute,
      });
    }

    return breadcrumb;
  }, [
    location.pathname,
    customBreadcrumb,
    menuItems,
    homeRoute,
    homeLabel,
    showHome,
  ]);

  // Xử lý nút quay lại
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <PageWrapper>
      {/* Header + Breadcrumb */}
      {showBreadcrumb && (
        <Header>
          {/* Nút quay lại */}
          {showNavButtons && (
            <Space size={8}>
              <BackButton
                type="text"
                icon={<ArrowLeftOutlined />}
                size="small"
                onClick={handleBack}
                title="Quay lại"
              />
            </Space>
          )}

          {/* Breadcrumb */}
          <StyledBreadcrumb
            items={breadcrumbItems.map((item, index) => ({
              title:
                index === 0 ? (
                  <HomeItem
                    clickable={!!item.path}
                    onClick={() => item.path && navigate({ to: item.path })}
                  >
                    <HomeOutlined />
                    {item.title}
                  </HomeItem>
                ) : item.path && index < breadcrumbItems.length - 1 ? (
                  <LinkItem onClick={() => navigate({ to: item.path! })}>
                    {item.title}
                  </LinkItem>
                ) : (
                  <CurrentItem>{item.title}</CurrentItem>
                ),
            }))}
          />
        </Header>
      )}

      {/* Nội dung trang */}
      <PageContent>{children}</PageContent>
    </PageWrapper>
  );
};
