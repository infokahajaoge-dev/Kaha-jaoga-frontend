import type { PhotoSlotKey, DocumentSlotKey } from "../constants/enums";
import type { WizardStepIndex } from "../constants/steps";

export type HotelDraft = {
  name: string;
  hotel_type: string;
  category: string;
  star_rating: string;
  total_rooms: string;
  description: string;
  price: string;
  check_in_time: string;
  check_out_time: string;
  website: string;
  amenities: string;
};

export type AddressDraft = {
  address_street: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
};

export type OwnerDraft = {
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  password: string;
};

export type DocumentsMetaDraft = {
  gst_number: string;
  owner_aadhaar_number: string;
};

export type RoomDraft = {
  room_name: string;
  bed_type: string;
  area_sqm: string;
  max_guests: string;
  price_per_night: string;
  has_ac: boolean;
  total_rooms: string;
  features: string;
  photo1: File | null;
  photo2: File | null;
  photo3: File | null;
  preview1: string;
  preview2: string;
  preview3: string;
};

export type PhotosDraft = Record<PhotoSlotKey, File | null>;
export type PhotoPreviewsDraft = Partial<Record<PhotoSlotKey, string>>;
export type DocsDraft = Record<DocumentSlotKey, File | null>;
export type DocNamesDraft = Partial<Record<DocumentSlotKey, string>>;

export type ObjectKeysState = {
  hotel: string[];
  rooms: string[][];
  documents: string[];
};

/** UI-only submit progress — not draft field data. */
export type SubmitPhaseState =
  | "idle"
  | "submitting"
  | "upload_session"
  | "uploading_images"
  | "uploading_documents"
  | "creating_hotel"
  | "done";

export type OnboardingDraft = {
  currentStep: WizardStepIndex;
  loading: boolean;
  submitPhase: SubmitPhaseState;
  hotel: HotelDraft;
  address: AddressDraft;
  owner: OwnerDraft;
  documentsMeta: DocumentsMetaDraft;
  rooms: RoomDraft[];
  photos: PhotosDraft;
  previews: PhotoPreviewsDraft;
  docs: DocsDraft;
  docNames: DocNamesDraft;
  uploadSessionId: string | null;
  objectKeys: ObjectKeysState;
};
