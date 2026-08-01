"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { PasswordInput } from "@/components/PasswordInput";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { useAuth } from "@/src/hooks/useAuth";
import { userService } from "@/src/services/user.service";
import { formatApiError } from "@/src/utils/apiError";
import type { PublicUser } from "@/src/api/auth.api";

const GENDER_OPTIONS = [
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

const inputClass =
  "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm";

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function userProfileKey(user: PublicUser): string {
  return [
    user.id,
    user.fullName ?? "",
    user.phoneNumber ?? "",
    user.countryCode ?? "",
    user.dateOfBirth ?? "",
    user.gender ?? "",
  ].join("|");
}

function AccountContent() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [syncedKey, setSyncedKey] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sync form from AuthProvider user when server profile changes (React render-time adjust).
  if (user) {
    const key = userProfileKey(user);
    if (key !== syncedKey) {
      setSyncedKey(key);
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setCountryCode(user.countryCode || "+91");
      setDateOfBirth(toDateInputValue(user.dateOfBirth));
      setGender(user.gender || "prefer_not_to_say");
    }
  }

  const displayName =
    user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Traveler";

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email || "U").slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileMessage("");
    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }
    setProfileSaving(true);
    try {
      await userService.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        countryCode: countryCode.trim() || null,
        dateOfBirth: dateOfBirth || null,
        gender,
      });
      await refreshUser();
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(formatApiError(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await userService.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setPasswordError(formatApiError(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-1">
              My Account
            </p>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 capitalize">
              {displayName}&apos;s Profile
            </h1>
            <p className="text-slate-400 font-medium mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-14 h-14 bg-[#0f2c4c] text-white rounded-full flex items-center justify-center font-black text-lg">
                {initials}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[28px] shadow-xl border border-slate-100 p-6 md:p-8 mb-6 space-y-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Profile details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Country code
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+91"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Date of birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              Role: {user.role || "user"}
            </span>
            <span className="bg-slate-100 px-3 py-1 rounded-full">
              {user.isVerified ? "Verified" : "Unverified"}
            </span>
            {user.authProviders?.local && (
              <span className="bg-slate-100 px-3 py-1 rounded-full">Local</span>
            )}
            {user.authProviders?.google && (
              <span className="bg-slate-100 px-3 py-1 rounded-full">Google</span>
            )}
          </div>

          {profileError && (
            <p className="text-red-500 text-sm font-bold">{profileError}</p>
          )}
          {profileMessage && (
            <p className="text-green-600 text-sm font-bold">{profileMessage}</p>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="w-full sm:w-auto bg-[#0f2c4c] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition disabled:opacity-60"
          >
            {profileSaving ? "Saving..." : "Save profile"}
          </button>
        </div>

        <div className="bg-white rounded-[28px] shadow-xl border border-slate-100 p-6 md:p-8 mb-6 space-y-4">
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Change password
          </h2>
          {!user.authProviders?.local && (
            <p className="text-amber-700 text-sm font-bold bg-amber-50 border border-amber-200 rounded-2xl p-3">
              This account uses Google sign-in. Setting a password is optional
              and may require your current password if one was set later.
            </p>
          )}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Current password
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              New password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Confirm new password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm font-bold">{passwordError}</p>
          )}
          {passwordMessage && (
            <p className="text-green-600 text-sm font-bold">{passwordMessage}</p>
          )}
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={passwordSaving}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition disabled:opacity-60"
          >
            {passwordSaving ? "Updating..." : "Update password"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push("/bookings")}
            className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition"
          >
            My bookings
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}
