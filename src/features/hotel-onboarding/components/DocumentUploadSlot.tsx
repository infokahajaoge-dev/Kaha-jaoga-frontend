"use client";

import type { DocumentSlotKey } from "../constants/enums";

type DocumentUploadSlotProps = {
  slot: DocumentSlotKey;
  hasFile: boolean;
  fileName?: string;
  emptyTitle: string;
  emptyIcon: string;
  onSelect: (file: File | null) => void;
};

export function DocumentUploadSlot({
  hasFile,
  fileName,
  emptyTitle,
  emptyIcon,
  onSelect,
}: DocumentUploadSlotProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-5 transition ${
        hasFile
          ? "border-green-400 bg-green-50"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <label className="cursor-pointer flex flex-col items-center gap-2">
        {hasFile ? (
          <>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
              {emptyIcon}
            </div>
            <p className="font-black text-green-700 text-sm">✓ {fileName}</p>
            <p className="text-green-600 text-xs font-bold">Click to change</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">
              {emptyIcon}
            </div>
            <p className="font-black text-slate-700 text-sm">{emptyTitle}</p>
            <p className="text-slate-400 text-xs font-bold">
              PDF only (max 5MB)
            </p>
            <div className="bg-[#0f2c4c] text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">
              {emptyTitle.includes("GST") ? "Upload GST" : "Upload Aadhaar"}
            </div>
          </>
        )}
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}
