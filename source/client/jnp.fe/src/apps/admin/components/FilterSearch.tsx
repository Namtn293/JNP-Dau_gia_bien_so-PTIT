import { Form, Button, type FormInstance, Popover } from "antd";
import type { ReactNode } from "react";
import { 
  SearchOutlined, 
  ReloadOutlined, 
  CloseOutlined, 
  
} from "@ant-design/icons";
import { StyledFilterContent } from "./styled";
import { useState, useEffect } from "react";

interface FilterSearchProps {
  visible?: boolean; 
  children?: ReactNode;
  onSearch: (values: any) => void;
  onReset?: () => void;
  onClose?: () => void;
  form: FormInstance;
  trigger?: ReactNode; 
}

export default function FilterSearch({
  visible,
  children,
  onSearch,
  onReset,
  onClose,
  form,
  trigger,
}: FilterSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (visible !== undefined) setIsOpen(visible);
  }, [visible]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen) onClose?.();
  };

  const handleFinish = (values: any) => {
    onSearch(values);
    handleOpenChange(false);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  const popoverContent = (
    <StyledFilterContent>
      <div className="filter-body">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {children}
        </Form>
      </div>

      <div className="filter-footer">
        <Button className="btn-close-danger" icon={<CloseOutlined />} onClick={() => handleOpenChange(false)}>
          Đóng
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Nhập lại
        </Button>
        <Button type="primary" icon={<SearchOutlined />} onClick={() => form.submit()}>
          Tìm kiếm
        </Button>
      </div>
    </StyledFilterContent>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottomRight" // Canh trái thẳng hàng với nút bấm
      arrow={false}
      overlayInnerStyle={{ padding: 0 }}
      destroyTooltipOnHide
      getPopupContainer={(triggerNode) =>
      triggerNode?.parentElement || document.body
    }
    >
      {trigger}
    </Popover>
  );
}