import type { TableProps } from "antd";
import { Skeleton, Table } from "antd";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { TableWrapper } from "./styled";

export interface ITableWithPagination<T = any> extends TableProps<T> {
  bodyHeight?: string | number;
  paginationBackground?: string;
  onRow?: any;
  hidePaginationTotal?: boolean;
  hidePageSizeChanger?: boolean;
}

const TableWithPagination = (
  {
    bodyHeight,
    paginationBackground,
    pagination,
    columns,
    dataSource,
    loading,
    hidePaginationTotal,
    hidePageSizeChanger,
    scroll,
    ...props
  }: ITableWithPagination,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const [_pageSize, setPageSize] = useState<number>(
    (pagination && pagination?.pageSize) || 10
  );

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const hasRestoredRef = useRef(false);
  const initialMountRef = useRef(true);

  // Auto-restore pagination state globally cho TẤT CẢ các bảng
  useEffect(() => {
    if (typeof pagination !== 'object' || !pagination?.onChange) {
      hasRestoredRef.current = true;
      return;
    }
    
    try {
      const storageKey = `auto_pagination_state_${window.location.pathname}`;
      const saved = sessionStorage.getItem(storageKey);
      
      if (saved && !hasRestoredRef.current) {
        const parsed = JSON.parse(saved);
        const savedCurrent = parsed.current;
        const savedPageSize = parsed.pageSize;
        
        if (savedCurrent && savedPageSize) {
          if (pagination.current !== savedCurrent || pagination.pageSize !== savedPageSize) {
            // Ép component cha cập nhật lại state đúng bằng trang đã lưu!
            pagination.onChange(savedCurrent, savedPageSize);
          }
        }
      }
    } catch (e) {
      // Bỏ qua lỗi parse
    }
    
    hasRestoredRef.current = true;
  }, []);

  // Auto-save pagination state
  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    
    if (hasRestoredRef.current && typeof pagination === 'object' && pagination?.current) {
      try {
        const storageKey = `auto_pagination_state_${window.location.pathname}`;
        sessionStorage.setItem(storageKey, JSON.stringify({
          current: pagination.current,
          pageSize: pagination.pageSize || 10
        }));
      } catch (e) {
        // Bỏ qua lỗi
      }
    }
  }, [
    pagination && typeof pagination === 'object' ? pagination.current : undefined, 
    pagination && typeof pagination === 'object' ? pagination.pageSize : undefined
  ]);

  // Disable tabindex trên tất cả các cell trong bảng
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const cells = container.querySelectorAll<HTMLElement>(
      ".ant-table-thead th, .ant-table-tbody td, .ant-table-summary td"
    );
    cells.forEach((cell) => {
      if (cell.classList.contains("action-column")) return;

      cell.setAttribute("tabindex", "-1");
    });
  }, [dataSource, columns, loading]);

  const _dataSource = loading
    ? new Array(_pageSize).fill(null).map((_, index) => ({ key: index }))
    : dataSource;

  const _columns = loading
    ? columns?.map((c) => ({
      ...c,
      render: () => (
        <Skeleton.Input
          size="small"
          active
          block
          style={{ pointerEvents: "none" }}
        />
      ),
    }))
    : columns;

  useEffect(() => {
    if (pagination && pagination.pageSize !== undefined) {
      setPageSize(pagination?.pageSize || 10);
    }
  }, [pagination]);

  const _scroll = useMemo(() => {
    if (!scroll) return undefined;
    if (!_dataSource || _dataSource.length === 0) {
      const { y, ...rest } = scroll;
      return Object.keys(rest).length > 0 ? rest : undefined;
    }
    return scroll;
  }, [scroll, _dataSource]);

  return (
    <TableWrapper
      ref={(node) => {
        tableContainerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      paginationBackground={paginationBackground}
      $bodyHeight={bodyHeight}
    >
      <Table
        loading={loading}
        columns={_columns}
        dataSource={_dataSource}
        pagination={
          pagination === false
            ? false
            : {
                total: (typeof pagination === 'object' && pagination?.total) || dataSource?.length,
                showSizeChanger: !hidePageSizeChanger,
                pageSize: _pageSize,
                showTotal: hidePaginationTotal
                  ? undefined
                  : (total, range) => `${range[0]}- ${range[1]} trong số ${total}`,
                responsive: true,
                onShowSizeChange: (_, size) => setPageSize(size),
                ...(typeof pagination === 'object' ? pagination : {}),
                onChange: (page, pageSize) => {
                  // KHÔNG cho phép Ant Design tự động reset về trang 1 khi dữ liệu đang loading (lúc này total tạm thời bằng 0)
                  if (loading) return;
                  
                  if (typeof pagination === 'object' && pagination?.onChange) {
                    pagination.onChange(page, pageSize);
                  }
                },
              }
        }
        scroll={_scroll}
        {...props}
      />
    </TableWrapper>
  );
};

export default forwardRef<HTMLDivElement, ITableWithPagination>(
  TableWithPagination
);