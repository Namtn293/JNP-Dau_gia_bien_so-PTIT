import { Link } from "@tanstack/react-router";
import styled from "styled-components";

export const MenuButtonWrapper = styled.div`
 display: flex;
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
  // padding: 4px;
  padding: 4px 4px 0 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: rgba(122, 31, 54, 0.08);
    box-shadow: 0 4px 10px rgba(122, 31, 54, 0.1);
  }

  .anticon,
  svg {
    width: 24px;
    height: 24px;
    font-size: 24px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

export const AppName = styled.span`
  font-weight: 500;
  font-size: 1.4rem;
  line-height: 24px;
  padding-inline: 1.2rem;
  /* color: var(--text-primary); */
`;

export const AppLogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 140px;
  height: 140px;
  text-align: center;
  border-radius: 4px;
  ${(props) => (props.disabled ? "pointer-events: none; opacity: 0.5; filter: grayscale(100%);" : "")}

  &:hover {
    background-color: ${(props) => (props.disabled ? "transparent" : "var(--hover-secondary)")};
    box-shadow: ${(props) => (props.disabled ? "none" : "px 2px 8px 3px rgba(0, 0, 0, 0.2)")};

    ${AppName} {
      color: ${(props) => (props.disabled ? "inherit" : "var(--primary)")};
    }
  }

  img {
    margin-bottom: 1.2rem;
    width: 40px;
    height: 40px;
  }
`;

export const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 16px;
`;

export const MenuTitle = styled.span`
  font-weight: 500;
  font-size: 1.8rem;
  line-height: 3rem;
  position: relative;
  top: 1px;
`;

export const MenuWrapper = styled.div`
  background-color: var(--bg-primary);
  /* box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12); */
  z-index: 100;
  .ant-row {
    padding: 10px 16px !important;
    align-items: center !important;
  }
 

`;
