import { PlusCircleOutlined } from '@ant-design/icons';
import { Wrapper } from './styled';
import type { ReactNode } from 'react';

interface IFooterButton {
  label?: ReactNode;
  icon?: ReactNode;
  onClick?: () => {};
  border?: boolean;
  style?: object;
}

const FooterButton = ({ label, icon, onClick, border = true, style }: IFooterButton) => {
  return (
    <Wrapper border={border} onClick={onClick} style={style} className="table-footer-button">
      {icon ? icon : <PlusCircleOutlined style={{ color: 'var(--primary)' }} />}
      <span>{label}</span>
    </Wrapper>
  );
};

export default FooterButton;
