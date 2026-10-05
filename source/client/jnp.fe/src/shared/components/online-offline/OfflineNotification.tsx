import { CloseOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import { CloseIcon, Wrapper } from './styled';
import DisabledConnectionIcon from '@assets/icons/DisabledConnectionIcon';

export const OfflineNotification = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (wrapperRef.current) {
      wrapperRef.current.remove();
    }
  };

  return (
    <div>
      <Wrapper ref={wrapperRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <DisabledConnectionIcon size={24} color="rgb(188, 192, 196)" />
          <span>Bạn đang offline.</span>
        </div>
        <CloseIcon onClick={handleClose}>
          <CloseOutlined style={{ fontSize: '1.4rem' }} />
        </CloseIcon>
      </Wrapper>
    </div>
  );
};