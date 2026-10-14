import { useEffect, useMemo, useState } from "react";
import tokenManager from "@/shared/utils/tokenManager";
import { useAuctionSessionsQuery } from "../services/query";
import type { AuctionItem, AuctionStatus } from "../services/type";
import { INITIAL_AUCTION_DATA } from "../utils/constants";
import { mapAuctionSessionVOToItem } from "../utils/format";

export const useData = () => {
  const [currentUser] = useState<{ name: string; email?: string }>(() => {
    try {
      const raw = localStorage.getItem("auction_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.name || parsed.fullName || parsed.userName;
        if (name) return { name, email: parsed.email };
        if (parsed.email) return { name: parsed.email.split("@")[0], email: parsed.email };
      }
      const token = tokenManager.getAccessToken();
      if (token) {
        const parts = token.split(".");
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          const name = payload.fullName || payload.name || payload.sub || payload.email;
          if (name) return { name, email: payload.email || payload.sub };
        }
      }
    } catch (e) {
      console.warn("Could not retrieve current user", e);
    }
    return { name: "Người dùng" };
  });

  const [tab, setTab] = useState<AuctionStatus>("live");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "board">("grid");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [plateType, setPlateType] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("time");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Status parameter mapping for backend: live -> LIVE, soon -> SOON, end -> END
  const apiStatus = tab.toUpperCase();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAuctionSessionsQuery(
    {
      page: 0,
      size: 100,
      status: apiStatus,
    },
    {
      enabled: true,
      refetchInterval: 15000,
    }
  );

  const [data, setData] = useState<AuctionItem[]>(INITIAL_AUCTION_DATA);

  // Sync API response to data state when received
  useEffect(() => {
    if (apiResponse && Array.isArray(apiResponse.content) && apiResponse.content.length > 0) {
      const mapped = apiResponse.content.map(mapAuctionSessionVOToItem);
      setData(mapped);
    }
  }, [apiResponse]);

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
      const matchQuery =
        !search ||
        item.p.toLowerCase().includes(search.toLowerCase()) ||
        item.prov.toLowerCase().includes(search.toLowerCase());
      const matchProv = !province || item.prov === province;
      const matchType =
        !plateType ||
        item.type === plateType ||
        item.plateTypeEnum === plateType;

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

  return {
    currentUser,
    data,
    setData,
    filteredList,
    pagedList,
    total: filteredList.length,
    isLoading,
    isFetching,
    refetch,
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
    page,
    setPage,
    pageSize,
    setPageSize,
  };
};

export default useData;
