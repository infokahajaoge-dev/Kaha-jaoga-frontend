import { getItem, removeItem, setItem } from "@/src/utils/storage";

const ACCESS_TOKEN_KEY = "kj_access_token";

export function saveToken(token: string): void {
  setItem(ACCESS_TOKEN_KEY, token);
}

export function getToken(): string | null {
  return getItem(ACCESS_TOKEN_KEY);
}

export function removeToken(): void {
  removeItem(ACCESS_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
