import React from "react";
import { Row, Col } from "antd";
import { StyledForm } from "./styled";

interface IFormItem {
  label: React.ReactNode;
  name: string;
  component: React.ReactNode;
  rules?: any[];
  required?: boolean;
  span?: number;
  //thêm validate chuẩn hóa không bị tràn ra khỏi validate max length
  normalize?: (value: any, prevValue: any, prevValues: any) => any;
}

interface FunctionFormProps {
  title?: React.ReactNode;
  formItems: IFormItem[];
  form?: any;
  labelCol?: object;
  gutter?: [number, number];
  headerActions?: React.ReactNode;
}

const appendSelectWithDisabledOptionsRule = (
  rules: any[] | undefined,
  _component: React.ReactNode,
) => {
  return rules;
};

export const FunctionForm: React.FC<FunctionFormProps> = ({
  title,
  formItems,
  form,
  labelCol,
  gutter = [24, 12],
  headerActions
}) => {
  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        padding: "1rem 0",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{title}</h1>
        {headerActions && <div>{headerActions}</div>}
      </div>

      <StyledForm
        form={form}
        layout="horizontal"
        requiredMark={true}
      >
        <Row gutter={gutter}>
          {formItems.map((item, index) => (
            <Col span={item.span || 8} key={index}>
              <StyledForm.Item
                label={item.label}
                name={item.name}
                rules={appendSelectWithDisabledOptionsRule(item.rules, item.component)}
                required={item.required}
                //thêm validate chuẩn hóa không bị tràn ra khỏi validate max length
                normalize={item.normalize}
                labelCol={typeof labelCol === "object" ? labelCol : { flex: "0 0 150px" }}
                wrapperCol={{ flex: "1" }}
              >
                {item.component}
              </StyledForm.Item>
            </Col>
          ))}
        </Row>
      </StyledForm>
    </div>
  );
};

export default FunctionForm;
