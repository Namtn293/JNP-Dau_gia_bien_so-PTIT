import type { TFilter } from "../types";

export const getFilterAfterDeleteLastItem = (
  filter: TFilter,
  currentPageSize: number,
): TFilter => {
  if (currentPageSize === 1 && (filter.page as number) > 1) {
    return {
      ...filter,
      page: (filter.page as number) - 1,
    };
  }

  return filter;
};
