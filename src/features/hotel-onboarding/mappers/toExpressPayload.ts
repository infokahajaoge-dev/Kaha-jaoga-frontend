import type { CreateHotelPayload } from "@/src/api/hotels.api";
import type { OnboardingDraft, RoomDraft } from "../types/draft";
import {
  DOCUMENT_SLOTS,
  PHOTO_SLOTS,
  ROOM_PHOTO_KEYS,
  type PhotoSlotKey,
} from "../constants/enums";

export type CollectedHotelPhoto = {
  slot: PhotoSlotKey;
  file: File;
};

export type CollectedRoomPhoto = {
  roomIndex: number;
  photoKey: (typeof ROOM_PHOTO_KEYS)[number];
  file: File;
};

export type CollectedDocument = {
  slot: (typeof DOCUMENT_SLOTS)[number];
  file: File;
  documentType: "GST" | "AADHAAR";
  documentNumber: string;
};

export type CollectedFiles = {
  hotelPhotos: CollectedHotelPhoto[];
  roomPhotos: CollectedRoomPhoto[];
  documents: CollectedDocument[];
};

function parseFeatures(raw: string): string[] {
  return raw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

function parseOptionalInt(raw: string): number | undefined {
  if (!raw?.trim()) return undefined;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseRequiredNumber(raw: string): number {
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Price must be a valid number greater than or equal to 0");
  }
  return n;
}

/** Flatten draft File slots in the same order the upload session allocates keys. */
export function collectOnboardingFiles(draft: OnboardingDraft): CollectedFiles {
  const hotelPhotos: CollectedHotelPhoto[] = [];
  for (const slot of PHOTO_SLOTS) {
    const file = draft.photos[slot.key];
    if (file) hotelPhotos.push({ slot: slot.key, file });
  }

  const roomPhotos: CollectedRoomPhoto[] = [];
  draft.rooms.forEach((room, roomIndex) => {
    for (const photoKey of ROOM_PHOTO_KEYS) {
      const file = room[photoKey];
      if (file) roomPhotos.push({ roomIndex, photoKey, file });
    }
  });

  const documents: CollectedDocument[] = [];
  if (draft.docs.gst) {
    documents.push({
      slot: "gst",
      file: draft.docs.gst,
      documentType: "GST",
      documentNumber: draft.documentsMeta.gst_number.trim(),
    });
  }
  if (draft.docs.aadhaar) {
    documents.push({
      slot: "aadhaar",
      file: draft.docs.aadhaar,
      documentType: "AADHAAR",
      documentNumber: draft.documentsMeta.owner_aadhaar_number.trim(),
    });
  }

  return { hotelPhotos, roomPhotos, documents };
}

function mapRoomFields(room: RoomDraft, hotelBasePrice: number) {
  return {
    roomName: room.room_name.trim() || "Room",
    bedType: room.bed_type,
    areaSqft: parseOptionalInt(room.area_sqm) ?? null,
    maxGuests: parseInt(room.max_guests, 10) || 2,
    roomCount: parseInt(room.total_rooms, 10) || 1,
    pricePerNight: (() => {
      const raw = room.price_per_night?.trim();
      if (raw) return parseRequiredNumber(raw);
      return hotelBasePrice;
    })(),
    isAc: room.has_ac,
    features: parseFeatures(room.features),
  };
}

/**
 * Build POST /api/v1/hotels body from Zustand draft + uploaded object keys.
 */
export function toExpressPayload(
  draft: OnboardingDraft,
  args: {
    uploadSessionId: string;
    hotelPhotoKeys: string[];
    roomPhotoKeysByRoom: string[][];
    documentKeys: string[];
    collected: CollectedFiles;
  }
): CreateHotelPayload {
  const { hotel, address, owner, rooms } = draft;
  const { collected } = args;
  const basePrice = parseRequiredNumber(hotel.price);
  const website = hotel.website.trim();

  return {
    uploadSessionId: args.uploadSessionId,
    hotel: {
      name: hotel.name.trim(),
      hotelType: hotel.hotel_type,
      category: hotel.category,
      starRating: parseInt(hotel.star_rating, 10) || undefined,
      basePrice,
      totalRooms: parseOptionalInt(hotel.total_rooms),
      checkInTime: hotel.check_in_time || undefined,
      checkOutTime: hotel.check_out_time || undefined,
      description: hotel.description.trim() || null,
      website: website ? website : null,
    },
    address: {
      street: address.address_street.trim(),
      city: address.address_city.trim(),
      state: address.address_state.trim(),
      country: "India",
      postalCode: address.address_pincode.trim(),
    },
    owner: {
      fullName: owner.owner_name.trim(),
      email: owner.owner_email.trim(),
      phone: owner.owner_phone.trim(),
      password: owner.password,
    },
    photos: collected.hotelPhotos.map((item, i) => ({
      objectKey: args.hotelPhotoKeys[i],
      photoType: item.slot,
      displayOrder: i,
    })),
    rooms: rooms.map((room, roomIndex) => ({
      room: mapRoomFields(room, basePrice),
      photos: (args.roomPhotoKeysByRoom[roomIndex] || []).map(
        (objectKey, pi) => ({
          objectKey,
          displayOrder: pi,
        })
      ),
    })),
    documents: collected.documents.map((doc, i) => ({
      objectKey: args.documentKeys[i],
      documentType: doc.documentType,
      documentNumber: doc.documentNumber,
    })),
  };
}
