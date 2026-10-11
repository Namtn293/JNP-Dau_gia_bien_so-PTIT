import { Space, Typography } from 'antd';
import { DataTableHeader } from './styled';

type TTableHeader = {
  tableTitle: string;
  buttonGroup?: React.ReactNode;
};

const TableHeader = ({ tableTitle, buttonGroup }: TTableHeader) => {
  return (
    <DataTableHeader>
      <Typography.Title level={5}>{tableTitle}</Typography.Title>
      <Space>{buttonGroup}</Space>
    </DataTableHeader>
  );
};

export default TableHeader;
