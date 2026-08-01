import { authApi } from "@/src/api/auth.api";
import type {
  GoogleAuthPayload,
  LoginPayload,
  ResendVerificationPayload,
  SignupPayload,
  VerifyEmailPayload,
} from "@/src/api/auth.api";
import { removeToken, saveToken } from "@/src/utils/token";

/**
 * Auth orchestration over the API layer.
 */
export const authService = {
  async signup(payload: SignupPayload) {
    const { data } = await authApi.signup(payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await authApi.login(payload);
    if (data.data?.token) {
      saveToken(data.data.token);
    }
    return data;
  },

  /**
   * Verifies email. Intentionally does NOT persist the returned JWT
   * so the user must sign in after verification.
   */
  async verifyEmail(payload: VerifyEmailPayload) {
    const { data } = await authApi.verifyEmail(payload);
    return data;
  },

  async resendVerification(payload: ResendVerificationPayload) {
    const { data } = await authApi.resendVerification(payload);
    return data;
  },

  async google(payload: GoogleAuthPayload) {
    const { data } = await authApi.google(payload);
    if (data.data?.token) {
      saveToken(data.data.token);
    }
    return data;
  },

  logout() {
    removeToken();
  },
};
