import { useEffect, useState } from "react";

/**
 * Detect OS/browser display scale (devicePixelRatio).
 * Windows 125% scale → devicePixelRatio = 1.25
 * Windows 150% scale → devicePixelRatio = 1.5
 *
 * Trả về zoom CSS ngược lại để compensate, chỉ khi ratio > 1.
 * Ví dụ: ratio 1.25 → zoom 0.8 (80%), ratio 1.5 → zoom 0.667 (66.7%)
 *
 * Áp dụng zoom tối đa để tránh làm UI quá nhỏ trên màn 4K (ratio 2+).
 */
export default function useDeviceScale() {
  const [ratio, setRatio] = useState(() =>
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
  );

  useEffect(() => {
    // Lắng nghe thay đổi zoom/scale trong phiên làm việc
    const updateRatio = () => setRatio(window.devicePixelRatio);

    // Dùng matchMedia để detect thay đổi devicePixelRatio
    const buildMql = () =>
      window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

    let mql = buildMql();
    const handler = () => {
      updateRatio();
      // Re-subscribe cho giá trị mới
      mql.removeEventListener("change", handler);
      mql = buildMql();
      mql.addEventListener("change", handler);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Chỉ scale down khi ratio > 1.1 (để tránh compensate máy Retina/4K không cần thiết)
  // Giới hạn zoom tối thiểu là 0.7 (không nhỏ hơn 70%)
  const compensationZoom = ratio > 1.1 ? Math.max(1 / ratio, 0.7) : 1;

  return { devicePixelRatio: ratio, compensationZoom };
}
