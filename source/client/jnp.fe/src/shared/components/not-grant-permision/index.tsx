import { Card } from 'antd';

export const NotGrantPermission = () => {
  return (
    <Card 
      style={{ 
        width: '100%', 
        height: 'calc(100vh - var(--header-admin-height) )',
        textAlign: 'center',
      }}
    >
      <div 
        style={{
          fontSize: '34px',
          fontWeight: 500,
          color: 'var(--error)',
          padding: '40px 20px',
          lineHeight: 1.4
        }}
      >
        Bạn không được phân quyền cho trang này
      </div>
    </Card>
  )
}
export default NotGrantPermission;