import React from "react";
import { Descriptions, Spin } from "antd";
import type { ReactNode } from "react";
import BaseModal from "@shared/components/modals/index";
import { StyledDescriptionWrapper } from "@/apps/admin/components/styled";

interface IDescriptionItem {
  label: string;
  name: string;
  span?: number;
}

interface ModalDescriptionHorizontalProps {
  open: boolean;
  title?: ReactNode;
  onCancel: () => void;
  data: Record<string, any>;
  items: IDescriptionItem[];
  width?: number;
  loading?: boolean;
  column?: number; // số cột hiển thị ngang
}

const ModalDescriptionHorizontal: React.FC<
  ModalDescriptionHorizontalProps
> = ({
  open,
  title,
  onCancel,
  data,
  items,
  width = 1200,
  column = 3,
  loading = false,
}) => {
  return (
    <BaseModal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={width}
      hideModal={onCancel}
    >
      <StyledDescriptionWrapper 
        style={{ 
          maxHeight: "calc(100vh - 250px)", 
          overflowY: "auto", 
          padding: 24 
        }}
      >
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <Descriptions bordered size="middle" column={column} layout="vertical">
            {items.map((item, index) => (
              <Descriptions.Item
                key={index}
                label={item.label}
                span={item.span || 1}
              >
                {Array.isArray(data[item.name]) ? (
                  data[item.name].map((val: any, i: number) => (
                    <div key={i}>{val}</div>
                  ))
                ) : typeof data[item.name] === "string" ? (
                  data[item.name]
                    .split("\n")
                    .map((line: string, i: number) => <div key={i}>{line}</div>)
                ) : (
                  data[item.name] ?? "--"
                )}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Spin>
      </StyledDescriptionWrapper>
    </BaseModal>
  );
};

export default ModalDescriptionHorizontal;
