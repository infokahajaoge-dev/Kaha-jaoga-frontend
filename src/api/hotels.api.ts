import { apiClient } from "@/src/api/client";
import type { ApiSuccess } from "@/src/api/auth.api";

export type CreateUploadSessionPayload = {
  hotelPhotos?: number;
  roomPhotos?: number;
  documents?: number;
  roomCount?: number;
};

export type PresignedUpload = {
  objectKey: string;
  uploadUrl: string;
  contentType: string;
};

export type UploadSessionRoomSlot = {
  temporaryRoomId: string;
  photoKeys: string[];
};

export type UploadSessionData = {
  uploadSessionId: string;
  temporaryHotelId: string;
  expiresAt: string;
  roomSlots: UploadSessionRoomSlot[];
  uploads: PresignedUpload[];
};

export type HotelPhotoInput = {
  objectKey: string;
  photoType: string;
  displayOrder?: number;
};

export type RoomPhotoInput = {
  objectKey: string;
  displayOrder?: number;
};

export type RoomFieldsInput = {
  roomName: string;
  bedType: string;
  areaSqft?: number | null;
  maxGuests: number;
  roomCount?: number;
  pricePerNight: number;
  isAc?: boolean;
  features?: string[] | Record<string, unknown>;
};

export type RoomEntryInput = {
  room: RoomFieldsInput;
  photos?: RoomPhotoInput[];
};

export type DocumentInput = {
  objectKey: string;
  documentType: "GST" | "AADHAAR";
  documentNumber: string;
};

export type CreateHotelPayload = {
  uploadSessionId: string;
  hotel: {
    name: string;
    hotelType: string;
    category: string;
    starRating?: number;
    basePrice?: number;
    totalRooms?: number;
    checkInTime?: string;
    checkOutTime?: string;
    description?: string | null;
    website?: string | null;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  owner: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };
  photos?: HotelPhotoInput[];
  rooms: RoomEntryInput[];
  documents?: DocumentInput[];
};

export const hotelsApi = {
  createUploadSession(payload: CreateUploadSessionPayload) {
    return apiClient.post<ApiSuccess<UploadSessionData>>(
      "/api/v1/hotels/upload-session",
      payload
    );
  },

  createHotel(payload: CreateHotelPayload, idempotencyKey?: string) {
    return apiClient.post<ApiSuccess<unknown>>("/api/v1/hotels", payload, {
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    });
  },

  getHotelById(hotelId: string) {
    return apiClient.get<ApiSuccess<unknown>>(`/api/v1/hotels/${hotelId}`);
  },
};
