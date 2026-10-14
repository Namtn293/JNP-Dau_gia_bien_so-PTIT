import type { ColumnType } from "antd/es/table";

export type TableColumn<T> = Omit<ColumnType<T>, "dataIndex"> & {
  dataIndex?: keyof T;
  hidden?: boolean;
  disabled?: boolean | ((record: T) => boolean);
};

export type TableColumns<T> = TableColumn<T>[];

export type LabelInValueOption = { value: number; label: string };
