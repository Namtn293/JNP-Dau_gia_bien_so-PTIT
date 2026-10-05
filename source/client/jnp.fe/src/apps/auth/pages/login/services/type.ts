export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthUserData {
  email: string;
  name: string;
  provider: "email" | "google";
  role?: string;
  deposit?: number;
}
