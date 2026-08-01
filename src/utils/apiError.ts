import axios from "axios";

export type ParsedApiError = {
  message: string;
  errors: string[];
};

type BackendErrorBody = {
  success?: boolean;
  message?: string;
  errors?: Array<string | { message?: string; field?: string }>;
};

/**
 * Normalize Express / Axios errors into a single UI-friendly shape.
 */
export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BackendErrorBody | undefined;
    const message =
      (typeof data?.message === "string" && data.message) ||
      error.message ||
      "Something went wrong. Please try again.";

    const errors: string[] = [];
    if (Array.isArray(data?.errors)) {
      for (const item of data.errors) {
        if (typeof item === "string") {
          errors.push(item);
        } else if (item && typeof item === "object") {
          const field = item.field ? `${item.field}: ` : "";
          const msg = item.message || JSON.stringify(item);
          errors.push(`${field}${msg}`);
        }
      }
    }

    return { message, errors };
  }

  if (error instanceof Error) {
    return { message: error.message, errors: [] };
  }

  return { message: "Something went wrong. Please try again.", errors: [] };
}

/** Single string for inline error banners. */
export function formatApiError(error: unknown): string {
  const parsed = parseApiError(error);
  if (parsed.errors.length > 0) {
    return `${parsed.message}: ${parsed.errors.join("; ")}`;
  }
  return parsed.message;
}
