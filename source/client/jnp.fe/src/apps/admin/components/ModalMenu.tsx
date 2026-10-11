import BaseModal from '@shared/components/modals/index';
import { StyledTabs } from './styled';

type ModalMenuTab = {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
};

type ModalMenuProps = {
  open: boolean;
  onCancel: () => void;
  width?: number;
  tabs: ModalMenuTab[];
  footer?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
};

export default function ModalMenu({
  open,
  onCancel,
  width = 900,
  tabs,
  footer = null,
  title,
  children
}: ModalMenuProps) {
  return (
    <BaseModal
      open={open}
      onCancel={onCancel}
      hideModal={onCancel}
      title={title}
      width={width}
      footer={footer}
      showHeader={true}
      destroyOnClose
    >
      {children}

      <StyledTabs
        defaultActiveKey={tabs[0]?.key}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          children: tab.content,
        }))}
      />
    </BaseModal>
  );
}
