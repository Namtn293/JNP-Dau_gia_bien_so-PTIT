import axiosClient from "@/configs/axios";

let clockOffsetMs = 0; // ước lượng: serverNowMs - clientDateNowMs
let bestRttMs = Number.POSITIVE_INFINITY;
let lastSyncedAtMs = 0;
let inFlightSync: Promise<number> | null = null;

/**
 * Thời gian chuẩn hiện tại tính theo đồng hồ server (UTC epoch ms).
 */
export const getServerNowMs = (): number => Date.now() + clockOffsetMs;

/**
 * Cập nhật độ lệch đồng hồ server-client theo thuật toán Cristian (ưu tiên mẫu RTT thấp nhất).
 */
export const updateServerClockOffset = (
  serverTimeMs?: number | null,
  rttMs: number = 0,
  force: boolean = false
): number => {
  if (!serverTimeMs || !Number.isFinite(serverTimeMs)) {
    return clockOffsetMs;
  }
  const now = Date.now();
  const safeRtt = Math.max(0, rttMs);
  const estimatedOffset = serverTimeMs + Math.round(safeRtt / 2) - now;
  const expired = now - lastSyncedAtMs > 30_000;

  if (force || expired || safeRtt <= bestRttMs + 100) {
    clockOffsetMs = estimatedOffset;
    bestRttMs = safeRtt;
    lastSyncedAtMs = now;
  }
  return clockOffsetMs;
};

/**
 * Đồng bộ đồng hồ client với Backend qua endpoint nhẹ /api/v1/auction/time (không query DB).
 */
export const syncServerClock = async (force = false): Promise<number> => {
  const now = Date.now();
  if (!force && lastSyncedAtMs > 0 && now - lastSyncedAtMs < 15_000) {
    return clockOffsetMs;
  }
  if (inFlightSync) {
    return inFlightSync;
  }

  inFlightSync = (async () => {
    try {
      const t0 = performance.now();
      const res: any = await axiosClient.get("/api/v1/auction/time");
      const t1 = performance.now();
      const rtt = t1 - t0;
      const serverTimeMs = res?.data?.serverTimeMs ?? res?.serverTimeMs;
      return updateServerClockOffset(serverTimeMs, rtt, force);
    } catch {
      return clockOffsetMs;
    } finally {
      inFlightSync = null;
    }
  })();

  return inFlightSync;
};

/**
 * Tính số giây còn lại từ mốc targetEpochMs so với đồng hồ server đã đồng bộ.
 */
export const computeRemainingSecondsFromTarget = (targetEpochMs?: number | null): number => {
  if (!targetEpochMs || !Number.isFinite(targetEpochMs)) return 0;
  const diffMs = targetEpochMs - getServerNowMs();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 1000);
};

/**
 * Suy ra mốc deadline UTC epoch ms từ epochMs của server (ưu tiên), chuỗi ISO hoặc remainingSeconds.
 */
export const resolveTargetEpochMs = (options: {
  epochMs?: number | null;
  isoTime?: string | null;
  remainingSeconds?: number | null;
  serverTimeMs?: number | null;
}): number | null => {
  if (typeof options.epochMs === "number" && options.epochMs > 0) {
    return options.epochMs;
  }
  if (options.isoTime) {
    const parsed = new Date(options.isoTime).getTime();
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  if (typeof options.remainingSeconds === "number" && options.remainingSeconds > 0) {
    const baseNow =
      typeof options.serverTimeMs === "number" && options.serverTimeMs > 0
        ? options.serverTimeMs
        : getServerNowMs();
    return baseNow + options.remainingSeconds * 1000;
  }
  return null;
};

