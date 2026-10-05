import styled from 'styled-components';

export const Wrapper = styled.div<{ border?: boolean }>`
  display: flex;
  align-items: center;
  color: var(--primary);
  gap: 1rem;
  cursor: pointer;
  height: var(--table-row-height);
  ${(props) => (props.border ? 'border: 1px solid var(--border-primary);' : '')}
  border-top: none;
  padding: 1.2rem;
`;
