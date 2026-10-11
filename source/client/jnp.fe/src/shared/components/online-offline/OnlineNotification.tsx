import { CloseOutlined, WifiOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon, Wrapper } from './styled';
let counter = 0;

interface IOnlineNotification {
  online: boolean;
}

export const OnlineNotification = ({ online }: IOnlineNotification) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [_counter, setCounter] = useState<number>(counter);

  const handleClose = () => {
    if (wrapperRef.current) {
      wrapperRef.current.remove();
    }
  };

  useEffect(() => {
    if (online) {
      setCounter((prevState) => {
        counter = prevState + 1;
        return prevState + 1;
      });
    }
  }, [online]);

  useEffect(() => {
    //Tự động đóng thông báo
    if (online && _counter > 1) {
      setTimeout(handleClose, 15000);
    }
  }, [_counter, online]);

  //Bỏ qua trường hợp kết nối lần đầu
  if (_counter <= 1) return null;

  return (
    <div>
      <Wrapper ref={wrapperRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <WifiOutlined style={{ color: 'var(--primary)', fontSize: '2rem' }} />
          <span style={{ fontSize: '15px', whiteSpace: 'nowrap' }}>
            Đã khôi phục kết nối Internet.
          </span>
        </div>
        <CloseIcon onClick={handleClose}>
          <CloseOutlined style={{ fontSize: '1.4rem' }} />
        </CloseIcon>
      </Wrapper>
    </div>
  );
};