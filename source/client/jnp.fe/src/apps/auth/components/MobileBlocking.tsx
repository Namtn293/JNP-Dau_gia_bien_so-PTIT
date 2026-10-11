import useI18n from '@/shared/hooks/useI18n';
import { DesktopOutlined } from '@ant-design/icons';
import { MobileBlockWrapper } from '@apps/auth/styled';
import React from 'react';

const MobileBlocking: React.FC = () => {
  const { t } = useI18n();

  return (
    <MobileBlockWrapper>
      <div className="icon-box">
        <DesktopOutlined />
      </div>
      <h2>{t("mobile_block.title")}</h2>
      <div className="divider" />
      <p>
        {t("mobile_block.message_1")}
      </p>
      <p>
        {t("mobile_block.message_2")}
      </p>
    </MobileBlockWrapper>
  );
};

export default MobileBlocking;
