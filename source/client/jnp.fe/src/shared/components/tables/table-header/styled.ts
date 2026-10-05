import styled from 'styled-components';

export const DataTableWrapper = styled.div`
  background-color: var(--bg-primary);
  /* border: 1px solid var(--border-primary); */
  border-radius: 4px;
  height: 100%;
  flex: 1;
`;

export const DataTableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem;
  border: 1px solid var(--border-primary);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
`;

export const DataTableBody = styled.div`
  .ant-table {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: var(--text-primary);
    font-variant: tabular-nums;
    line-height: 1.5715;
    list-style: none;
    font-feature-settings: 'tnum', 'tnum';
    position: relative;
    font-size: 1.6rem;
    background: #fff;
    border-radius: 0px 0 4px 4px;
  }
  .ant-table-body {
    height: var(--device-height);
  }
`;
