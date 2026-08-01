import { usersApi } from "@/src/api/users.api";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "@/src/api/users.api";

/**
 * User profile orchestration over the API layer.
 * Not used by existing pages yet — foundation only.
 */
export const userService = {
  async getMe() {
    const { data } = await usersApi.getMe();
    return data;
  },

  async getProfile() {
    const { data } = await usersApi.getProfile();
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const { data } = await usersApi.updateProfile(payload);
    return data;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const { data } = await usersApi.changePassword(payload);
    return data;
  },

  async deleteAccount(payload?: { password?: string }) {
    const { data } = await usersApi.deleteAccount(payload);
    return data;
  },
};
