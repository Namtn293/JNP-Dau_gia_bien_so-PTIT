import { Modal } from 'antd';
import styled from 'styled-components';

interface HeaderWrapperProps {
  $sidebarCollapsed: boolean;
  backgroundImage?: string;
}


export const HeaderWrapper = styled.header<HeaderWrapperProps>`
  position: fixed;
  top: 0;
  left: 0; 
  right: 0;
  width: 100%; /* Header kéo dài toàn bộ chiều rộng */
  height: var(--header-admin-height);
  background-color: #ef5c5cff;
  // border-bottom: 1px solid var(--border-primary);
  z-index: 90; /* Tăng z-index để header ở trên sidebar */
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0);
   /* Background image setup */
  background-image: url(${props => props.backgroundImage || '/backgroundTrongDong.png'});
 
  /* Overlay for better text readability */
  // position: relative;
  
   
  /* Ensure content is above overlay */
  > * {
    position: relative;
    z-index: 2;
  }
  
`;
export const ModalThongTinWrapper = styled(Modal)`
 
 .ant-modal .ant-modal-content
 {
  padding: 12px !important;
 }
`;
export const HeaderContent = styled.div`
  height: 100%;
  padding: 0 7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;

  .header-left {
    h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.8rem;
      font-weight: 600;
    }
  }
  .ant-avatar {
    background: var(--design-primary);
   
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .notification-btn {
      color: var(--text-secondary);
      font-size: 1.8rem;

      &:hover {
        color: var(--primary);
        // background-color: var(--bg-hover-primary);
      }
    }

    .user-info {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0.8rem 1.2rem;
      border-radius: 0.8rem;
      transition: background-color 0.2s ease;

      &:hover {
        // background-color: var(--bg-hover-primary);
      }

      span {
        color: var(--text-primary);
        font-weight: 500;
        // dài quá cho ngắn lại ...
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }
    }
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .ant-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

export const HeaderIconButton = styled.button`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--design-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: rgba(122, 31, 54, 0.08);
    box-shadow: 0 4px 10px rgba(122, 31, 54, 0.1);
  }

  .anticon {
    font-size: 24px;
    line-height: 1;
  }
`;


export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
`

export const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

export const LogoImage = styled.img`
  width:45px;
  height: 45px;
  object-fit: contain;
  flex-shrink: 0;
`

export const PartnerLogo = styled.img`
  width: 45px;
  height: 45px;
  object-fit: contain;
  flex-shrink: 0;
`

export const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const MainTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #e31c1c;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  
  /* Improve clarity on zoom */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

export const SubTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* Improve clarity on zoom */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);

  @media (max-width: 768px) {
    font-size: 12px;
  }
`

export const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666666;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  .notification-btn {
    color: #333333;
    font-size: 18px;

    &:hover {
      color: #e31c1c;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    span {
      font-size: 14px;
      color: #333333;
      // dài quá cho ngắn lại ...
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }
  }

  @media (max-width: 768px) {
    gap: 12px;

    .user-info {
      display: none;
    }
  }
    `

//     export const GlobalNotificationStyle = styled.div`
//   .notification-dropdown {
//     width: 420px !important;
//   }

//   .notification-dropdown .ant-dropdown {
//     width: 100%;
//   }

//   .notification-dropdown .ant-dropdown-menu {
//     padding: 0;
//   }

//   .notification-dropdown .notification-container {
//     width: 100%;
//     max-height: 500px;
//     display: flex;
//     flex-direction: column;
//   }

//   .notification-dropdown .notification-header {
//     padding: 10px 12px;
//     border-bottom: 1px solid #f0f0f0;
//     font-weight: 600;
//     display: flex;
//     justify-content: space-between;
//   }

//   .notification-dropdown .notification-list {
//     overflow-y: auto;
//     max-height: 420px;
//   }

//   .notification-dropdown .ant-list-item {
//     padding: 10px 12px;
//   }

// .notification-container {
//   width: 100%;
//   max-height: 500px;
//   display: flex;
//   flex-direction: column;
// }

// .notification-header {
//   padding: 10px 12px;
//   border-bottom: 1px solid #f0f0f0;
//   font-weight: 600;
//   display: flex;
//   justify-content: space-between;
// }

// .notification-list {
//   overflow-y: auto;
//   max-height: 420px;
// }
// `;
