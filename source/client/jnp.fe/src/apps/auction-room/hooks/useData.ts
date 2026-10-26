import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuctionRoomDetailQuery } from "../services/query";
import { useAuctionRoomSocket } from "./useAuctionRoomSocket";
import type {
  AuctionLot,
  BidHistoryItem,
  ChatMessage,
  RoomParticipant,
  WsAuctionMessage,
  WsChatMessage,
  WsRoomEvent,
} from "../services/type";
import { formatMoney, getCurrentTimeString } from "../util/format";
import { soundManager } from "../feature/audio";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { lcStorage } from "@/shared/utils";

export const useData = (roomId: string) => {
  const currentUser = useMemo(() => {
    return lcStorage.get<any>(LOCAL_STORAGE_KEYS.user) || {
      name: "Bạn",
      id: "U-ME",
    };
  }, []);

  const selfName = currentUser?.fullName || currentUser?.name || "Bạn";
  const selfId = currentUser?.id ? String(currentUser.id) : "U-ME";

  // 1. Fetch initial detail from API
  const { data: initialDetail, isLoading } = useAuctionRoomDetailQuery(roomId);

  // 2. Real-time state
  const [sessionCode, setSessionCode] = useState(roomId || "");
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
  const [isEnded, setIsEnded] = useState(false);
  const [leader, setLeader] = useState<string>("");
  const [myLastBid, setMyLastBid] = useState<number | null>(null);
  const [isPopping, setIsPopping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pinnedNotice, setPinnedNotice] = useState("");

  // UI Tabs & Inputs
  const [activeDetailTab, setActiveDetailTab] = useState("desc");
  const [activeRightTab, setActiveRightTab] = useState<"chat" | "hist" | "ppl">("chat");
  const [customBidInput, setCustomBidInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState("");
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; amount: number }>({
    open: false,
    amount: 0,
  });

  // Collections
  const [lots, setLots] = useState<AuctionLot[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>(() => [
    {
      id: selfId,
      name: selfName,
      role: "Người tham gia",
      statusText: "Đang trực tuyến",
      isSelf: true,
      isLeader: false,
    },
  ]);

  // Synchronize participants from bids + currentUser
  const syncParticipants = useCallback(
    (bids: BidHistoryItem[], currentLeadUser?: string) => {
      setParticipants((prev) => {
        const map = new Map<string, RoomParticipant>();

        // Always register current user (self)
        map.set(selfName, {
          id: selfId,
          name: selfName,
          role: "Người tham gia",
          statusText: "Đang trực tuyến",
          isSelf: true,
          isLeader: selfName === currentLeadUser || currentLeadUser === "Bạn",
        });

        // Keep any existing participants (e.g. from real-time events)
        prev.forEach((p) => {
          map.set(p.name, p);
        });

        // Add real bidders from database / API
        bids.forEach((b, idx) => {
          const isLead = b.isWinning || b.userName === currentLeadUser;
          const isSelf = b.userName === selfName || b.isMine;
          map.set(b.userName, {
            id: map.get(b.userName)?.id || `BIDDER-${idx}-${b.userName}`,
            name: b.userName,
            role: "Người tham gia",
            statusText: isLead ? "Dẫn đầu" : "Đã đặt giá",
            isSelf,
            isLeader: isLead,
          });
        });

        return Array.from(map.values());
      });
    },
    [selfName, selfId]
  );

  // Sync initial query detail (guarded with ref to run only once per payload)
  const lastSyncedDetailRef = useRef<any>(null);

  useEffect(() => {
    if (!initialDetail) return;
    if (lastSyncedDetailRef.current === initialDetail) return;
    lastSyncedDetailRef.current = initialDetail;

    setSessionCode(initialDetail.sessionCode || roomId);
    setTitle(initialDetail.title || "Phiên đấu giá trực tuyến");
    setPlateNumber(initialDetail.plateNumber || "");
    setProvinceName(initialDetail.provinceName || "");
    setPlateType(initialDetail.plateType || "");
    setVehicleType(initialDetail.vehicleType || "");
    setCurrentPrice(initialDetail.currentPrice || initialDetail.startPrice || 0);
    setStepPrice(initialDetail.stepPrice || 5_000_000);
    setDepositAmount(initialDetail.depositAmount || 40_000_000);
    setReserveMet(initialDetail.reserveMet ?? true);
    setRemainingSeconds(initialDetail.remainingSeconds || 0);
    setIsEnded(initialDetail.status === "END");
    if (initialDetail.leadingUser) setLeader(initialDetail.leadingUser);
    if (initialDetail.pinnedNotice) setPinnedNotice(initialDetail.pinnedNotice);
    if (initialDetail.lots?.length) setLots(initialDetail.lots);
    if (initialDetail.initialBids) {
      setBidHistory(initialDetail.initialBids);
      syncParticipants(initialDetail.initialBids, initialDetail.leadingUser);
    } else {
      syncParticipants([], initialDetail.leadingUser);
    }
  }, [initialDetail, roomId, syncParticipants]);

  // Derived user lead state
  const userLeadState: "none" | "leading" | "outbid" =
    myLastBid === null
      ? "none"
      : leader === "Bạn" || leader === selfName
      ? "leading"
      : "outbid";

  // System notification helper in chat feed
  const addSystemNotice = useCallback((content: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        senderName: "Hệ thống",
        content,
        time: getCurrentTimeString(),
        isSystem: true,
      },
    ]);
  }, []);

  // WebSocket message handlers
  const handleAuctionUpdate = useCallback(
    (msg: WsAuctionMessage) => {
      if (msg.status === "END") {
        setIsEnded(true);
        setRemainingSeconds(0);
      } else if (msg.status === "LIVE") {
        setIsEnded(false);
      }

      if (msg.currentPrice && msg.currentPrice > currentPrice) {
        setCurrentPrice(msg.currentPrice);
        setIsPopping(true);
        setTimeout(() => setIsPopping(false), 300);

        soundManager.playBidSound(soundEnabled);

        const newLeader = msg.userName || "u***";
        setLeader(newLeader);

        // Record in bid history
        setBidHistory((prev) => [
          {
            userName: newLeader,
            bidAmount: msg.currentPrice!,
            time: msg.timestamp || getCurrentTimeString(),
            isWinning: true,
            isMine: newLeader === "Bạn" || newLeader === selfName,
          },
          ...prev.map((b) => ({ ...b, isWinning: false })),
        ]);

        // Dynamically add/update real bidder in participants
        setParticipants((prev) => {
          const map = new Map<string, RoomParticipant>();
          prev.forEach((p) => {
            map.set(p.name, {
              ...p,
              isLeader: p.name === newLeader,
              statusText: p.name === newLeader ? "Dẫn đầu" : (p.isLeader ? "Đã đặt giá" : p.statusText),
            });
          });
          if (!map.has(newLeader)) {
            map.set(newLeader, {
              id: `BIDDER-${Date.now()}`,
              name: newLeader,
              role: "Người tham gia",
              statusText: "Dẫn đầu",
              isSelf: newLeader === "Bạn" || newLeader === selfName,
              isLeader: true,
            });
          }
          return Array.from(map.values());
        });

        addSystemNotice(`${newLeader} vừa đặt giá ${formatMoney(msg.currentPrice)}`);

        // Anti-snipe extension
        setRemainingSeconds((prev) => {
          if (prev <= 10) {
            addSystemNotice("Có lượt đặt giá phút chót: Tự động gia hạn thêm 30 giây");
            return prev + 30;
          }
          return prev;
        });
      }
    },
    [currentPrice, soundEnabled, selfName, addSystemNotice]
  );

  const handleChatMessage = useCallback((msg: WsChatMessage) => {
    setChatMessages((prev) => {
      // Deduplicate by message ID if present
      if (msg.id && prev.some((m) => m.id === msg.id)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          senderName: msg.senderName,
          content: msg.content,
          time: msg.timestamp || getCurrentTimeString(),
          isHost: msg.senderName.includes("Host") || msg.senderName.includes("Ban tổ chức"),
          isMine: msg.senderName === "Bạn" || msg.senderName === selfName,
        },
      ];
    });

    if (msg.senderName && msg.senderName !== "Hệ thống") {
      setParticipants((prev) => {
        if (prev.some((p) => p.name === msg.senderName)) return prev;
        const isHost = msg.senderName.includes("Host") || msg.senderName.includes("Ban tổ chức");
        const isMonitor = msg.senderName.includes("GiamSat");
        return [
          ...prev,
          {
            id: `CHAT-${Date.now()}-${msg.senderName}`,
            name: msg.senderName,
            role: isHost ? "Ban tổ chức" : isMonitor ? "Giám sát viên" : "Người tham gia",
            statusText: isHost ? "Đang điều phối" : isMonitor ? "Đang giám sát" : "đang trực tuyến",
            isSelf: msg.senderName === "Bạn" || msg.senderName === selfName,
          },
        ];
      });
    }
  }, [selfName]);

  const handleRoomEvent = useCallback(
    (event: WsRoomEvent) => {
      if (event.event === "HALT") {
        addSystemNotice("Phiên đấu giá đã bị tạm dừng khẩn cấp bởi Ban tổ chức.");
      } else if (event.event === "RESUME") {
        addSystemNotice("Phiên đấu giá đã được tiếp tục.");
      } else if (event.event === "END") {
        setIsEnded(true);
        setRemainingSeconds(0);
        addSystemNotice(event.message || "Phiên đấu giá đã kết thúc!");
      } else if (event.event === "START") {
        setIsEnded(false);
        addSystemNotice(event.message || "Phiên đấu giá đã chính thức bắt đầu!");
      } else if (event.message) {
        addSystemNotice(event.message);
      }
      if ((event as any).userName) {
        const uName = (event as any).userName;
        if (event.event === "JOIN") {
          addSystemNotice(`${uName} đã vào phòng đấu giá`);
          setParticipants((prev) => {
            if (prev.some((p) => p.name === uName)) return prev;
            return [
              ...prev,
              {
                id: `JOIN-${Date.now()}`,
                name: uName,
                role: "Người tham gia",
                statusText: "vừa vào phòng",
                isSelf: uName === "Bạn" || uName === selfName,
              },
            ];
          });
        } else if (event.event === "LEAVE") {
          addSystemNotice(`${uName} đã rời khỏi phòng đấu giá`);
          setParticipants((prev) => prev.filter((p) => p.name !== uName));
        }
      }
    },
    [addSystemNotice, selfName]
  );

  // Connect STOMP WebSocket
  const { isConnected, sendBid: sendSocketBid, sendChatMessage: sendSocketChat } =
    useAuctionRoomSocket({
      roomId: sessionCode,
      onAuctionUpdate: handleAuctionUpdate,
      onChatMessage: handleChatMessage,
      onRoomEvent: handleRoomEvent,
      enabled: !isEnded,
    });

  // Countdown timer effect
  useEffect(() => {
    if (isEnded) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsEnded(true);
          const winner = leader || "Không có người đặt giá";
          const finalPriceStr = currentPrice > 0 ? formatMoney(currentPrice) : "giá khởi điểm";
          addSystemNotice(`Phiên đấu giá kết thúc! Người thắng cuộc: ${winner} với mức giá ${finalPriceStr}`);
          return 0;
        }
        if (prev === 31) {
          addSystemNotice("Phiên đấu giá chỉ còn 30 giây!");
          soundManager.playWarningSound(soundEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnded, leader, currentPrice, soundEnabled, addSystemNotice]);

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
