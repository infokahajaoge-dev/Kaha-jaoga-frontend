/**
 * Browser storage helpers. Safe for SSR (no-ops / null when window is undefined).
 */

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function getItem(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota / private mode — ignore
  }
}

export function removeItem(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getJSON<T>(key: string): T | null {
  const raw = getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON(key: string, value: unknown): void {
  setItem(key, JSON.stringify(value));
}
