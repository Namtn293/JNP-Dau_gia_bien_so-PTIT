import { CloseOutlined } from "@ant-design/icons";
import type { ModalProps } from "antd";
import { Modal } from "antd";
import classNames from "classnames";
import type { ReactNode } from "react";
import {
  ModalBody,
  ModalHeader,
  ModalHeaderButton,
  ModalTitle,
  ModalTitleWrapper,
} from "./styled";

export interface IBaseModalProps extends ModalProps {
  icon?: ReactNode;
  headerHeight?: string;
  fullScreen?: boolean;
  showHeader?: boolean;
  loading?: boolean;
  hideModal?: () => void;
  fullHeight?: boolean;
}

const BaseModal = ({
  title,
  children,
  icon,
  loading,
  fullScreen,
  closeIcon,
  headerHeight = "4.8rem",
  showHeader = true,
  fullHeight,
  ...props
}: IBaseModalProps) => {
  return (
    <Modal
      width="var(--modal-width-lg)"
      className={classNames({ fullScreen })}
      centered
      closable={false}
      maskClosable={false}
      style={{
        boxShadow: "0px 2px 0.8rem 3px rgba(0, 0, 0, 0.2)",
        borderRadius: "4px",
        padding: 0,
      }}
      styles={{
        content: {
          overflow: "hidden",
        },
        body: {
          padding: 0,
          maxHeight: "var(--modal-max-height)",
          overflow: "hidden",
        },
        footer: { borderRadius: 4 },
      }}
      {...props}
      okButtonProps={{ size: "large", style: { minWidth: 100 }, ...(props.okButtonProps || {}) }}
      cancelButtonProps={{ size: "large", style: { minWidth: 100 }, ...(props.cancelButtonProps || {}) }}
      confirmLoading={loading || props.confirmLoading}
      cancelText="Hủy"
      focusTriggerAfterClose={false}
    >
      {showHeader && (
        <ModalHeader height={headerHeight}>
          <ModalTitleWrapper>
            {icon && icon}
            <ModalTitle>{title}</ModalTitle>
          </ModalTitleWrapper>

          {closeIcon ? (
            closeIcon
          ) : (
            <ModalHeaderButton
              onClick={props.hideModal ? props.hideModal : props.onCancel}
            >
              <CloseOutlined
                style={{ fontSize: "2rem", color: "var(--white)" }}
              />
            </ModalHeaderButton>
          )}
        </ModalHeader>
      )}

      <ModalBody className="modal-body">{children}</ModalBody>
    </Modal>
  );
};

export default BaseModal;
