import { useState, useEffect, useMemo } from "react";
import { message } from "antd";
import type { AuctionItem, AuctionStatus } from "../services/type";
import { INITIAL_AUCTION_DATA } from "../utils/constants";
import { formatMoney } from "../utils/format";

export const useAuctionData = () => {
  const [data, setData] = useState<AuctionItem[]>(INITIAL_AUCTION_DATA);
  const [tab, setTab] = useState<AuctionStatus>("live");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "board">("grid");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [plateType, setPlateType] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("time");
  const [selectedPlate, setSelectedPlate] = useState<AuctionItem | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [tab, search, province, plateType, sortBy]);

  // Countdown timer for live and upcoming auctions
  useEffect(() => {
    const timer = setInterval(() => {
      setData((prev) =>
        prev.map((item) => {
          if (item.st !== "end" && item.t > 0) {
            return { ...item, t: item.t - 1 };
          }
          return item;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered and sorted auction list
  const filteredList = useMemo(() => {
    let list = data.filter((item) => {
      const matchTab = viewMode === "board" || item.st === tab;
      const matchQuery = !search || item.p.toLowerCase().includes(search.toLowerCase());
      const matchProv = !province || item.prov === province;
      const matchType = !plateType || item.type === plateType;
      return matchTab && matchQuery && matchProv && matchType;
    });

    list.sort((a, b) => {
      if (sortBy === "hi") return b.price - a.price;
      if (sortBy === "lo") return a.price - b.price;
      if (sortBy === "bids") return b.bids - a.bids;
      return (a.t || 9e9) - (b.t || 9e9);
    });

    return list;
  }, [data, tab, viewMode, search, province, plateType, sortBy]);

  // Paged list for Grid and Table views
  const pagedList = useMemo(() => {
    if (viewMode === "board") return filteredList;
    const startIndex = (page - 1) * pageSize;
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, page, pageSize, viewMode]);

  const placeBid = (plate: AuctionItem) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.p === plate.p) {
          const nextPrice = item.price + item.step;
          const nextBids = item.bids + 1;
          message.success(
            `Đặt giá thành công cho biển ${item.p}! Giá mới: ${formatMoney(nextPrice)}`
          );
          return { ...item, price: nextPrice, bids: nextBids };
        }
        return item;
      })
    );
    setSelectedPlate(null);
  };

  return {
    data,
    filteredList,
    pagedList,
    total: filteredList.length,
    tab,
    setTab,
    viewMode,
    setViewMode,
    search,
    setSearch,
    province,
    setProvince,
    plateType,
    setPlateType,
    sortBy,
    setSortBy,
    selectedPlate,
    setSelectedPlate,
    page,
    setPage,
    pageSize,
    setPageSize,
    placeBid,
  };
};

export default useAuctionData;
