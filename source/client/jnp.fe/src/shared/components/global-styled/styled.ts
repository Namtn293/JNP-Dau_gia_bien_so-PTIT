import styled from 'styled-components';

export const Height = styled.div<{ size?: string }>`
  height: ${(props) => props.size || '1.2rem'};
`;