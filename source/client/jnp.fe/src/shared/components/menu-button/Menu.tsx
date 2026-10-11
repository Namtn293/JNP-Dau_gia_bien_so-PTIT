import MenuActiveIcon from "@/assets/icons/MenuActiveIcon";
import useGetApps from "@/shared/hooks/useGetApps";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Col, Row } from "antd";
import {
  AppLogoWrapper,
  AppName,
  MenuButtonWrapper,
  MenuHeader,
  MenuTitle,
  MenuWrapper,
} from "./styled";

type TMenu = { onClose: any };

export const Menu = ({ onClose }: TMenu) => {
  const { apps } = useGetApps();
  return (
    <MenuWrapper>
      <MenuHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MenuButtonWrapper>
            <MenuActiveIcon size={24} color="var(--primary)" />
          </MenuButtonWrapper>
          <MenuTitle>Ứng dụng</MenuTitle>
        </div>
        <Link to="/admin" onClick={onClose}>
          <span style={{ color: "Var(--primary)", fontSize: "16px" }}>Tất cả</span>
          <ArrowRightOutlined
            style={{ color: "Var(--primary)", marginLeft: "4px" }}
          />
        </Link>
      </MenuHeader>
      <Row gutter={[12, 12]} style={{ padding: "8px 16px" }} justify="center">
        {apps.map((app) => (
          <Col key={app.maUD} flex="none">
            <AppLogoWrapper 
              to={app.disabled ? undefined : app.path?.split("?")[0]}
              {...(app.path?.includes("?") && {
                search: {...Object.fromEntries(new URLSearchParams(app.path.split("?")[1])) as any, menuId: app.menuId}
              })}
              onClick={onClose}
              disabled={app.disabled}
            >
              <div>
                <img src={app.imageSrc} alt="" />
              </div>
              <AppName>{app.tenUD}</AppName>
            </AppLogoWrapper>
          </Col>
        ))}
      </Row>
    </MenuWrapper>
  );
};
export default Menu;
