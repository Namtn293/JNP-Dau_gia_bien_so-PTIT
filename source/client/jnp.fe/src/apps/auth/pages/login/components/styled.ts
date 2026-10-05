import styled from "styled-components";

export const LoginContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 42px 40px;
  box-shadow: 0 24px 50px -12px rgba(37, 107, 140, 0.22), 0 0 0 1px rgba(156, 202, 222, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.95);
`;

export const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 28px;

  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #123d50;
    margin: 0 0 8px;
    letter-spacing: -0.3px;
  }

  p {
    font-size: 14px;
    color: #586979;
    margin: 0;
  }
`;

export const GoogleButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid #dbe6ee;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14.5px;
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #9ccade;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;
