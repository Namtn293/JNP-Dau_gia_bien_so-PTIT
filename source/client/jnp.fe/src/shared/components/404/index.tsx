import { Button } from 'antd';
import { Link } from '@tanstack/react-router'
import { Content, Wrapper } from './styled';

const NotFound404 = () => {
  return (
    <Wrapper>
      <Content>
        <h2>Xin lỗi, địa chỉ bạn truy cập không tồn tại.</h2>
        <Link to="/">
          <Button type="primary">Về trang chủ</Button>
        </Link>
      </Content>
    </Wrapper>
  );
};

export default NotFound404;
