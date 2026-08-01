/**
 * Lightweight pub/sub so the Axios 401 interceptor can clear AuthProvider state
 * without importing React into the API client.
 */
type AuthUnauthorizedListener = () => void;

const listeners = new Set<AuthUnauthorizedListener>();

export function onUnauthorized(listener: AuthUnauthorizedListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitUnauthorized(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  }
}
