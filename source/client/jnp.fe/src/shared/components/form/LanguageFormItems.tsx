
import { getTenFieldProps } from '@shared/utils/modalFormUtils';

export interface LanguageFormItemOptions {
  span?: number;
  required?: boolean;
  tabIndexStart?: number;
  maxLengths?: {
    en?: number;
    cn?: number;
    jp?: number;
    kr?: number;
  };
}

export const getLanguageFormItems = (options?: LanguageFormItemOptions) => {
  const { span = 24, required = true, tabIndexStart, maxLengths } = options || {};

  return [
    {
      label: "Tên tiếng Anh",
      name: "tenEN",
      span,
      ...getTenFieldProps("Tên Tiếng Anh", "tenEN", maxLengths?.en || 255, required,
        tabIndexStart ? { tabIndex: tabIndexStart } : undefined),
    },
    {
      label: "Tên tiếng Trung",
      name: "tenCN",
      span,
      ...getTenFieldProps("Tên Tiếng Trung", "tenCN", maxLengths?.cn || 255, required,
        tabIndexStart ? { tabIndex: tabIndexStart + 1 } : undefined),
    },
    {
      label: "Tên tiếng Nhật",
      name: "tenJP",
      span,
      ...getTenFieldProps("Tên Tiếng Nhật", "tenJP", maxLengths?.jp || 255, required,
        tabIndexStart ? { tabIndex: tabIndexStart + 2 } : undefined),
    },
    {
      label: "Tên tiếng Hàn",
      name: "tenKR",
      span,
      ...getTenFieldProps("Tên Tiếng Hàn", "tenKR", maxLengths?.kr || 255, required,
        tabIndexStart ? { tabIndex: tabIndexStart + 3 } : undefined),
    },
  ];
};
