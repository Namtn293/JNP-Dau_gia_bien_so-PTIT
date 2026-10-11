import styled from 'styled-components';

interface HeaderWrapperProps {
  sidebarCollapsed: boolean;
  backgroundImage?: string;
}


export const HeaderWrapper = styled.header<HeaderWrapperProps>`
  position: fixed;
  top: 0;
  left: 0; 
  right: 0;
  width: 100%; /* Header kéo dài toàn bộ chiều rộng */
  height: var(--header-admin-height);
  background-color: #fff;
  border-bottom: 1px solid var(--border-primary);
  z-index: 100; /* Tăng z-index để header ở trên sidebar */
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

export const HeaderContent = styled.div`
  height: 100%;
  padding: 0 6rem;
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

  .header-right {
    .notification-btn {
      color: var(--text-secondary);
      font-size: 1.8rem;

      &:hover {
        color: var(--primary);
        // background-color: var(--bg-hover-primary);
      }
    }

    .user-info {
      padding: 0.8rem 1.2rem;
      border-radius: 0.8rem;
      transition: background-color 0.2s ease;

      &:hover {
        // background-color: var(--bg-hover-primary);
      }

      span {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
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
  height: 45x;
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
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

export const SubTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

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
    }
  }

  @media (max-width: 768px) {
    gap: 12px;

    .user-info {
      display: none;
    }
  }
    `