//libs
import type { ModalProps } from "antd";
import { Col, Row, Spin, Form } from "antd";
import React from "react";

//components
import BaseModal from "@shared/components/modals/index";

//css
import { StyledForm } from "./styled";

export interface IFormItem<T = Record<string, any>> {
  label?: React.ReactNode;
  name?: keyof T | (string | number)[];
  component: React.ReactNode;
  rules?: any[];
  span?: number;
  valuePropName?: string;
  getValueFromEvent?: (e: any) => any;
  validateTrigger?: string | string[];
  normalize?: (value: any, prevValue: any, prevValues: any) => any;
  raw?: boolean;
  required?: boolean;
  extra?: React.ReactNode;
  initialValue?: any;
}

interface ModalFormProps<T = Record<string, any>> extends ModalProps {
  loading?: boolean;
  open?: boolean;
  isLoadingGetDetail?: boolean;
  fullScreen?: boolean;
  title?: React.ReactNode;
  onCancel: () => void;
  onOk: () => void;
  formItems: IFormItem<T>[];
  form?: any;
  okText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  onFinish?: (values: any) => void;
  width?: number;
  labelCol?: object;
  layout?: "horizontal" | "vertical" | "inline";
  formClassName?: string;
  disableSubmitOnError?: boolean;
  requiredMark?: boolean;
}

const appendSelectWithDisabledOptionsRule = (
  rules: any[] | undefined,
  _component: React.ReactNode,
) => {
  return rules;
};

export function ModalForm<T = Record<string, any>>({
  open,
  title,
  loading,
  isLoadingGetDetail,
  onCancel,
  onOk,
  formItems,
  children,
  form,
  aside,
  onFinish,
  okText = "Thêm mới",
  cancelText = "Hủy",
  width = 900,
  labelCol,
  layout = "horizontal",
  formClassName,
  disableSubmitOnError,
  requiredMark = true,
  ...props
}: ModalFormProps<T>) {
  const isQuanLyBaiViet =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/quan-ly-bai-viet");
  const shouldDisableSubmit = disableSubmitOnError ?? isQuanLyBaiViet;

  const [submittable, setSubmittable] = React.useState(true);
  const values = Form.useWatch([], form);
  const [localLoading, setLocalLoading] = React.useState(false);

  const handleOkClick = async () => {
    if (isQuanLyBaiViet) {
      setLocalLoading(true);
      try {
        await onOk();
      } finally {
        setLocalLoading(false);
      }
    } else {
      onOk();
    }
  };

  React.useEffect(() => {
    if (shouldDisableSubmit && form && open) {
      form
        .validateFields({ validateOnly: true })
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    } else {
      setSubmittable(true);
    }
  }, [form, values, open, shouldDisableSubmit]);

  const isLoading = loading || (isQuanLyBaiViet && localLoading);

  return (
    <BaseModal
      open={open}
      title={title}
      hideModal={onCancel}
      onOk={handleOkClick}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      width={width}
      showHeader={true}
      loading={isLoading}
      destroyOnHidden
      {...props}
      okButtonProps={{
        ...(props.okButtonProps || {}),
        disabled: (shouldDisableSubmit ? !submittable : undefined) || isLoading || props.okButtonProps?.disabled,
      }}
    >
      {isLoadingGetDetail ? (
        <Spin size="small" style={{ display: "block", margin: "32px auto" }} />
      ) : (
        <StyledForm
          className={formClassName}
          onFinish={onFinish}
          form={form}
          layout={layout}
          requiredMark={requiredMark}
        >
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} lg={aside ? 12 : 24}>
              <Row gutter={[24, 10]}>
                {formItems.map((item, index) =>
                  item.raw ? (
                    <Col key={index} span={item.span ?? 24} style={{ width: "100%" }}>
                      {item.component}
                    </Col>
                  ) : (
                    <Col key={index} span={item.span ?? 12}>
                      <StyledForm.Item
                        label={item.label}
                        {...(item.name !== undefined
                          ? {
                              name: item.name as
                                | string
                                | number
                                | (string | number)[],
                            }
                          : {})}
                        rules={appendSelectWithDisabledOptionsRule(
                          item.rules,
                          item.component,
                        )}
                        required={item.required}
                        initialValue={item.initialValue}
                        valuePropName={(item as any).valuePropName}
                        getValueFromEvent={(item as any).getValueFromEvent}
                        validateTrigger={(item as any).validateTrigger}
                        normalize={item.normalize}
                        extra={item.extra}
                        labelCol={
                          layout === "vertical"
                            ? undefined
                            : typeof labelCol === "object"
                              ? labelCol
                              : { flex: "0 0 160px" }
                        }
                        wrapperCol={
                          layout === "vertical" ? undefined : { flex: "1" }
                        }
                      >
                        {item.component}
                      </StyledForm.Item>
                    </Col>
                  ),
                )}
              </Row>
              {children}
            </Col>

            {aside ? (
              <Col xs={24} lg={12}>
                {aside}
              </Col>
            ) : null}
          </Row>
        </StyledForm>
      )}
    </BaseModal>
  );
}

export default ModalForm;
