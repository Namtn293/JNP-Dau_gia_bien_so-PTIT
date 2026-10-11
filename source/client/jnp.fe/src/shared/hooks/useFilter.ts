import useI18n from "@/shared/hooks/useI18n";
import type { IBaseFilter } from "@shared/types";
import { useState, useEffect } from "react";
import { normalizeTrimSpace } from "@shared/utils";

const useFilter = <T extends IBaseFilter = IBaseFilter>(initialFilter: T, storageKey?: string) => {
  const [filter, setFilter] = useState<T>(() => {
    if (storageKey) {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Ignore
        }
      }
    }
    return initialFilter;
  });

  useEffect(() => {
    if (storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify(filter));
    }
  }, [filter, storageKey]);
  const { t } = useI18n();

  const handleFilter = (values: any) => {
    setFilter(normalizeTrimSpace({
      ...initialFilter,
      ...values,
    }));
  };

  const handleClearFilter = () => {
    setFilter(initialFilter);
  };

  const pagination = (totalRecords?: number) => ({
    current: filter.page,
    pageSize: filter.pageSize,
    total: totalRecords,
    showSizeChanger: true,

    onChange: (page: number, pageSize: number) => {
      setFilter((prev: T) => ({
        ...prev,
        page,
        pageSize,
      }));
    },
    showTotal: (total, range) =>
      t("total_items", {
        from: range[0],
        to: range[1],
        total,
      }),
    locale: {
      items_per_page: t("items_per_page"),
    },
    onShowSizeChange: (_: number, pageSize: number) => {
      setFilter((prev: T) => ({
        ...prev,
        page: 1,
        pageSize,
      }));
    },
  });

  return { filter, setFilter, handleClearFilter, pagination, handleFilter };
};

export default useFilter;
