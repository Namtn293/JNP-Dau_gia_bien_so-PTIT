import { useState, useMemo } from "react";
import tokenManager from "@/shared/utils/tokenManager";
import { parseJwt } from "@/shared/utils/jwt";
import { useWalletQuery, useWalletTransactionsQuery } from "../services/query";
import type { UserProfile } from "../services/type";

export const useData = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [txType, setTxType] = useState<string | undefined>(undefined);

  const token = tokenManager.getAccessToken();
  const isLogin = Boolean(token);

  // 1. Trích xuất thông tin người dùng
  const userProfile: UserProfile | null = useMemo(() => {
    if (!token) return null;
    const payload = parseJwt(token);
    if (!payload) return null;

    let fullName = payload.fullName || payload.name;
    try {
      const raw = localStorage.getItem("auction_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        fullName = parsed.fullName || parsed.name || fullName;
      }
    } catch {
      // ignore
    }

    const isAdmin = payload.sub === "admin" || payload.roles?.includes("ROLE_ADMIN");
    const displayName =
      fullName ||
      (isAdmin ? "Quản trị hệ thống" : payload.sub || "Người dùng");

    return {
      id: payload.userId || payload.sub,
      username: payload.sub,
      fullName,
      displayName,
      email: payload.email,
      roles: payload.roles || [],
    };
  }, [token]);

  // 2. Query thông tin ví
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useWalletQuery({ enabled: isLogin });

  // 3. Query lịch sử giao dịch
  const {
    data: txData,
    isLoading: isTxLoading,
    isFetching: isTxFetching,
    refetch: refetchTx,
  } = useWalletTransactionsQuery(
    { page, size, type: txType },
    { enabled: isLogin }
  );

  return {
    isLogin,
    userProfile,
    wallet: wallet ?? { balance: 0, heldAmount: 0, available: 0 },
    isWalletLoading,
    refetchWallet,
    transactions: txData?.content ?? [],
    totalTx: txData?.totalElements ?? 0,
    page,
    setPage,
    size,
    setSize,
    txType,
    setTxType,
    isTxLoading,
    isTxFetching,
    refetchTx,
  };
};

