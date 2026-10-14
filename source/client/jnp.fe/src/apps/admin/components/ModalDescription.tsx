import React from "react";
import { Descriptions, Spin } from "antd";
import type { ReactNode } from "react";
import BaseModal from "@shared/components/modals/index";
import { StyledDescriptionWrapper } from "@/apps/admin/components/styled";

import type { IBaseModalProps } from "@shared/components/modals/index";

interface IDescriptionItem {
  label: string;
  name: string;
  span?: number;
  render?: (value: any, data: Record<string, any>) => ReactNode;
}

interface ModalDescriptionProps extends Partial<IBaseModalProps> {
  open: boolean;
  title?: ReactNode;
  onCancel: () => void;
  data: Record<string, any>;
  items: IDescriptionItem[];
  width?: number;
}

const ModalDescription: React.FC<ModalDescriptionProps> = ({
  open,
  title,
  onCancel,
  data,
  items,
  width = 800,
  ...props
}) => {
  const renderValue = (item: IDescriptionItem) => {
    const value = data[item.name];

    if (item.render) {
      return item.render(value, data);
    }

    if (React.isValidElement(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((val: any, i: number) => <div key={i}>{val}</div>);
    }

    if (typeof value === "string") {
      return value
        .split("\n")
        .map((line: string, i: number) => <div key={i}>{line}</div>);
    }

    return value ?? "--";
  };

  return (
    <BaseModal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={width}
      hideModal={onCancel}
      {...props}
    >
      <StyledDescriptionWrapper>
        <Spin spinning={Boolean(props.loading)} tip="Đang tải dữ liệu...">
          {data && (
            <Descriptions
              column={1}
              bordered
              size="middle"
              labelStyle={{
                width: "180px",
                fontWeight: 600,
                backgroundColor: "#fafafa",
                verticalAlign: "top",
              }}
              contentStyle={{
                verticalAlign: "top",
              }}
            >
              {items.map((item, index) => (
                <Descriptions.Item
                  key={index}
                  label={item.label}
                  span={item.span || 1}
                >
                  {renderValue(item)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Spin>
      </StyledDescriptionWrapper>
    </BaseModal>
  );
};

export default ModalDescription;
