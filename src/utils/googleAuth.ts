declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason: () => string;
            }) => void
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Sign-In is only available in the browser."));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services."))
      );
      if (window.google?.accounts?.id) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens Google Identity Services and resolves with a Google ID token (JWT).
 */
export async function getGoogleIdToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === "your_google_client_id") {
    throw new Error(
      "Google Sign-In is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID."
    );
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google Identity Services failed to initialize."));
      return;
    }

    let settled = false;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return;
        settled = true;
        if (response?.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("Google did not return an ID token."));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (settled) return;
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        settled = true;
        reject(
          new Error(
            notification.getNotDisplayedReason?.() ||
              "Google Sign-In was cancelled or could not be displayed."
          )
        );
      }
    });
  });
}
