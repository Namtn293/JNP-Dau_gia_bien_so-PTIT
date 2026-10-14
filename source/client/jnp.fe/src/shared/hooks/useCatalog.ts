import { ADMIN_API_PREFIX } from '@/configs/api-config';
import axiosClient from '@/configs/axios';
import queryClient from '@/configs/reactQuery';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';

type CatalogItem = {
  id?: number | string;
  capCon?: CatalogItem[];
  [key: string]: any;
};

type CatalogAppType = 'kcnkkt' | 'xtdt';
const CATALOG_PAGE_SIZE = 2147483647;

const mapCatalogData = (items: CatalogItem[], labelField: string, result: Record<number, string> = {}) => {
  items.forEach(({ id, capCon, ...item }) => {
    if (id !== undefined && id !== null) {
      result[Number(id)] = item[labelField] ?? '';
    }

    if (Array.isArray(capCon)) {
      mapCatalogData(capCon, labelField, result);
    }
  });

  return result;
};

/**
 * Hook dùng chung để lấy danh mục từ 2 DB (KCNKKT hoặc XTDT)
 * @param tableName Tên bảng hoặc Mảng tên bảng (Controller) ví dụ: 'LinhVuc', ['TrangThai', 'LoaiVanBan']
 * @param appType Loại ứng dụng: 'kcnkkt' hoặc 'xtdt'
 */
export const useCatalog = (
  tableName: string | string[],
  appTypeOrLabelField: CatalogAppType | string = 'kcnkkt',
  labelField = 'ten'
) => {
  const isAppType = appTypeOrLabelField === 'kcnkkt' || appTypeOrLabelField === 'xtdt';
  const appType = (isAppType ? appTypeOrLabelField : 'kcnkkt') as CatalogAppType;
  const displayField = isAppType ? labelField : appTypeOrLabelField;
  const isArray = Array.isArray(tableName);
  const tableNames = useMemo(() => (isArray ? tableName : [tableName]), [tableName, isArray]);

  // Sử dụng useQueries để fetch nhiều danh mục cùng lúc
  const results = useQueries(
    tableNames.map((name) => ({
      queryKey: ['catalog', appType, name, displayField],
      queryFn: async () => {
        const response = await axiosClient.get(`${ADMIN_API_PREFIX}/${name}`, {
          params: {
            page: 1,
            pageSize: CATALOG_PAGE_SIZE,
          },
        });
        return mapCatalogData(Array.isArray(response?.data) ? response.data : [], displayField);
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!name && !!appType,
    }))
  );

  // Gộp dữ liệu từ các query thành một object map lớn
  const allCatalogsData = useMemo(() => {
    const dataMap: Record<string, Record<number, string>> = {};
    tableNames.forEach((name, index) => {
      if (results[index].data) {
        dataMap[name] = results[index].data as Record<number, string>;
      }
    });
    return dataMap;
  }, [results, tableNames]);

  // State lưu thêm các options lấy từ lịch sử (Mới)
  const [historyOptions, setHistoryOptions] = useState<Record<string, Record<number, string>>>({});

  // Effect lắng nghe sự kiện "Nhện vô hình" phát hiện ra RootId bị thiếu
  useEffect(() => {
    let isMounted = true;
    const handleMissingHistory = async () => {
      if (!isKcnKktOrXtdtApp()) return;

      // Lọc ra các item thuộc về bảng đang được hook này quản lý
      const itemsToFetch = globalMissingHistoryQueue.filter(x => tableNames.includes(x.catalogType));
      if (itemsToFetch.length === 0) return;

      const newOptions: Record<string, Record<number, string>> = {};
      let hasUpdate = false;

      // Promise.all để gọi API song song siêu tốc
      await Promise.all(
        itemsToFetch.map(async (item) => {
          // Nếu id đã có trong danh sách active rồi thì thôi
          const activeList = allCatalogsData[item.catalogType] || {};
          if (activeList[item.id]) return;

          try {
            const res = await axiosClient.get(`${ADMIN_API_PREFIX}/${item.catalogType}/root/${item.rootId}/lich-su`);
            const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            const oldItem = items.find((x: any) => Number(x.id) === item.id);
            if (oldItem) {
              if (!newOptions[item.catalogType]) newOptions[item.catalogType] = {};
              newOptions[item.catalogType][item.id] = oldItem.ten;
              hasUpdate = true;

              // [AUTO-DISCOVERY] Tự động tìm và cập nhật dữ liệu lịch sử vào tất cả các React Query Cache liên quan.
              // Logic nhận diện: Dựa trên dữ liệu đang active của danh mục để định danh mảng dữ liệu trong cache
              const activeMap = allCatalogsData[item.catalogType] || {};
              const activeIds = Object.keys(activeMap).map(Number);

              if (activeIds.length > 0) {
                const queries = queryClient.getQueryCache().getAll();

                queries.forEach(query => {
                  const oldData = query.state.data as any;
                  if (!oldData) return;

                  // Lấy mảng dữ liệu thực tế từ cấu trúc response
                  const dataArr = Array.isArray(oldData) ? oldData : (Array.isArray(oldData.data) ? oldData.data : (Array.isArray(oldData.items) ? oldData.items : null));

                  if (Array.isArray(dataArr) && dataArr.length > 0) {
                    // Fingerprint: Lấy tối đa 5 phần tử đầu tiên để kiểm tra độ khớp
                    const sampleItems = dataArr.slice(0, 5);

                    // Lọc ra các phần tử khớp hoàn toàn ID và Tên với danh mục active hiện tại
                    const exactMatches = sampleItems.filter(x => x && x.id && x.ten && activeIds.includes(Number(x.id)) && activeMap[Number(x.id)] === x.ten);

                    // Nếu tất cả các phần tử mẫu hợp lệ đều khớp chính xác, xác nhận đây là cache của danh mục tương ứng
                    const validSamplesCount = sampleItems.filter(x => x && x.id && x.ten).length;
                    if (validSamplesCount > 0 && exactMatches.length === validSamplesCount) {

                      // Bổ sung bản ghi lịch sử vào danh sách nếu chưa tồn tại
                      if (!dataArr.some((x: any) => Number(x.id) === Number(item.id))) {
                        const clonedOldItem = { ...oldItem, id: Number(item.id) };
                        const newArr = [...dataArr, clonedOldItem];

                        // Cập nhật lại cache với cấu trúc dữ liệu nguyên bản
                        const newData = Array.isArray(oldData) ? newArr :
                          Array.isArray(oldData.data) ? { ...oldData, data: newArr } :
                            { ...oldData, items: newArr };

                        queryClient.setQueryData(query.queryKey, newData);
                      }
                    }
                  }
                });
              }
            }
          } catch (e) { }
        })
      );

      if (hasUpdate && isMounted) {
        setHistoryOptions((prev) => {
          const merged = { ...prev };
          Object.keys(newOptions).forEach(cat => {
            merged[cat] = { ...(merged[cat] || {}), ...newOptions[cat] };
          });
          return merged;
        });
      }
    };

    handleMissingHistory(); // Chạy lần đầu
    window.addEventListener('catalogMissingHistoryUpdated', handleMissingHistory);
    return () => {
      isMounted = false;
      window.removeEventListener('catalogMissingHistoryUpdated', handleMissingHistory);
    };
  }, [tableNames, allCatalogsData]);

  // Gộp cả danh sách active và danh sách lấy từ lịch sử
  const finalCatalogsData = useMemo(() => {
    const merged = { ...allCatalogsData };
    Object.keys(historyOptions).forEach(cat => {
      merged[cat] = { ...(merged[cat] || {}), ...historyOptions[cat] };
    });
    return merged;
  }, [allCatalogsData, historyOptions]);

  // Hàm lấy tên từ một danh mục cụ thể
  const getName = useCallback(
    (targetTable: string, id: number | string | undefined | null): string => {
      if (!id) return '';
      return finalCatalogsData[targetTable]?.[Number(id)] || '';
    },
    [finalCatalogsData]
  );


  // Options dành cho Select (nếu chỉ truyền 1 tableName)
  const options = useMemo(() => {
    if (isArray || !tableName) return [];
    const record = finalCatalogsData[tableName as string];
    if (!record) return [];

    return Object.keys(record).map((key) => ({
      value: Number(key),
      label: record[Number(key)],
    }));
  }, [finalCatalogsData, isArray, tableName]);

  return {
    isLoading: results.some((r) => r.isLoading),
    isFetching: results.some((r) => r.isFetching),
    isError: results.some((r) => r.isError),
    allCatalogsData: finalCatalogsData,
    options,
    catalogData: isArray ? undefined : finalCatalogsData[tableName as string],
    getName,
    getNameFromList: (id: any, data: any) => {
      if (!data || id === undefined || id === null) return '';
      return (data as any)[Number(id)] || '';
    },
    refresh: () => results.forEach((r) => r.refetch()),
  };
};
