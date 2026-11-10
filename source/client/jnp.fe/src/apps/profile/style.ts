import styled from "styled-components";

export const ProfilePageContainer = styled.div`
  min-height: 100vh;
  background: #f4f8fa;
  color: #14202b;
  font-family: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
`;

export const ProfileMainContent = styled.main`
  flex: 1;
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 18px 48px 18px;
  box-sizing: border-box;

  .breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #64748b;
    margin-bottom: 20px;

    a {
      color: #256b8c;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .top-cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: stretch;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }
`;

