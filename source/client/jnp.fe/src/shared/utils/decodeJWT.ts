import { jwtDecode } from "jwt-decode";

export type AppJwtPayload = {
  userId: number;
  username: string;
  roles: string[];
  exp: number;
  DonViId: number;
};

export const getJwtValue = <K extends keyof AppJwtPayload>(
  token: string | null,
  key: K
): AppJwtPayload[K] | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<AppJwtPayload>(token);
    return decoded[key] ?? null;
  } catch {
    return null;
  }
};
