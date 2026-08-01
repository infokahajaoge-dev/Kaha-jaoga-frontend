"use client";

import type { PhotoSlotKey } from "../constants/enums";

type ImageUploadSlotProps = {
  slotKey: PhotoSlotKey;
  label: string;
  icon: string;
  required?: boolean;
  preview?: string;
  onSelect: (file: File | null) => void;
};

export function ImageUploadSlot({
  slotKey,
  label,
  icon,
  required,
  preview,
  onSelect,
}: ImageUploadSlotProps) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 transition">
      {preview ? (
        <div className="relative">
          {/* Data-URL / blob preview — next/image not applicable */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            className="w-full h-40 md:h-48 object-cover"
            alt={label}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-sm">
              Change Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => onSelect(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-black">
            {icon} {label}
          </div>
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-black uppercase">
            ✓ Done
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-36 cursor-pointer hover:bg-slate-50 transition p-4">
          <span className="text-3xl mb-2">{icon}</span>
          <p className="font-black text-slate-700 text-sm mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
          <p className="text-slate-400 text-xs font-bold mb-3">Click to upload</p>
          <div className="bg-[#0f2c4c] text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">
            Choose File
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => onSelect(e.target.files?.[0] || null)}
            data-slot={slotKey}
          />
        </label>
      )}
    </div>
  );
}
