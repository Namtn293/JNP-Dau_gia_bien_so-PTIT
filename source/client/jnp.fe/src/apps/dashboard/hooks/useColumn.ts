import { useMemo } from "react";

export interface ColumnDefinition {
  title: string;
  key: string;
  align?: "left" | "center" | "right";
  width?: string | number;
}

export const useColumn = () => {
  const columns: ColumnDefinition[] = useMemo(
    () => [
      { title: "Biển số", key: "plate", align: "left" },
      { title: "Tỉnh thành", key: "province", align: "left" },
      { title: "Loại biển", key: "type", align: "left" },
      { title: "Trạng thái", key: "status", align: "left" },
      { title: "Giá hiện tại", key: "price", align: "right" },
      { title: "Thời gian", key: "time", align: "center" },
      { title: "Lượt đặt", key: "bids", align: "center" },
      { title: "Hành động", key: "action", align: "right" },
    ],
    []
  );

  return { columns };
};

export default useColumn;
