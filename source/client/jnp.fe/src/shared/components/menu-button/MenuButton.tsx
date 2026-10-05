import useGetApps from "@/shared/hooks/useGetApps";
import { AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { Popover } from "antd";
import { useState } from "react";
import Menu from "./Menu";
import { MenuButtonWrapper } from "./styled";
export const MenuButton = () => {
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const { apps } = useGetApps();

  // Logic xử lý khi click vào nút
  const handleButtonClick = () => {
    if (apps?.length > 1) {
      // Nếu có nhiều app -> Mở/Đóng popup
      setMenuVisible(!menuVisible);
    } else {
      // Nếu chỉ có 1 hoặc 0 app -> Chuyển trang
      navigate({ to: "/admin" });
    }
  };

  // Logic xử lý khi click ra ngoài popup để đóng lại
  const handleOpenChange = (newOpen: boolean) => {
    setMenuVisible(newOpen);
  };

  return (
    <Popover
      content={<Menu onClose={() => setMenuVisible(false)} />}
      
      trigger="click"
      open={menuVisible}
      onOpenChange={handleOpenChange}
      placement="bottomLeft" // Vị trí hiển thị popup (có thể đổi thành bottomRight)
      arrow={false} // Tùy chọn: ẩn mũi tên trỏ vào nút nếu muốn giao diện phẳng
    >
      <MenuButtonWrapper
        as="button"
        onClick={(e) => {
          // Ngăn chặn hành vi mặc định của trigger click nếu cần thiết
          // Tuy nhiên với logic này, ta cần kiểm soát việc mở bằng state
          e.preventDefault();
          handleButtonClick();
        }}
      >
        <AppstoreOutlined />
      </MenuButtonWrapper>
    </Popover>
  );
};

export default MenuButton;
