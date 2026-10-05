import useI18n from "@/shared/hooks/useI18n";
import type { TableProps } from "antd";
import { Skeleton, Table } from "antd";
import { forwardRef, useEffect, useRef, useState } from "react";
import { TableWrapper } from "./styled";

export interface ITreeTableWithPagination<T = any> extends TableProps<T> {
  bodyHeight?: string | number;
  paginationBackground?: string;
  onRow?: any;
  rowKey?: string | ((record: T) => string);
  expandable?: TableProps<T>["expandable"];
  expandIconColumnIndex?: number;
}

const TreeTableWithPagination = (
  {
    bodyHeight,
    paginationBackground,
    pagination,
    columns,
    dataSource,
    loading,
    rowKey,
    expandable,
    expandIconColumnIndex,
    ...props
  }: ITreeTableWithPagination,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const [_pageSize, setPageSize] = useState<number>(
    (pagination && pagination?.pageSize) || 10
  );
  const { t } = useI18n();

  const hasRestoredRef = useRef(false);
  const initialMountRef = useRef(true);

  // Auto-restore pagination state globally
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
            pagination.onChange(savedCurrent, savedPageSize);
          }
        }
      }
    } catch (e) {
      // Bỏ qua lỗi
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

  const _dataSource = loading
    ? new Array(_pageSize).fill(null).map((_, index) => ({ key: index }))
    : dataSource;

  const _columns = loading
    ? columns?.map((c) => {
        return {
          ...c,
          render: () => <Skeleton.Input size="small" active block />,
        };
      })
    : columns;

  useEffect(() => {
    if (pagination && pagination.pageSize !== undefined) {
      setPageSize(pagination?.pageSize || 10);
    }
  }, [pagination]);

  return (
    <TableWrapper
      ref={ref}
      paginationBackground={paginationBackground}
      $bodyHeight={bodyHeight}
    >
      <Table
        columns={_columns}
        dataSource={_dataSource}
        rowKey={rowKey || "id"}
        pagination={
          pagination === false
            ? false
            : {
                total: (typeof pagination === 'object' && pagination?.total) || dataSource?.length,
                showSizeChanger: true,
                pageSize: _pageSize,
                showTotal: (total, range) =>
                  t("total_items", {
                    from: range[0],
                    to: range[1],
                    total,
                  }),
                locale: {
                  items_per_page: t("items_per_page"),
                },
                responsive: true,
                onShowSizeChange: (_, size) => setPageSize(size),
                ...(typeof pagination === 'object' ? pagination : {}),
                onChange: (page, pageSize) => {
                  if (loading) return; // Prevent auto-reset during loading
                  if (typeof pagination === 'object' && pagination?.onChange) {
                    pagination.onChange(page, pageSize);
                  }
                },
              }
        }
        expandable={expandable}
        expandIconColumnIndex={
          expandIconColumnIndex !== undefined ? expandIconColumnIndex : 1
        }
        {...props}
      />
    </TableWrapper>
  );
};

export default forwardRef<HTMLDivElement, ITreeTableWithPagination>(
  TreeTableWithPagination
);
