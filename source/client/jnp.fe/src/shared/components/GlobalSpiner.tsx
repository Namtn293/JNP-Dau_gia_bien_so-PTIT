import { Spin } from 'antd';
import { createPortal } from 'react-dom';

const GlobalSpinner = ({ loading }:{loading:boolean}) => {
  if (!loading) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,  // > Modal (1000) + Select (1050)
      }}
    >
      <Spin size="large" />
    </div>,
    document.body  // Render ngoài Modal stack
  );
};

export default GlobalSpinner;