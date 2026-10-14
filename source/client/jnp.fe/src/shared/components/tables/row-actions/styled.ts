import styled from 'styled-components';

export const RowButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  position: absolute;
  top: 50%;
  right: 0;
  padding: 0 1.2rem;
  transform: translateY(-50%);
  background: var(--table-row-hover-color);
`;

export const RowActionButton = styled.div`
  border-radius: 999px;
  cursor: pointer;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  &:hover {
    background-color: #d7ffe4;
  }
`;
