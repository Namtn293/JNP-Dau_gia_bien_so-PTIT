import notfoundbg from "@assets/images/404.png";
import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  height: var(--device-height);
  background-image: url(${notfoundbg});
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
`;

export const Content = styled.div`
  position: absolute;
  top: 66%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;

  h2 {
    color: var(--white);
    font-weight: 500;
    font-size: 3.7rem;
    line-height: 5.8rem;
    margin-bottom: 2.4rem;
  }
`;
