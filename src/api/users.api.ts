import { apiClient } from "@/src/api/client";
import type { ApiSuccess, PublicUser } from "@/src/api/auth.api";

export type UpdateProfilePayload = {
  fullName?: string;
  phoneNumber?: string | null;
  countryCode?: string | null;
  dateOfBirth?: string | null;
  gender?: string;
  profileImage?: string | null;
};

export type ChangePasswordPayload = {
  currentPassword?: string;
  newPassword: string;
};

export type MeResponseData = {
  user: PublicUser;
};

export const usersApi = {
  getMe() {
    return apiClient.get<ApiSuccess<MeResponseData>>("/api/v1/users/me");
  },

  getProfile() {
    return apiClient.get<ApiSuccess<PublicUser>>("/api/v1/users/profile");
  },

  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.put<ApiSuccess<PublicUser>>(
      "/api/v1/users/profile",
      payload
    );
  },

  changePassword(payload: ChangePasswordPayload) {
    return apiClient.put<ApiSuccess<null>>(
      "/api/v1/users/change-password",
      payload
    );
  },

  deleteAccount(payload?: { password?: string }) {
    return apiClient.delete<ApiSuccess<null>>("/api/v1/users/account", {
      data: payload ?? {},
    });
  },
};
