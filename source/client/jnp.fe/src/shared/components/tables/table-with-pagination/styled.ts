import styled from "styled-components";

export const TableWrapper = styled.div<{
  $bodyHeight?: string | number;
  paginationBackground?: string;
}>`
  ${(props) =>
    props && props.$bodyHeight
      ? `.ant-table-body {
          height: ${props.$bodyHeight ?? "100%"} ;
        }`
      : ""}

  ${(props) =>
    props.paginationBackground
      ? `.ant-pagination.ant-table-pagination {
          background-color: ${props.paginationBackground};
        }`
      : ""}

  .ant-pagination-options,
  .ant-pagination-options-size-changer,
  .ant-select-selector {
    cursor: pointer !important;
  }

  /* Border cho hàng cuối cùng */
  .ant-table-tbody > tr:last-child > td {
    border-bottom: 0px solid var(--border-primary) !important;
  }

  /* Border cho table wrapper */
  .ant-table-wrapper .ant-table {
    border-bottom: 1px solid var(--border-primary);
    border-radius: 8px;
  }

  .ant-table-thead > tr > th {
    background-color: var(--primary) !important;
    color: #fff !important;

    /* (VI): Tùy chỉnh mũi tên sort cho toàn bộ hệ thống */
    .ant-table-column-sorters {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important; /* Đính mũi tên sang bên phải */
      width: 100% !important;

      .ant-table-column-title {
        flex: 1 !important;
        color: #fff !important;
      }

      .ant-table-column-sorter {
        color: #fff !important;
        margin-left: 8px !important;

        .ant-table-column-sorter-inner {
          color: #fff !important;

          .ant-table-column-sorter-up,
          .ant-table-column-sorter-down {
            color: #fff !important;
            opacity: 0.5; /* Mặc định mờ */

            &.active {
              color: #fff !important;
              opacity: 1 !important;
            }
          }
        }
      }
    }

    /* Ẩn mũi tên không hoạt động khi đang sort */
    &:has(.ant-table-column-sorter-up.active) .ant-table-column-sorter-down {
      display: none !important;
    }
    &:has(.ant-table-column-sorter-down.active) .ant-table-column-sorter-up {
      display: none !important;
    }
  }

  .ant-table-tbody > tr > td:first-child,
  .ant-table-tbody > tr > td:first-child *,
  .ant-table-tbody > tr > td:last-child,
  .ant-table-tbody > tr > td:last-child * {
    white-space: nowrap;
    word-break: normal;
    overflow-wrap: normal;
  }

  .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container {
    border-inline-start: 0px solid var(--border-primary);
    border-top: 0px solid var(--border-primary);
  }
  .ant-table-wrapper .ant-table-cell-scrollbar:not([rowspan]) {
    box-shadow: 0 0px 0 0px #e7e7e7;
  }

  .ant-table-wrapper
    .ant-table.ant-table-bordered
    > .ant-table-container
    > .ant-table-content
    > table
    > thead
    > tr
    > th:last-child,
  .ant-table-wrapper
    .ant-table.ant-table-bordered
    > .ant-table-container
    > .ant-table-header
    > table
    > thead
    > tr
    > th:last-child,
  .ant-table-wrapper
    .ant-table.ant-table-bordered
    > .ant-table-container
    > .ant-table-header
    > table
    > tbody
    > tr
    > td:last-child,
  .ant-table-wrapper
    .ant-table.ant-table-bordered
    > .ant-table-container
    > .ant-table-body
    > table
    > tbody
    > tr
    > td:last-child,
  .ant-table-wrapper
    .ant-table.ant-table-bordered
    > .ant-table-container
    > .ant-table-summary
    > table
    > tfoot
    > tr
    > td:last-child {
    border-inline-end: 0px solid var(--border-primary) !important;
  }

  /* Disable tab focus vào tất cả các ô trong bảng */
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td,
  .ant-table-summary > tr > td,
  .ant-table-thead > tr > th *,
  .ant-table-tbody > tr > td *,
  .ant-table-summary > tr > td * {
    &:focus {
      outline: none !important;
      box-shadow: none !important;
    }
  }
`;
