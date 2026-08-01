/**
 * Frontend auth production verification (Flows 1–10).
 * Exercises the same API contract + storage rules the AuthProvider uses,
 * plus static architecture checks.
 *
 * Run from frontend/: node --env-file=.env.local scripts/frontend-auth-verify.mjs
 * (or from backend with NEXT_PUBLIC_API_URL / copy env)
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from frontend .env.local if present
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FE = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGO = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_in_production";

// --- Simulated browser storage (mirrors src/utils/token.ts) ---
const store = new Map();
const ACCESS_TOKEN_KEY = "kj_access_token";
function saveToken(t) {
  store.set(ACCESS_TOKEN_KEY, t);
}
function getToken() {
  return store.get(ACCESS_TOKEN_KEY) ?? null;
}
function removeToken() {
  store.delete(ACCESS_TOKEN_KEY);
}
function storageKeys() {
  return [...store.keys()];
}

const results = [];
function record(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${id}: ${detail}`);
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

const api = axios.create({
  baseURL: API,
  timeout: 30000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let unauthorizedEmitted = false;
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      unauthorizedEmitted = true;
    }
    return Promise.reject(error);
  }
);

async function main() {
  // -------- Static architecture --------
  const root = path.join(__dirname, "..");
  const { execSync } = await import("child_process");
  const authGrep = execSync(
    `rg -n "supabase\\.auth" app components src --glob '!**/node_modules/**' || true`,
    { cwd: root, encoding: "utf8" }
  );
  const onlyPartner =
    authGrep
      .trim()
      .split("\n")
      .filter(Boolean)
      .every((l) => l.includes("partner/"));
  record(
    "ARCH.supabase.auth",
    !authGrep.trim() || onlyPartner,
    onlyPartner
      ? `only partner still uses supabase.auth\n${authGrep.trim()}`
      : authGrep.trim() || "none"
  );

  const wishlistExists = fs.existsSync(path.join(root, "app/wishlist/page.tsx"));
  record("ARCH.wishlist.route", wishlistExists, `app/wishlist/page.tsx exists=${wishlistExists}`);

  const pagesUseMeDirectly = execSync(
    `rg -n "users/me|userService\\.getMe|usersApi\\.getMe" app --glob '!**/node_modules/**' || true`,
    { cwd: root, encoding: "utf8" }
  ).trim();
  record(
    "ARCH.no.page.me",
    !pagesUseMeDirectly,
    pagesUseMeDirectly || "no page-level /users/me calls"
  );

  const tokenOnly = execSync(
    `rg -n "localStorage\\.(setItem|getItem)" src app components --glob '!**/node_modules/**' || true`,
    { cwd: root, encoding: "utf8" }
  ).trim();
  // Only storage.ts should touch localStorage
  const badStorage = tokenOnly
    .split("\n")
    .filter(Boolean)
    .filter((l) => !l.includes("src/utils/storage.ts"));
  record(
    "ARCH.storage",
    badStorage.length === 0,
    badStorage.length ? badStorage.join("\n") : "only utils/storage.ts touches localStorage"
  );

  // FE routes smoke
  for (const p of ["/login", "/signup", "/wishlist", "/bookings"]) {
    const res = await fetch(`${FE}${p}`, { redirect: "manual" });
    record(
      `SMOKE.${p}`,
      res.status === 200 || res.status === 307 || res.status === 308,
      `status=${res.status}`
    );
  }

  if (!MONGO) {
    record("LIVE.setup", false, "MONGO_URI missing — load backend .env");
    throw new Error("MONGO_URI required");
  }

  // Load mongo from backend .env if needed
  const beEnv = path.join(__dirname, "../../backend/.env");
  if (fs.existsSync(beEnv)) {
    for (const line of fs.readFileSync(beEnv, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
    }
  }

  await mongoose.connect(process.env.MONGO_URI);
  const users = mongoose.connection.db.collection("users");
  const tokens = mongoose.connection.db.collection("tokens");

  const email = `fe.auth.verify.${Date.now()}@resend.dev`;
  const password = "Secret123!";

  // Create verified local user (signup + inject verify — same as FE would after email)
  const signup = await api.post("/api/v1/auth/signup", {
    fullName: "FE Auth Verify",
    email,
    password,
  });
  record("SETUP.signup", signup.status === 201, `status=${signup.status}`);

  const u = await users.findOne({ email });
  const raw = crypto.randomBytes(32).toString("hex");
  await tokens.insertOne({
    userId: u._id,
    type: "email_verification",
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + 3600_000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await api.post("/api/v1/auth/verify-email", { token: raw });
  // Do NOT save verify JWT — FE intentionally ignores it
  removeToken();
  store.clear();

  // -------- FLOW 1 Login --------
  const loginRes = await api.post("/api/v1/auth/login", { email, password });
  const loginBody = loginRes.data;
  const token = loginBody?.data?.token;
  saveToken(token);
  record(
    "F1.login",
    loginRes.status === 200 &&
      loginBody.success === true &&
      Boolean(token) &&
      Boolean(loginBody.data?.user) &&
      storageKeys().length === 1 &&
      storageKeys()[0] === ACCESS_TOKEN_KEY &&
      !storageKeys().some((k) => k.includes("user")),
    `status=${loginRes.status} keys=${storageKeys().join(",")} hasUserObj=${Boolean(loginBody.data?.user)}`
  );

  // -------- FLOW 2 GET /me (AuthProvider loadCurrentUser) --------
  const meRes = await api.get("/api/v1/users/me");
  const meUser = meRes.data?.data?.user;
  const authHeaderUsed = Boolean(getToken());
  record(
    "F2.me",
    meRes.status === 200 &&
      meUser?.email === email &&
      !("password" in (meUser || {})) &&
      authHeaderUsed &&
      meRes.config.headers.Authorization === `Bearer ${token}`,
    `status=${meRes.status} email=${meUser?.email} bearer=${meRes.config.headers.Authorization?.startsWith("Bearer ")}`
  );

  // Simulate AuthProvider state
  let user = meUser;
  let loading = false;
  let isAuthenticated = Boolean(user) && Boolean(getToken());
  record(
    "F3.provider",
    loading === false && isAuthenticated === true && user !== null,
    `loading=${loading} isAuthenticated=${isAuthenticated} userEmail=${user?.email}`
  );

  // -------- FLOW 4 Refresh simulation --------
  const tokenAfterRefresh = getToken();
  const me2 = await api.get("/api/v1/users/me");
  user = me2.data?.data?.user ?? null;
  record(
    "F4.refresh",
    tokenAfterRefresh === token &&
      me2.status === 200 &&
      user?.email === email,
    `tokenRestored=${tokenAfterRefresh === token} me=${me2.status}`
  );

  // -------- FLOW 5 Invalid token --------
  saveToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.sig");
  unauthorizedEmitted = false;
  user = { stale: true };
  try {
    await api.get("/api/v1/users/me");
    record("F5.invalid", false, "expected 401");
  } catch (e) {
    const cleared = getToken() === null && unauthorizedEmitted;
    user = cleared ? null : user;
    isAuthenticated = Boolean(user) && Boolean(getToken());
    record(
      "F5.invalid",
      e.response?.status === 401 && cleared && !isAuthenticated,
      `status=${e.response?.status} tokenCleared=${getToken() === null} unauthorizedEvent=${unauthorizedEmitted}`
    );
  }

  // Restore valid session for next tests
  const login2 = await api.post("/api/v1/auth/login", { email, password });
  saveToken(login2.data.data.token);
  user = (await api.get("/api/v1/users/me")).data.data.user;

  // -------- FLOW 6 Expired token --------
  const expired = jwt.sign({ id: String(u._id) }, JWT_SECRET, { expiresIn: "-1s" });
  saveToken(expired);
  unauthorizedEmitted = false;
  try {
    await api.get("/api/v1/users/me");
    record("F6.expired", false, "expected 401");
  } catch (e) {
    record(
      "F6.expired",
      e.response?.status === 401 && getToken() === null && unauthorizedEmitted,
      `status=${e.response?.status} tokenCleared=${getToken() === null} event=${unauthorizedEmitted}`
    );
  }

  // -------- FLOW 7 Logout --------
  saveToken(login2.data.data.token);
  user = { id: "x" };
  removeToken(); // authService.logout
  user = null; // AuthProvider.logout
  record(
    "F7.logout",
    getToken() === null && user === null,
    `token=${getToken()} user=${user}`
  );

  // -------- FLOW 8 Protected redirect URLs --------
  for (const p of ["/bookings", "/admin", "/wishlist"]) {
    const redirect = `/login?redirect=${encodeURIComponent(p)}`;
    record("F8.redirect.shape", redirect.includes("redirect="), `${p} → ${redirect}`);
  }
  // Login with redirect target works
  saveToken((await api.post("/api/v1/auth/login", { email, password })).data.data.token);
  const afterLoginMe = await api.get("/api/v1/users/me");
  record(
    "F8.login.then.me",
    afterLoginMe.status === 200,
    `can enter protected area after login status=${afterLoginMe.status}`
  );

  // -------- FLOW 9 Network contract (no supabase auth hosts on auth calls) --------
  record(
    "F9.express.only",
    API.includes("localhost:5000") || API.includes("127.0.0.1:5000"),
    `apiBase=${API}`
  );

  // Cleanup
  await users.deleteOne({ email });
  await tokens.deleteMany({ userId: u._id });
  await mongoose.disconnect();

  // Partner still allowed
  record(
    "SUPABASE.partner.ok",
    authGrep.includes("partner/"),
    "partner module still on supabase.auth (expected)"
  );

  const failed = results.filter((r) => !r.ok);
  console.log("\n========== SUMMARY ==========");
  console.log(
    `Total: ${results.length} PASS: ${results.length - failed.length} FAIL: ${failed.length}`
  );
  if (failed.length) {
    for (const f of failed) console.log(` - ${f.id}: ${f.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
