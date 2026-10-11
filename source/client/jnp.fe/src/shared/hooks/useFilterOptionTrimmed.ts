import { useCallback } from "react";

export const useFilterOptionTrimmed = () => {
  const filterOptionTrimmed = useCallback((input: string, option: any) => {
    const cleanInput = input.trim().replace(/\s+/g, " ").toLowerCase();
    const label = option?.label ?? (typeof option?.children === "string" ? option.children : "");
    return label.toLowerCase().includes(cleanInput);
  }, []);

  return filterOptionTrimmed;
};

export default useFilterOptionTrimmed;
