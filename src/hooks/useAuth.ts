"use client";

import { useContext } from "react";
import {
  AuthContext,
  type AuthContextValue,
} from "@/src/providers/AuthProvider";

/**
 * Consumes Express AuthProvider. Throws if used outside the provider.
 * Existing pages must not call this until they are migrated.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
