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
  dob?: string;
  phoneNumber?: string;
  address?: string;
}

export interface GoogleProfile {
  email: string;
  fullName: string;
  tempToken?: string;
}

export interface GoogleRegistrationFormValues {
  fullName: string;
  email: string;
  dob: any;
  phoneNumber: string;
  address: string;
}

export interface GoogleAuthCheckResult {
  isNewUser: boolean;
  email: string;
  fullName: string;
  token?: string;
  tempToken?: string;
}
