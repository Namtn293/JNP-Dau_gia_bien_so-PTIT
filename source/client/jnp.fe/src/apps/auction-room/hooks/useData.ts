import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "react-query";
import { QK } from "@/shared/constants/queryKeys";
import {
  useAuctionRoomDetailQuery,
  useAuctionRegistrationQuery,
  useWalletBalanceQuery,
  useAuctionWatchStatusQuery,
  useAutoBidConfigQuery,
  usePriceSeriesQuery,
  useRoomChatHistoryQuery,
} from "../services/query";
import { useAuctionRoomSocket } from "./useAuctionRoomSocket";
import type {
  AuctionLot,
  BidHistoryItem,
  ChatMessage,
  RoomParticipant,
  WsAuctionMessage,
  WsChatMessage,
  WsRoomEvent,
  RoomRoleEnum,
} from "../services/type";
import { formatMoney, getCurrentTimeString } from "../util/format";
import { soundManager } from "../feature/audio";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { lcStorage } from "@/shared/utils";
import tokenManager from "@/shared/utils/tokenManager";
import { getUserFromToken } from "@/shared/utils/jwt";
import {
  computeRemainingSecondsFromTarget,
  resolveTargetEpochMs,
  syncServerClock,
  updateServerClockOffset,
} from "@/shared/utils/serverClock";

export const useData = (roomId: string) => {
  const queryClient = useQueryClient();
  const token = tokenManager.getAccessToken();
  const jwtUser = useMemo(() => getUserFromToken(token), [token]);

  const currentUser = useMemo(() => {
    const stored = lcStorage.get<any>(LOCAL_STORAGE_KEYS.user);
    if (stored && (stored.fullName || stored.name)) {
      return {
        ...stored,
        id: jwtUser?.id ?? stored.id,
      };
    }
    if (jwtUser) {
      return {
        id: jwtUser.id,
        name: jwtUser.displayName,
        fullName: jwtUser.fullName,
        email: jwtUser.email,
      };
    }
    return null;
  }, [jwtUser]);

  const selfName = currentUser?.fullName || currentUser?.name || "";
  const selfId = currentUser?.id
    ? String(currentUser.id)
    : jwtUser?.id
    ? String(jwtUser.id)
    : "";
  const isAdminUser = Boolean(jwtUser?.roles?.includes("ROLE_ADMIN"));

  // 1. Fetch initial detail from API
  const {
    data: initialDetail,
    isLoading,
    refetch: refetchRoomDetail,
  } = useAuctionRoomDetailQuery(roomId);

  // 2. Real-time state
  const [sessionCode, setSessionCode] = useState(roomId || "");

  // 3. User Registration (Deposit) & Wallet Balance
  const isLoggedIn = Boolean(token);
  const targetCode = sessionCode || roomId;

  const {
    data: registrationData,
    isLoading: isRegistrationLoading,
    refetch: refetchRegistration,
  } = useAuctionRegistrationQuery(targetCode, {
    enabled: isLoggedIn && !!targetCode,
  });

  const { data: walletData, refetch: refetchWallet } = useWalletBalanceQuery({
    enabled: isLoggedIn,
  });

  const {
    data: watchStatusData,
    isLoading: isWatchStatusLoading,
    refetch: refetchWatchStatus,
  } = useAuctionWatchStatusQuery(targetCode, {
    enabled: isLoggedIn && !!targetCode,
  });

  const { data: autoBidData, refetch: refetchAutoBid } = useAutoBidConfigQuery(
    targetCode,
    {
      enabled: isLoggedIn && !!targetCode,
    }
  );

  const {
    data: priceSeriesData,
    isLoading: isPriceSeriesLoading,
    refetch: refetchPriceSeries,
  } = usePriceSeriesQuery(targetCode, {
    enabled: !!targetCode,
  });

  const { data: chatHistoryData } = useRoomChatHistoryQuery(targetCode, {
    enabled: !!targetCode,
  });

  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    if (typeof watchStatusData === "boolean") {
      setIsWatched(watchStatusData);
    }
  }, [watchStatusData]);

  const [isRegistered, setIsRegistered] = useState(false);
  const [userRole, setUserRole] = useState<RoomRoleEnum>("VIEWER");
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  useEffect(() => {
    if (registrationData) {
      const reg = Boolean(registrationData.registered);
      setIsRegistered(reg);
      setUserRole(registrationData.myRole || (reg ? "BIDDER" : "VIEWER"));
      setParticipants((prev) =>
        prev.map((p) => {
          if (!p.isSelf) return p;
          const keepBidStatus = p.isLeader || p.statusText === "Dẫn đầu" || p.statusText === "Đã đặt giá";
          return {
            ...p,
            role: reg ? "Đấu giá viên" : "Khách theo dõi",
            statusText: keepBidStatus ? p.statusText : reg ? "Đã nộp cọc" : "Đang theo dõi",
          };
        })
      );
    }
  }, [registrationData]);
  const [title, setTitle] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [plateType, setPlateType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [stepPrice, setStepPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [reserveMet, setReserveMet] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [roomStatus, setRoomStatus] = useState<"LIVE" | "SOON" | "PAUSED" | "END">("LIVE");
  const [isEnded, setIsEnded] = useState(false);
  const [leader, setLeader] = useState<string>("");
  const [leaderId, setLeaderId] = useState<string>("");
  const [myLastBid, setMyLastBid] = useState<number | null>(null);
  const [isPopping, setIsPopping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pinnedNotice, setPinnedNotice] = useState("");

  // UI Tabs & Inputs
  const [activeDetailTab, setActiveDetailTab] = useState("desc");
  const [activeRightTab, setActiveRightTab] = useState<"chat" | "hist" | "chart" | "ppl">("chat");
  const [customBidInput, setCustomBidInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState("");

  // Reset room state when switching lots / rooms
  const prevRoomIdRef = useRef(roomId);
  const targetDeadlineMsRef = useRef<number | null>(null);
  const hasWarned30sRef = useRef(false);
  const wsTransitionStatusRef = useRef<{
    roomId: string;
    status: "LIVE" | "PAUSED" | "END";
    at: number;
  } | null>(null);
  useEffect(() => {
    if (prevRoomIdRef.current !== roomId) {
      prevRoomIdRef.current = roomId;
      lastSyncedDetailRef.current = null;
      lastSyncedChatRef.current = null;
      wsTransitionStatusRef.current = null;
      targetDeadlineMsRef.current = null;
      hasWarned30sRef.current = false;
      hasAnnouncedEndRef.current = false;
      setSessionCode(roomId || "");
      setLeader("");
      setLeaderId("");
      setMyLastBid(null);
      setPinnedNotice("");
      setChatMessages([]);
      setBidHistory([]);
      setAutoBidEnabled(false);
      setAutoBidMax("");
      setRoomStatus("LIVE");
      setIsEnded(false);
      setRemainingSeconds(0);
      setParticipants(
        selfName
          ? [
              {
                id: selfId,
                name: selfName,
                role: "Người tham gia",
                statusText: "Đang trực tuyến",
                isSelf: true,
                isLeader: false,
              },
            ]
          : []
      );
    }
  }, [roomId, selfId, selfName]);

  // Sync AutoBid config from server
  useEffect(() => {
    if (!autoBidData) return;
    setAutoBidEnabled(Boolean(autoBidData.active));
    if (autoBidData.maxAmount && autoBidData.maxAmount > 0) {
      setAutoBidMax(autoBidData.maxAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  }, [autoBidData]);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; amount: number }>({
    open: false,
    amount: 0,
  });

  // Collections
  const [lots, setLots] = useState<AuctionLot[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>(() =>
    selfName
      ? [
          {
            id: selfId || "SELF",
            name: selfName,
            role: "Người tham gia",
            statusText: "Đang trực tuyến",
            isSelf: true,
            isLeader: false,
          },
        ]
      : []
  );

  const isSelfIdentity = useCallback(
    (name?: string, userId?: string | number | null, isMine?: boolean) => {
      if (isMine) return true;
      const uidStr =
        userId !== undefined && userId !== null ? String(userId).trim() : "";
      const isSyntheticId =
        uidStr.startsWith("BIDDER-") ||
        uidStr.startsWith("CHAT-") ||
        uidStr.startsWith("JOIN-");
      if (uidStr !== "" && !isSyntheticId && selfId !== "") {
        return uidStr === selfId;
      }
      return name === "Bạn" || (selfName !== "" && name === selfName);
    },
    [selfId, selfName]
  );

  // Synchronize participants from bids + currentUser (deduplicate self by canonical key __SELF__)
  const syncParticipants = useCallback(
    (bids: BidHistoryItem[], currentLeadUser?: string, currentLeadUserId?: number | string | null) => {
      const leadIdStr =
        currentLeadUserId !== undefined && currentLeadUserId !== null ? String(currentLeadUserId) : "";
      const selfIsLeader = isSelfIdentity(currentLeadUser, leadIdStr, false);

      setParticipants((prev) => {
        const map = new Map<string, RoomParticipant>();

        if (selfName) {
          map.set("__SELF__", {
            id: selfId || "SELF",
            name: selfName,
            role: isRegistered ? "Đấu giá viên" : "Khách theo dõi",
            statusText: selfIsLeader
              ? "Dẫn đầu"
              : isRegistered
              ? "Đã nộp cọc"
              : "Đang theo dõi",
            isSelf: true,
            isLeader: selfIsLeader,
          });
        }

        // Keep any existing non-self participants (e.g. from real-time events)
        prev.forEach((p) => {
          if (p.isSelf || isSelfIdentity(p.name, p.id, p.isSelf)) return;
          const key = p.id && !p.id.startsWith("BIDDER-") && !p.id.startsWith("CHAT-") && !p.id.startsWith("JOIN-")
            ? `UID:${p.id}`
            : `NAME:${p.name}`;
          map.set(key, { ...p, isLeader: false });
        });

        // Add/merge real bidders from database / API
        bids.forEach((b, idx) => {
          const isSelf = isSelfIdentity(b.userName, b.userId, b.isMine);
          const isLead = Boolean(
            b.isWinning ||
              (leadIdStr && b.userId !== undefined && String(b.userId) === leadIdStr) ||
              (!leadIdStr && currentLeadUser && b.userName === currentLeadUser)
          );

          if (isSelf) {
            const existingSelf = map.get("__SELF__");
            map.set("__SELF__", {
              id: selfId || (b.userId !== undefined ? String(b.userId) : "SELF"),
              name: selfName || existingSelf?.name || b.userName || "Bạn",
              role: isRegistered ? "Đấu giá viên" : existingSelf?.role || "Người tham gia",
              statusText: isLead || existingSelf?.isLeader ? "Dẫn đầu" : "Đã đặt giá",
              isSelf: true,
              isLeader: Boolean(isLead || existingSelf?.isLeader),
            });
            return;
          }

          const key =
            b.userId !== undefined && b.userId !== null && String(b.userId) !== ""
              ? `UID:${b.userId}`
              : `NAME:${b.userName}`;
          const existing = map.get(key);
          map.set(key, {
            id: b.userId !== undefined ? String(b.userId) : existing?.id || `BIDDER-${idx}-${b.userName}`,
            name: b.userName,
            role: "Người tham gia",
            statusText: isLead ? "Dẫn đầu" : existing?.isLeader ? "Dẫn đầu" : "Đã đặt giá",
            isSelf: false,
            isLeader: Boolean(isLead || existing?.isLeader),
          });
        });

        return Array.from(map.values());
      });
    },
    [selfName, selfId, isRegistered, isSelfIdentity]
  );

  // Sync initial query detail (guarded with ref to run only once per payload)
  const lastSyncedDetailRef = useRef<any>(null);
  const lastSyncedChatRef = useRef<any>(null);
  const hasAnnouncedEndRef = useRef(false);

  useEffect(() => {
    if (!initialDetail) return;
    if (lastSyncedDetailRef.current === initialDetail) return;

    const incomingRoom = initialDetail.sessionCode || roomId;
    const st = (initialDetail.status || "LIVE").toUpperCase() as "LIVE" | "SOON" | "PAUSED" | "END";
    const pendingWs = wsTransitionStatusRef.current;
    const isStaleSoonRollback =
      pendingWs &&
      pendingWs.roomId === incomingRoom &&
      Date.now() - pendingWs.at < 15000 &&
      st === "SOON" &&
      pendingWs.status !== "SOON";

    if (isStaleSoonRollback) {
      const retryTimer = setTimeout(() => {
        refetchRoomDetail({ cancelRefetch: true });
      }, 600);
      return () => clearTimeout(retryTimer);
    }

    lastSyncedDetailRef.current = initialDetail;
    if (pendingWs && pendingWs.roomId === incomingRoom && st !== "SOON") {
      wsTransitionStatusRef.current = null;
    }

    setSessionCode(initialDetail.sessionCode || roomId);
    setTitle(initialDetail.title || "Phiên đấu giá trực tuyến");
    setPlateNumber(initialDetail.plateNumber || "");
    setProvinceName(initialDetail.provinceName || "");
    setPlateType(initialDetail.plateType || "");
    setVehicleType(initialDetail.vehicleType || "");
    setCurrentPrice(initialDetail.currentPrice || initialDetail.startPrice || 0);
    setStepPrice(initialDetail.nextStep || initialDetail.stepPrice || 5_000_000);
    setDepositAmount(initialDetail.depositAmount || 40_000_000);
    setReserveMet(initialDetail.reserveMet ?? true);
    setRoomStatus(st);

    if (initialDetail.serverTimeMs) {
      updateServerClockOffset(initialDetail.serverTimeMs, 800);
    }

    if (st === "PAUSED" || st === "END") {
      targetDeadlineMsRef.current = null;
      setRemainingSeconds(st === "END" ? 0 : (initialDetail.remainingSeconds || 0));
    } else {
      const targetMs = resolveTargetEpochMs({
        epochMs: st === "SOON" ? initialDetail.startTimeEpochMs : initialDetail.endTimeEpochMs,
        isoTime: st === "SOON" ? initialDetail.startTime : initialDetail.endTime,
        remainingSeconds: initialDetail.remainingSeconds,
        serverTimeMs: initialDetail.serverTimeMs,
      });
      targetDeadlineMsRef.current = targetMs;
      setRemainingSeconds(
        targetMs ? computeRemainingSecondsFromTarget(targetMs) : (initialDetail.remainingSeconds || 0)
      );
    }

    const ended = st === "END" || (st === "LIVE" && (initialDetail.remainingSeconds ?? 0) <= 0);
    setIsEnded(ended);
    if (ended) {
      hasAnnouncedEndRef.current = true;
    }
    setLeader(initialDetail.leadingUser || "");
    setLeaderId(
      initialDetail.leadingUserId !== undefined && initialDetail.leadingUserId !== null
        ? String(initialDetail.leadingUserId)
        : ""
    );
    setPinnedNotice(initialDetail.pinnedNotice || "");
    if (initialDetail.lots?.length) setLots(initialDetail.lots);
    if (initialDetail.initialBids) {
      const normalizedBids = initialDetail.initialBids.map((b) => ({
        ...b,
        isMine:
          b.isMine ||
          (selfId !== "" && b.userId !== undefined && String(b.userId) === selfId),
      }));
      setBidHistory(normalizedBids);
      const myLatest = normalizedBids.find((b) => b.isMine);
      setMyLastBid(myLatest ? myLatest.bidAmount : null);
      syncParticipants(normalizedBids, initialDetail.leadingUser, initialDetail.leadingUserId);
    } else {
      setBidHistory([]);
      setMyLastBid(null);
      syncParticipants([], initialDetail.leadingUser, initialDetail.leadingUserId);
    }
  }, [initialDetail, roomId, selfId, syncParticipants, refetchRoomDetail]);

  // Derived user lead state
  const isLeadingById = Boolean(selfId && leaderId && leaderId === selfId);
  const isLeadingByName = Boolean(leader && (leader === "Bạn" || (selfName && leader === selfName)));
  const userLeadState: "none" | "leading" | "outbid" =
    myLastBid === null && !isLeadingById && !isLeadingByName
      ? "none"
      : isLeadingById || isLeadingByName
      ? "leading"
      : "outbid";

  // System notification helper in chat feed (khử trùng lặp thông báo hệ thống liên tiếp)
  const addSystemNotice = useCallback((content: string) => {
    setChatMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.isSystem && last.content === content) {
        return prev;
      }
      return [
        ...prev,
        {
          senderName: "Hệ thống",
          content,
          time: getCurrentTimeString(),
          isSystem: true,
        },
      ];
    });
  }, []);

  const updateLotInList = useCallback(
    (code: string, patch: Partial<AuctionLot>) => {
      if (!code) return;
      setLots((prev) =>
        prev.map((lot) =>
          lot.roomId === code || lot.plateNumber === code ? { ...lot, ...patch } : lot
        )
      );
    },
    []
  );

  // WebSocket message handlers
  const handleAuctionUpdate = useCallback(
    (msg: WsAuctionMessage) => {
      const lotKey = msg.roomId || targetCode;
      if (msg.status === "END") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "END", at: Date.now() };
        targetDeadlineMsRef.current = null;
        setRoomStatus("END");
        setIsEnded(true);
        setRemainingSeconds(0);
        updateLotInList(lotKey, { status: "END", timeLabel: "Đã kết thúc" });
      } else if (msg.status === "LIVE") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "LIVE", at: Date.now() };
        setRoomStatus("LIVE");
        setIsEnded(false);
        updateLotInList(lotKey, { status: "LIVE", timeLabel: "Đang đấu" });
      } else if (msg.status === "PAUSED") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "PAUSED", at: Date.now() };
        targetDeadlineMsRef.current = null;
        setRoomStatus("PAUSED");
        updateLotInList(lotKey, { status: "PAUSED", timeLabel: "Tạm dừng" });
      }

      const incomingStep = msg.nextStep || msg.stepPrice;
      if (incomingStep && incomingStep > 0) {
        setStepPrice(incomingStep);
      }

      if (msg.serverTimeMs) {
        updateServerClockOffset(msg.serverTimeMs, 100);
      }

      // Đồng bộ targetDeadlineMs chuẩn theo đồng hồ server cho BID / EXTEND / STATUS_CHANGE
      if (msg.status !== "END" && msg.status !== "PAUSED") {
        const nextTargetMs = resolveTargetEpochMs({
          epochMs: msg.endTimeEpochMs,
          isoTime: msg.endTime,
          remainingSeconds: msg.remainingSeconds,
          serverTimeMs: msg.serverTimeMs,
        });
        if (nextTargetMs) {
          targetDeadlineMsRef.current = nextTargetMs;
          const syncedSec = computeRemainingSecondsFromTarget(nextTargetMs);
          setRemainingSeconds(syncedSec);
          if (syncedSec > 30) {
            hasWarned30sRef.current = false;
          }
        } else if (typeof msg.remainingSeconds === "number" && msg.remainingSeconds > 0) {
          setRemainingSeconds(msg.remainingSeconds);
        }
      }
      if (msg.extended || msg.type === "EXTEND") {
        addSystemNotice("Có lượt đặt giá phút chót: Hệ thống đã tự động gia hạn thêm 30 giây!");
      }

      if (msg.currentPrice && msg.currentPrice > currentPrice) {
        setCurrentPrice(msg.currentPrice);
        updateLotInList(lotKey, { currentPrice: msg.currentPrice });
        setIsPopping(true);
        setTimeout(() => setIsPopping(false), 300);

        soundManager.playBidSound(soundEnabled);

        const newLeader = msg.userName || "u***";
        const newLeaderId = msg.userId !== undefined && msg.userId !== null ? String(msg.userId) : "";
        const isSelfBid = isSelfIdentity(newLeader, newLeaderId, false);

        setLeader(newLeader);
        if (newLeaderId) setLeaderId(newLeaderId);
        if (isSelfBid) {
          setMyLastBid(msg.currentPrice);
        }

        // Record in bid history
        setBidHistory((prev) => [
          {
            userId: msg.userId,
            userName: newLeader,
            bidAmount: msg.currentPrice!,
            source: msg.source || "MANUAL",
            time: msg.timestamp || getCurrentTimeString(),
            bidTime: msg.bidTime,
            isWinning: true,
            isMine: isSelfBid,
          },
          ...prev.map((b) => ({ ...b, isWinning: false })),
        ]);

        // Dynamically add/update real bidder in participants without duplicating self under masked name
        setParticipants((prev) => {
          const map = new Map<string, RoomParticipant>();
          prev.forEach((p) => {
            const matchesSelf = isSelfBid && (p.isSelf || isSelfIdentity(p.name, p.id, p.isSelf));
            const matchesById =
              !isSelfBid && newLeaderId !== "" && p.id !== "" && String(p.id) === newLeaderId;
            const matchesByName = !isSelfBid && newLeaderId === "" && p.name === newLeader;
            const isNewLeaderEntry = matchesSelf || matchesById || matchesByName;

            const key = p.isSelf
              ? "__SELF__"
              : p.id && !p.id.startsWith("BIDDER-") && !p.id.startsWith("CHAT-") && !p.id.startsWith("JOIN-")
              ? `UID:${p.id}`
              : `NAME:${p.name}`;

            map.set(key, {
              ...p,
              isLeader: isNewLeaderEntry,
              statusText: isNewLeaderEntry
                ? "Dẫn đầu"
                : p.isLeader
                ? "Đã đặt giá"
                : p.statusText,
            });
          });

          if (isSelfBid) {
            if (!map.has("__SELF__")) {
              map.set("__SELF__", {
                id: selfId || newLeaderId || "SELF",
                name: selfName || newLeader,
                role: "Đấu giá viên",
                statusText: "Dẫn đầu",
                isSelf: true,
                isLeader: true,
              });
            }
          } else {
            const targetKey = newLeaderId !== "" ? `UID:${newLeaderId}` : `NAME:${newLeader}`;
            if (!map.has(targetKey)) {
              map.set(targetKey, {
                id: newLeaderId || `BIDDER-${Date.now()}`,
                name: newLeader,
                role: "Người tham gia",
                statusText: "Dẫn đầu",
                isSelf: false,
                isLeader: true,
              });
            }
          }
          return Array.from(map.values());
        });

        addSystemNotice(
          `${newLeader}${msg.source === "AUTO" ? " (Tự động)" : ""} vừa đặt giá ${formatMoney(msg.currentPrice)}`
        );

        // Refresh price series chart & auto-bid state
        if (targetCode) {
          queryClient.invalidateQueries(QK.priceSeries(targetCode));
          refetchPriceSeries();
        }
      }
    },
    [currentPrice, soundEnabled, selfName, selfId, targetCode, queryClient, refetchPriceSeries, addSystemNotice, updateLotInList, isSelfIdentity]
  );

  const mapWsChatToMessage = useCallback(
    (msg: WsChatMessage): ChatMessage => ({
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderName: msg.senderName,
      content: msg.content,
      time: msg.timestamp || getCurrentTimeString(),
      isHost: msg.senderName.includes("Host") || msg.senderName.includes("Ban tổ chức"),
      isMine: isSelfIdentity(msg.senderName, msg.senderId, false),
    }),
    [isSelfIdentity]
  );

  const registerChatSenders = useCallback(
    (items: WsChatMessage[]) => {
      const valid = items.filter((m) => m.senderName && m.senderName !== "Hệ thống");
      if (valid.length === 0) return;

      setParticipants((prev) => {
        const next = [...prev];
        let changed = false;
        for (const msg of valid) {
          const isSelfSender = isSelfIdentity(msg.senderName, msg.senderId, false);
          const alreadyExists = isSelfSender
            ? next.some((p) => p.isSelf)
            : next.some((p) =>
                msg.senderId && !p.isSelf
                  ? String(p.id) === String(msg.senderId)
                  : p.name === msg.senderName && !p.isSelf
              );
          if (alreadyExists) continue;

          const isHost = msg.senderName.includes("Host") || msg.senderName.includes("Ban tổ chức");
          const isMonitor = msg.senderName.includes("GiamSat");
          next.push({
            id: isSelfSender ? selfId || "SELF" : msg.senderId || `CHAT-${Date.now()}-${msg.senderName}`,
            name: isSelfSender && selfName ? selfName : msg.senderName,
            role: isHost ? "Ban tổ chức" : isMonitor ? "Giám sát viên" : "Người tham gia",
            statusText: isHost ? "Đang điều phối" : isMonitor ? "Đang giám sát" : "đang trực tuyến",
            isSelf: isSelfSender,
          });
          changed = true;
        }
        return changed ? next : prev;
      });
    },
    [selfId, selfName, isSelfIdentity]
  );

  // Hydrate persistent chat history whenever entering or refreshing the auction room
  useEffect(() => {
    if (!chatHistoryData || !Array.isArray(chatHistoryData)) return;
    if (lastSyncedChatRef.current === chatHistoryData) return;
    lastSyncedChatRef.current = chatHistoryData;

    if (chatHistoryData.length === 0) return;
    const mappedHistory = chatHistoryData.map(mapWsChatToMessage);
    setChatMessages((prev) => {
      const seen = new Set(mappedHistory.map((m) => m.id).filter(Boolean));
      const extras = prev.filter((m) => !m.id || !seen.has(m.id));
      return [...mappedHistory, ...extras];
    });
    registerChatSenders(chatHistoryData);
  }, [chatHistoryData, mapWsChatToMessage, registerChatSenders]);

  const handleChatMessage = useCallback(
    (msg: WsChatMessage) => {
      const chatItem = mapWsChatToMessage(msg);
      setChatMessages((prev) => {
        if (chatItem.id && prev.some((m) => m.id === chatItem.id)) {
          return prev;
        }
        return [...prev, chatItem];
      });
      registerChatSenders([msg]);
    },
    [mapWsChatToMessage, registerChatSenders]
  );

  const handleRoomEvent = useCallback(
    (event: WsRoomEvent) => {
      const lotKey = event.roomId || targetCode;
      if (event.serverTimeMs) {
        updateServerClockOffset(event.serverTimeMs, 100);
      }
      if (event.event === "HALT") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "PAUSED", at: Date.now() };
        targetDeadlineMsRef.current = null;
        setRoomStatus("PAUSED");
        updateLotInList(lotKey, { status: "PAUSED", timeLabel: "Tạm dừng" });
        addSystemNotice("Phiên đấu giá đã bị tạm dừng khẩn cấp bởi Ban tổ chức.");
      } else if (event.event === "RESUME") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "LIVE", at: Date.now() };
        setRoomStatus("LIVE");
        setIsEnded(false);
        const nextTarget = resolveTargetEpochMs({
          epochMs: event.endTimeEpochMs,
          isoTime: event.endTime,
          remainingSeconds: event.remainingSeconds,
          serverTimeMs: event.serverTimeMs,
        });
        if (nextTarget) {
          targetDeadlineMsRef.current = nextTarget;
          setRemainingSeconds(computeRemainingSecondsFromTarget(nextTarget));
        } else if (typeof event.remainingSeconds === "number" && event.remainingSeconds > 0) {
          setRemainingSeconds(event.remainingSeconds);
        }
        updateLotInList(lotKey, { status: "LIVE", timeLabel: "Đang đấu" });
        addSystemNotice("Phiên đấu giá đã được tiếp tục (+30 giây).");
        refetchRoomDetail({ cancelRefetch: true });
      } else if (event.event === "CANCEL") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "END", at: Date.now() };
        targetDeadlineMsRef.current = null;
        setRoomStatus("END");
        setIsEnded(true);
        setRemainingSeconds(0);
        updateLotInList(lotKey, { status: "END", timeLabel: "Đã kết thúc" });
        addSystemNotice(event.message || "Phiên đấu giá đã bị hủy bởi quản trị viên.");
        if (isLoggedIn) {
          refetchWallet();
          refetchRegistration();
        }
        setTimeout(() => refetchRoomDetail({ cancelRefetch: true }), 500);
      } else if (event.event === "END") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "END", at: Date.now() };
        targetDeadlineMsRef.current = null;
        setRoomStatus("END");
        setIsEnded(true);
        setRemainingSeconds(0);
        updateLotInList(lotKey, { status: "END", timeLabel: "Đã kết thúc" });
        addSystemNotice(event.message || "Phiên đấu giá đã kết thúc!");
        if (isLoggedIn) {
          refetchWallet();
        }
        setTimeout(() => refetchRoomDetail({ cancelRefetch: true }), 500);
      } else if (event.event === "START") {
        wsTransitionStatusRef.current = { roomId: lotKey, status: "LIVE", at: Date.now() };
        setRoomStatus("LIVE");
        setIsEnded(false);
        const nextTarget = resolveTargetEpochMs({
          epochMs: event.endTimeEpochMs,
          isoTime: event.endTime,
          remainingSeconds: event.remainingSeconds,
          serverTimeMs: event.serverTimeMs,
        });
        if (nextTarget) {
          targetDeadlineMsRef.current = nextTarget;
          setRemainingSeconds(computeRemainingSecondsFromTarget(nextTarget));
        } else if (typeof event.remainingSeconds === "number" && event.remainingSeconds > 0) {
          setRemainingSeconds(event.remainingSeconds);
        }
        updateLotInList(lotKey, { status: "LIVE", timeLabel: "Đang đấu" });
        addSystemNotice(event.message || "Phiên đấu giá đã chính thức bắt đầu!");
        refetchRoomDetail({ cancelRefetch: true });
      } else if (event.event === "ANNOUNCEMENT") {
        if (event.pinned && event.message) {
          setPinnedNotice(event.message);
        }
        const prefix = event.adminName ? `[Thông báo từ ${event.adminName}] ` : "[Thông báo Quản trị] ";
        if (event.message) {
          addSystemNotice(`${prefix}${event.message}`);
        }
      } else if (event.event === "ANNOUNCEMENT_REMOVED") {
        refetchRoomDetail();
      } else if (event.event === "ROLE_CHANGED" || (event as any).type === "ROLE_CHANGED") {
        refetchRegistration();
        refetchWallet();
      } else if (event.message) {
        addSystemNotice(event.message);
      }
      if ((event as any).userName) {
        const uName = (event as any).userName;
        const uId = (event as any).userId;
        const isSelfEvent = isSelfIdentity(uName, uId, false);
        if (event.event === "JOIN") {
          addSystemNotice(`${uName} đã vào phòng đấu giá`);
          setParticipants((prev) => {
            if (
              (isSelfEvent && prev.some((p) => p.isSelf)) ||
              prev.some((p) => p.name === uName || (uId && String(p.id) === String(uId)))
            ) {
              return prev;
            }
            return [
              ...prev,
              {
                id: isSelfEvent ? selfId || "SELF" : uId ? String(uId) : `JOIN-${Date.now()}`,
                name: isSelfEvent && selfName ? selfName : uName,
                role: "Người tham gia",
                statusText: "vừa vào phòng",
                isSelf: isSelfEvent,
              },
            ];
          });
        } else if (event.event === "LEAVE") {
          addSystemNotice(`${uName} đã rời khỏi phòng đấu giá`);
          setParticipants((prev) => prev.filter((p) => !(p.name === uName || (uId && String(p.id) === String(uId))) || p.isSelf));
        }
      }
    },
    [addSystemNotice, selfName, selfId, targetCode, isLoggedIn, refetchRegistration, refetchWallet, refetchRoomDetail, updateLotInList, isSelfIdentity]
  );

  // Connect STOMP WebSocket (giữ kết nối kể cả khi PAUSED / SOON / END; chỉ báo JOIN khi sessionCode chuẩn đã tải xong)
  const { isConnected, sendBid: sendSocketBid, sendChatMessage: sendSocketChat } =
    useAuctionRoomSocket({
      roomId: sessionCode,
      presenceReady: Boolean(initialDetail?.sessionCode),
      onAuctionUpdate: handleAuctionUpdate,
      onChatMessage: handleChatMessage,
      onRoomEvent: handleRoomEvent,
      enabled: Boolean(sessionCode),
    });

  const leaderRef = useRef(leader);
  leaderRef.current = leader;
  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const roomStatusRef = useRef(roomStatus);
  roomStatusRef.current = roomStatus;

  // Đồng bộ đồng hồ server định kỳ & mỗi khi tab quay lại focus (Cristian NTP sync)
  useEffect(() => {
    const syncNow = (force = false) => {
      syncServerClock(force).then(() => {
        if (targetDeadlineMsRef.current && roomStatusRef.current !== "PAUSED") {
          setRemainingSeconds(computeRemainingSecondsFromTarget(targetDeadlineMsRef.current));
        }
      });
    };

    syncNow(true);
    const clockSyncTimer = setInterval(() => syncNow(true), 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        syncNow(false);
        if (targetDeadlineMsRef.current && roomStatusRef.current !== "PAUSED") {
          setRemainingSeconds(computeRemainingSecondsFromTarget(targetDeadlineMsRef.current));
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(clockSyncTimer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [roomId]);

  // Countdown timer effect tính trực tiếp từ (targetDeadlineMs - serverNowMs) để mọi client luôn khớp giây và không bị trôi khi chuyển tab
  useEffect(() => {
    if (isLoading || isEnded || roomStatus === "PAUSED") return;

    const tick = () => {
      const deadline = targetDeadlineMsRef.current;
      setRemainingSeconds((prev) => {
        if (!deadline) {
          return prev;
        }
        const nextSec = computeRemainingSecondsFromTarget(deadline);
        if (nextSec === prev) return prev;

        if (prev > 0 && nextSec === 0) {
          if (roomStatusRef.current === "SOON") {
            setTimeout(() => refetchRoomDetail({ cancelRefetch: true }), 150);
            return 0;
          }
          setIsEnded(true);
          setRoomStatus("END");
          if (!hasAnnouncedEndRef.current) {
            hasAnnouncedEndRef.current = true;
            const winner = leaderRef.current || "Không có người đặt giá";
            const finalPriceStr =
              currentPriceRef.current > 0 ? formatMoney(currentPriceRef.current) : "giá khởi điểm";
            addSystemNotice(
              `Phiên đấu giá kết thúc! Người thắng cuộc: ${winner} với mức giá: ${finalPriceStr}`
            );
          }
          setTimeout(() => refetchRoomDetail({ cancelRefetch: true }), 2200);
          return 0;
        }

        if (!hasWarned30sRef.current && nextSec > 0 && nextSec <= 30 && roomStatusRef.current === "LIVE") {
          hasWarned30sRef.current = true;
          addSystemNotice("Phiên đấu giá chỉ còn 30 giây!");
          soundManager.playWarningSound(soundEnabledRef.current);
        }

        return nextSec;
      });
    };

    tick();
    const timer = setInterval(tick, 200);
    return () => clearInterval(timer);
  }, [isLoading, isEnded, roomStatus, addSystemNotice, refetchRoomDetail]);

  // Safety polling fallback: nếu phiên SOON đã đếm về 00:00 (khách chưa đăng nhập không mở WS hoặc scheduler trễ nhịp 2s),
  // tự đồng bộ lại từ server mỗi 1.5 giây tới khi chuyển hẳn sang LIVE/END
  useEffect(() => {
    if (isLoading || roomStatus !== "SOON" || remainingSeconds > 0 || !targetCode) {
      return;
    }
    const poll = setInterval(() => {
      refetchRoomDetail({ cancelRefetch: true });
    }, 1500);
    return () => clearInterval(poll);
  }, [isLoading, roomStatus, remainingSeconds, targetCode, refetchRoomDetail]);

  return {
    currentUser,
    isLoading,
    isConnected,
    sessionCode,
    setSessionCode,
    title,
    plateNumber,
    provinceName,
    plateType,
    vehicleType,
    currentPrice,
    setCurrentPrice,
    stepPrice,
    depositAmount,
    reserveMet,
    remainingSeconds,
    setRemainingSeconds,
    roomStatus,
    setRoomStatus,
    isEnded,
    setIsEnded,
    leader,
    setLeader,
    myLastBid,
    setMyLastBid,
    userLeadState,
    isPopping,
    soundEnabled,
    setSoundEnabled,
    pinnedNotice,
    activeDetailTab,
    setActiveDetailTab,
    activeRightTab,
    setActiveRightTab,
    customBidInput,
    setCustomBidInput,
    chatInput,
    setChatInput,
    autoBidEnabled,
    setAutoBidEnabled,
    autoBidMax,
    setAutoBidMax,
    confirmModal,
    setConfirmModal,
    isRegistered,
    setIsRegistered,
    userRole,
    setUserRole,
    isRegistrationLoading,
    canChat: Boolean(isRegistered || isAdminUser || userRole === "BIDDER" || userRole === "ADMIN"),
    walletAvailable: walletData?.available ?? 0,
    depositModalOpen,
    setDepositModalOpen,
    refetchRegistration,
    refetchWallet,
    refetchAutoBid,
    priceSeriesData,
    isPriceSeriesLoading,
    isWatched,
    setIsWatched,
    isWatchStatusLoading,
    refetchWatchStatus,
    lots,
    setLots,
    chatMessages,
    setChatMessages,
    bidHistory,
    setBidHistory,
    participants,
    sendSocketBid,
    sendSocketChat,
    addSystemNotice,
    handleAuctionUpdate,
  };
};
