import { useEffect, useMemo, useState } from "react";
import tokenManager from "@/shared/utils/tokenManager";
import { getUserFromToken } from "@/shared/utils/jwt";
import {
  computeRemainingSecondsFromTarget,
  resolveTargetEpochMs,
  syncServerClock,
  updateServerClockOffset,
} from "@/shared/utils/serverClock";
import { useAuctionSessionsQuery, useWatchedSessionsQuery } from "../services/query";
import type { AuctionItem, AuctionStatus, WsBidMessage } from "../services/type";
import { INITIAL_AUCTION_DATA } from "../utils/constants";
import { mapAuctionSessionVOToItem } from "../utils/format";
import { useAuctionSocket } from "./useAuctionSocket";

export const useData = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email?: string } | null>(() => {
    try {
      const raw = localStorage.getItem("auction_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.name || parsed.fullName || parsed.userName;
        if (name && name !== "Người dùng" && name !== "Bạn") return { name, email: parsed.email };
        if (parsed.email) return { name: parsed.email.split("@")[0], email: parsed.email };
      }
      const token = tokenManager.getAccessToken();
      if (token) {
        const user = getUserFromToken(token);
        if (user && user.displayName) {
          return { name: user.displayName, email: user.email };
        }
      }
    } catch (e) {
      console.warn("Could not retrieve current user", e);
    }
    return null;
  });

  useEffect(() => {
    const handleAuth = () => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        setCurrentUser(null);
        setOnlyWatched(false);
        setOnlyRegistered(false);
        return;
      }
      try {
        const raw = localStorage.getItem("auction_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const name = parsed.name || parsed.fullName || parsed.userName;
          if (name && name !== "Người dùng" && name !== "Bạn") {
            setCurrentUser({ name, email: parsed.email });
            return;
          }
        }
        const user = getUserFromToken(token);
        if (user && user.displayName) {
          setCurrentUser({ name: user.displayName, email: user.email });
          return;
        }
      } catch {
        // ignore
      }
      setCurrentUser(null);
    };

    window.addEventListener("auth-changed", handleAuth);
    return () => window.removeEventListener("auth-changed", handleAuth);
  }, []);

  const [tab, setTab] = useState<AuctionStatus>("live");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "board">("grid");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [plateType, setPlateType] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("time");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Tải đồng thời toàn bộ 3 trạng thái (LIVE, SOON, END) để đếm số lượng trên cả 3 tab và đồng bộ chế độ xem Theo cột
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useAuctionSessionsQuery(
    {
      page: 0,
      size: 100,
      status: "ALL",
    },
    {
      enabled: true,
      refetchInterval: 15000,
    }
  );

  const [data, setData] = useState<AuctionItem[]>(INITIAL_AUCTION_DATA);
  const [onlyWatched, setOnlyWatched] = useState<boolean>(false);
  const [onlyRegistered, setOnlyRegistered] = useState<boolean>(false);

  // Load danh sách các phiên đang theo dõi của người dùng (chỉ gọi khi đã đăng nhập)
  const { data: watchedResponse, refetch: refetchWatched } = useWatchedSessionsQuery({
    enabled: Boolean(currentUser),
  });

  const watchedSessionCodes = useMemo(() => {
    const set = new Set<string>();
    if (watchedResponse && Array.isArray(watchedResponse.content)) {
      watchedResponse.content.forEach((item) => {
        if (item.sessionCode) set.add(item.sessionCode);
        if (item.plateNumber) set.add(item.plateNumber);
      });
    }
    return set;
  }, [watchedResponse]);

  const watchedUniqueCount = useMemo(() => {
    return Array.isArray(watchedResponse?.content) ? watchedResponse.content.length : 0;
  }, [watchedResponse]);

  const registeredCount = useMemo(() => {
    return data.filter(
      (item) =>
        Boolean(item.isRegistered) &&
        (viewMode === "board" || item.st === tab)
    ).length;
  }, [data, tab, viewMode]);

  // Sync API response to data state when received
  useEffect(() => {
    if (apiResponse && Array.isArray(apiResponse.content)) {
      const mapped = apiResponse.content.map(mapAuctionSessionVOToItem);
      setData(mapped);
    }
  }, [apiResponse]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [tab, search, province, plateType, sortBy, onlyWatched, onlyRegistered]);

  // Đồng bộ đồng hồ server và cập nhật countdown từ targetTimeMs (không bị trôi khi chuyển tab)
  useEffect(() => {
    const syncClockAndTick = (force = false) => {
      syncServerClock(force).then(() => {
        setData((prev) => {
          let changed = false;
          const next = prev.map((item) => {
            if (item.st === "end" || !item.targetTimeMs) return item;
            const nextT = computeRemainingSecondsFromTarget(item.targetTimeMs);
            if (nextT !== item.t) {
              changed = true;
              return { ...item, t: nextT };
            }
            return item;
          });
          return changed ? next : prev;
        });
      });
    };

    syncClockAndTick(true);
    const clockTimer = setInterval(() => syncClockAndTick(true), 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        syncClockAndTick(false);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    const timer = setInterval(() => {
      let anyHitZero = false;
      setData((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (item.st === "end") return item;
          const nextT = item.targetTimeMs
            ? computeRemainingSecondsFromTarget(item.targetTimeMs)
            : Math.max(0, item.t - 1);
          if (nextT !== item.t) {
            changed = true;
            if (item.t > 0 && nextT === 0) {
              anyHitZero = true;
            }
            return { ...item, t: nextT };
          }
          return item;
        });
        return changed ? next : prev;
      });
      if (anyHitZero) {
        setTimeout(() => {
          refetch();
        }, 2500);
      }
    }, 500);

    return () => {
      clearInterval(clockTimer);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch]);

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
      const matchWatched =
        !onlyWatched ||
        (item.sessionCode && watchedSessionCodes.has(item.sessionCode)) ||
        watchedSessionCodes.has(item.p);
      const matchRegistered = !onlyRegistered || Boolean(item.isRegistered);

      return matchTab && matchQuery && matchProv && matchType && matchWatched && matchRegistered;
    });

    list.sort((a, b) => {
      // Ưu tiên đưa các phiên người dùng đã nộp cọc lên đầu danh sách
      const regDiff = Number(Boolean(b.isRegistered)) - Number(Boolean(a.isRegistered));
      if (regDiff !== 0) return regDiff;

      if (sortBy === "hi") return b.price - a.price;
      if (sortBy === "lo") return a.price - b.price;
      if (sortBy === "bids") return b.bids - a.bids;
      return (a.t || 9e9) - (b.t || 9e9);
    });

    return list;
  }, [data, tab, viewMode, search, province, plateType, sortBy, onlyWatched, onlyRegistered, watchedSessionCodes]);

  // Paged list for Grid and Table views
  const pagedList = useMemo(() => {
    if (viewMode === "board") return filteredList;
    const startIndex = (page - 1) * pageSize;
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, page, pageSize, viewMode]);

  // Handle Real-Time WebSocket updates for the license plate list
  const handleWsPlateUpdate = (msg: WsBidMessage) => {
    if (!msg) return;
    const targetPlate = msg.plateNumber || msg.roomId;
    if (!targetPlate) return;

    setData((prev) => {
      const exists = prev.some(
        (item) => item.p === targetPlate || (msg.roomId && item.sessionCode === msg.roomId)
      );
      if (!exists) {
        // If not in current list, trigger background refetch
        refetch();
        return prev;
      }

      let statusChanged = false;
      const mapped = prev.map((item) => {
        if (item.p === targetPlate || (msg.roomId && item.sessionCode === msg.roomId)) {
          const nextPrice =
            msg.currentPrice ||
            (msg.bidAmount ? msg.bidAmount : item.price);
          const hasExplicitBidCount =
            msg.bidCount !== undefined && msg.bidCount !== null;
          const nextBids = hasExplicitBidCount
            ? msg.bidCount!
            : msg.type === "STATUS_CHANGE"
            ? item.bids
            : item.bids + 1;
          const nextStep =
            (msg as any).nextStep || msg.stepPrice || item.step;

          let nextStatus = item.st;
          if (msg.status) {
            const lower = msg.status.toLowerCase();
            if (lower === "live" || lower === "soon" || lower === "end") {
              nextStatus = lower as AuctionStatus;
            } else if (lower === "paused") {
              nextStatus = "live";
            }
          }
          if (nextStatus !== item.st) {
            statusChanged = true;
          }

          if ((msg as any).serverTimeMs) {
            updateServerClockOffset((msg as any).serverTimeMs, 100);
          }
          const nextTargetMs =
            nextStatus === "end"
              ? undefined
              : resolveTargetEpochMs({
                  epochMs: (msg as any).endTimeEpochMs,
                  isoTime: (msg as any).endTime,
                  remainingSeconds: (msg as any).remainingSeconds,
                  serverTimeMs: (msg as any).serverTimeMs,
                }) ?? item.targetTimeMs;

          return {
            ...item,
            price: nextPrice,
            bids: nextBids,
            step: nextStep,
            st: nextStatus,
            targetTimeMs: nextTargetMs,
            t:
              nextStatus === "end"
                ? 0
                : nextTargetMs
                ? computeRemainingSecondsFromTarget(nextTargetMs)
                : typeof (msg as any).remainingSeconds === "number" && (msg as any).remainingSeconds > 0
                ? (msg as any).remainingSeconds
                : item.t,
          };
        }
        return item;
      });
      if (statusChanged) {
        setTimeout(() => {
          refetch();
        }, 300);
      }
      return mapped;
    });
  };

  const {
    status: socketStatus,
    isConnected: isSocketConnected,
    sendBid,
    lastMessage: lastWsMessage,
  } = useAuctionSocket({
    enabled: true,
    onPlateUpdate: handleWsPlateUpdate,
  });

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
    watchedSessionCodes,
    onlyWatched,
    setOnlyWatched,
    watchedCount: watchedUniqueCount,
    onlyRegistered,
    setOnlyRegistered,
    registeredCount,
    refetchWatched,
    socketStatus,
    isSocketConnected,
    sendBid,
    lastWsMessage,
  };
};

export default useData;

