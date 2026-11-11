export const formatMoney = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return "0 ₫";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
};

export const parseMoney = (s: string | undefined | null): number => {
  if (!s) return 0;
  return parseInt(s.replace(/\D/g, ""), 10) || 0;
};

export const formatCountdown = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "00:00:00";
  const safe = Math.floor(seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const maskUserName = (name: string | undefined | null): string => {
  if (!name) return "u***";
  if (name.length <= 3) return name.charAt(0) + "***";
  return name.charAt(0) + "***" + name.substring(name.length - 2);
};

export const getCurrentTimeString = (): string => {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
};
