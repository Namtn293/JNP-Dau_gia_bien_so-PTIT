import { Spin } from 'antd';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import { SpinContainer } from './styled';

const SuspenseFallback = () => {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    NProgress.start();

    return () => {
      NProgress.done();
    };
  });

  return (
    <SpinContainer>
      <Spin />
      <span>Đang tải, vui lòng đợi...</span>
    </SpinContainer>
  );
};

export default SuspenseFallback;
