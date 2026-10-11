export interface GoogleCallbackQuery {
  isNewUser?: string;
  token?: string;
  tempToken?: string;
  email?: string;
  fullName?: string;
  error?: string;
}

export interface CompleteGoogleRegistrationPayload {
  tempToken: string;
  fullName: string;
  phoneNumber: string;
  dob?: string;
  address?: string;
  userName?: string;
  password?: string;
}

export interface CompleteGoogleRegistrationResponse {
  code?: number;
  success?: boolean;
  message?: string | null;
  data?: string;
}

export interface GoogleRegisterFormValues {
  fullName: string;
  phoneNumber: string;
  dob?: any;
  address?: string;
}

export interface UserSessionProfile {
  email: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  dob?: string;
  provider: "google";
  role: string;
}
