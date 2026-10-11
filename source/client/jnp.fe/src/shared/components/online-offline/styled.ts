import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  position: fixed;
  bottom: 2rem;
  left: 4rem;
  background-color: #fff;
  width: 30rem;
  height: 6.8rem;
  box-shadow: 0 0.8rem 2rem 0 rgba(0, 0, 0, 0.2), 2px 4px 0 rgba(0, 0, 0, 0.1);
  padding: 1.6rem;
  border-radius: 0.8rem;
  animation: slideTo 0.25s linear;
  z-index: 10000000;

  @keyframes slideTo {
    from {
      bottom: -6.8rem;
    }
    to {
      bottom: 2rem;
    }
  }
`;

export const CloseIcon = styled.button`
  background-color: rgb(238, 240, 245);
  border-radius: 100%;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--hover-primary);
  }
`;
