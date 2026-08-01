import { apiClient } from "@/src/api/client";

/** Public user shape returned by Express auth / users endpoints. */
export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  dateOfBirth: string | null;
  gender: string;
  role: string;
  authProviders: {
    local: boolean;
    google: boolean;
  };
  isVerified: boolean;
  lastLoginAt: string | null;
  lastLoginMethod: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type AuthTokenData = {
  token: string;
  user: PublicUser;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  token: string;
};

export type ResendVerificationPayload = {
  email: string;
};

export type GoogleAuthPayload = {
  idToken: string;
};

export const authApi = {
  signup(payload: SignupPayload) {
    return apiClient.post<ApiSuccess<null>>("/api/v1/auth/signup", payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiSuccess<AuthTokenData>>(
      "/api/v1/auth/login",
      payload
    );
  },

  verifyEmail(payload: VerifyEmailPayload) {
    return apiClient.post<ApiSuccess<AuthTokenData>>(
      "/api/v1/auth/verify-email",
      payload
    );
  },

  resendVerification(payload: ResendVerificationPayload) {
    return apiClient.post<ApiSuccess<null>>(
      "/api/v1/auth/resend-verification",
      payload
    );
  },

  google(payload: GoogleAuthPayload) {
    return apiClient.post<ApiSuccess<AuthTokenData>>(
      "/api/v1/auth/google",
      payload
    );
  },
};
