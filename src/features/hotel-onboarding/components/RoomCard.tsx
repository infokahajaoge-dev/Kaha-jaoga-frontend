"use client";

import type { RoomDraft } from "../types/draft";
import {
  BED_TYPES,
  MAX_GUESTS_OPTIONS,
  ROOM_FEATURE_CHIPS,
  ROOM_PHOTO_KEYS,
  type RoomPhotoKey,
} from "../constants/enums";

type RoomCardProps = {
  room: RoomDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof RoomDraft, value: RoomDraft[keyof RoomDraft]) => void;
  onRemove: () => void;
  onPhoto: (photoKey: RoomPhotoKey, file: File | null) => void;
};

export function RoomCard({
  room,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onPhoto,
}: RoomCardProps) {
  return (
    <div className="border-2 border-slate-100 rounded-[24px] p-4 md:p-6 hover:border-blue-200 transition">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0f2c4c] rounded-full flex items-center justify-center text-white font-black text-xs">
            {index + 1}
          </div>
          <h3 className="font-black text-base">Room Type {index + 1}</h3>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 font-black text-xs bg-red-50 px-3 py-1 rounded-xl hover:bg-red-100 transition"
          >
            ✕ Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Room Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Deluxe Room"
            value={room.room_name}
            onChange={(e) => onUpdate("room_name", e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Bed Type *
          </label>
          <select
            value={room.bed_type}
            onChange={(e) => onUpdate("bed_type", e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
          >
            {BED_TYPES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Area (sq ft)
          </label>
          <input
            type="number"
            placeholder="e.g. 250"
            value={room.area_sqm}
            onChange={(e) => onUpdate("area_sqm", e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Max Guests
          </label>
          <select
            value={room.max_guests}
            onChange={(e) => onUpdate("max_guests", e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
          >
            {MAX_GUESTS_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g} Guest{g !== "1" ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            No. of Rooms
          </label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={room.total_rooms}
            onChange={(e) => onUpdate("total_rooms", e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Price Per Night (₹) *
          </label>
          <input
            type="number"
            placeholder="e.g. 3000"
            value={room.price_per_night}
            onChange={(e) => onUpdate("price_per_night", e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Air Conditioning
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onUpdate("has_ac", true)}
              className={`flex-1 py-3 rounded-2xl font-black text-sm transition ${
                room.has_ac
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              ❄️ AC
            </button>
            <button
              type="button"
              onClick={() => onUpdate("has_ac", false)}
              className={`flex-1 py-3 rounded-2xl font-black text-sm transition ${
                !room.has_ac
                  ? "bg-slate-600 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              🌀 Non-AC
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Room Features
        </label>
        <input
          type="text"
          placeholder="e.g. Balcony, City View, Mini Bar"
          value={room.features}
          onChange={(e) => onUpdate("features", e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 font-bold text-sm"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {ROOM_FEATURE_CHIPS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                const current = room.features
                  ? room.features.split(",").map((x) => x.trim())
                  : [];
                if (!current.includes(f)) {
                  onUpdate(
                    "features",
                    [...current, f].filter(Boolean).join(", ")
                  );
                }
              }}
              className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition border border-slate-200"
            >
              + {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
          Room Photos (up to 3)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROOM_PHOTO_KEYS.map((photoKey, pi) => {
            const preview = room[
              `preview${pi + 1}` as keyof RoomDraft
            ] as string;
            return (
              <div
                key={photoKey}
                className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 transition"
              >
                {preview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      className="w-full h-24 object-cover"
                      alt={`Room photo ${pi + 1}`}
                    />
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                      ✓
                    </div>
                    <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-black/40 flex items-center justify-center transition">
                      <span className="text-white font-black text-xs">
                        Change
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) =>
                          onPhoto(photoKey, e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-slate-50 transition">
                    <span className="text-xl mb-1">📷</span>
                    <span className="text-[9px] font-black text-slate-400">
                      Photo {pi + 1}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) =>
                        onPhoto(photoKey, e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
