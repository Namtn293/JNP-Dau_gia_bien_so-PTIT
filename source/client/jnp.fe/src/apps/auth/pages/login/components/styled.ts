import styled from "styled-components";

export const LoginContainer = styled.div<{ $isRegistering?: boolean }>`
  width: 100%;
  max-width: ${(props) => (props.$isRegistering ? "520px" : "480px")};
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: ${(props) => (props.$isRegistering ? "36px 36px 32px" : "42px 40px")};
  box-shadow: 0 24px 50px -12px rgba(37, 107, 140, 0.22), 0 0 0 1px rgba(156, 202, 222, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
`;

export const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 800;
    color: #123d50;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
  }

  p {
    font-size: 13.5px;
    color: #586979;
    margin: 0;
    line-height: 1.5;
  }
`;

export const GoogleAccountCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 20px;

  .google-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .google-details {
    flex: 1;
    min-width: 0;

    .name {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      font-size: 12px;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
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

