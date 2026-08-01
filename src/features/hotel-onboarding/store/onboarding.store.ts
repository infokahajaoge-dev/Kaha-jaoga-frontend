"use client";

import { create } from "zustand";
import type {
  AddressDraft,
  DocumentsMetaDraft,
  HotelDraft,
  ObjectKeysState,
  OnboardingDraft,
  OwnerDraft,
  RoomDraft,
  SubmitPhaseState,
} from "../types/draft";
import type {
  DocumentSlotKey,
  PhotoSlotKey,
  RoomPhotoKey,
} from "../constants/enums";
import type { WizardStepIndex } from "../constants/steps";
import { createInitialDraft, defaultRoom } from "./defaults";
import {
  fileTooLargeMessage,
  isFileWithinSizeLimit,
} from "../utils/fileValidation";
import { toast } from "sonner";

type OnboardingActions = {
  setStep: (step: WizardStepIndex) => void;
  setLoading: (loading: boolean) => void;
  setSubmitPhase: (phase: SubmitPhaseState) => void;
  setUploadSessionId: (id: string | null) => void;
  setObjectKeys: (keys: ObjectKeysState) => void;
  /** Sync mutex: returns false if a submit is already in flight. */
  beginSubmit: () => boolean;
  endSubmit: () => void;
  patchHotel: (patch: Partial<HotelDraft>) => void;
  patchAddress: (patch: Partial<AddressDraft>) => void;
  patchOwner: (patch: Partial<OwnerDraft>) => void;
  patchDocumentsMeta: (patch: Partial<DocumentsMetaDraft>) => void;
  setPhoto: (slot: PhotoSlotKey, file: File | null) => void;
  setDoc: (slot: DocumentSlotKey, file: File | null) => void;
  updateRoom: (
    index: number,
    field: keyof RoomDraft,
    value: RoomDraft[keyof RoomDraft]
  ) => void;
  setRoomPhoto: (
    roomIndex: number,
    photoKey: RoomPhotoKey,
    file: File | null
  ) => void;
  addRoom: () => void;
  removeRoom: (index: number) => void;
  replaceRooms: (rooms: RoomDraft[]) => void;
  reset: () => void;
};

export type OnboardingStore = OnboardingDraft & OnboardingActions;

function revokeObjectUrl(url: string | undefined | null) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function revokeRoomPreviews(room: RoomDraft) {
  revokeObjectUrl(room.preview1);
  revokeObjectUrl(room.preview2);
  revokeObjectUrl(room.preview3);
}

function revokeAllPreviewUrls(draft: OnboardingDraft) {
  for (const url of Object.values(draft.previews)) {
    revokeObjectUrl(url);
  }
  for (const room of draft.rooms) {
    revokeRoomPreviews(room);
  }
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...createInitialDraft(),

  setStep: (step) => set({ currentStep: step }),
  setLoading: (loading) => set({ loading }),
  setSubmitPhase: (phase) => set({ submitPhase: phase }),
  setUploadSessionId: (id) => set({ uploadSessionId: id }),
  setObjectKeys: (keys) => set({ objectKeys: keys }),

  beginSubmit: () => {
    if (get().loading) return false;
    set({ loading: true, submitPhase: "submitting" });
    return true;
  },
  endSubmit: () => set({ loading: false, submitPhase: "idle" }),

  patchHotel: (patch) => set((s) => ({ hotel: { ...s.hotel, ...patch } })),

  patchAddress: (patch) =>
    set((s) => ({ address: { ...s.address, ...patch } })),

  patchOwner: (patch) => set((s) => ({ owner: { ...s.owner, ...patch } })),

  patchDocumentsMeta: (patch) =>
    set((s) => ({ documentsMeta: { ...s.documentsMeta, ...patch } })),

  setPhoto: (slot, file) => {
    if (!file) return;
    if (!isFileWithinSizeLimit(file)) {
      toast.error(fileTooLargeMessage());
      return;
    }
    const prev = get().previews[slot];
    revokeObjectUrl(prev);
    const preview = URL.createObjectURL(file);
    set((s) => ({
      photos: { ...s.photos, [slot]: file },
      previews: { ...s.previews, [slot]: preview },
    }));
  },

  setDoc: (slot, file) => {
    if (!file) return;
    if (!isFileWithinSizeLimit(file)) {
      toast.error(fileTooLargeMessage());
      return;
    }
    set((s) => ({
      docs: { ...s.docs, [slot]: file },
      docNames: { ...s.docNames, [slot]: file.name },
    }));
  },

  updateRoom: (index, field, value) => {
    set((s) => ({
      rooms: s.rooms.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
  },

  setRoomPhoto: (roomIndex, photoKey, file) => {
    if (!file) return;
    if (!isFileWithinSizeLimit(file)) {
      toast.error(fileTooLargeMessage());
      return;
    }
    const previewKey = photoKey.replace("photo", "preview") as
      | "preview1"
      | "preview2"
      | "preview3";
    const prev = get().rooms[roomIndex]?.[previewKey];
    revokeObjectUrl(typeof prev === "string" ? prev : undefined);
    const preview = URL.createObjectURL(file);
    set((s) => ({
      rooms: s.rooms.map((r, i) =>
        i === roomIndex
          ? { ...r, [photoKey]: file, [previewKey]: preview }
          : r
      ),
    }));
  },

  addRoom: () => set((s) => ({ rooms: [...s.rooms, defaultRoom()] })),

  removeRoom: (index) => {
    const { rooms } = get();
    if (rooms.length === 1) return;
    const removed = rooms[index];
    if (removed) revokeRoomPreviews(removed);
    set({ rooms: rooms.filter((_, i) => i !== index) });
  },

  replaceRooms: (rooms) => {
    const prev = get().rooms;
    for (const room of prev) revokeRoomPreviews(room);
    set({ rooms });
  },

  reset: () => {
    revokeAllPreviewUrls(get());
    set(createInitialDraft());
  },
}));
