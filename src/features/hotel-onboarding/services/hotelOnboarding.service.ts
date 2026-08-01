import { hotelsApi } from "@/src/api/hotels.api";
import type { OnboardingDraft } from "../types/draft";
import {
  collectOnboardingFiles,
  toExpressPayload,
} from "../mappers/toExpressPayload";
import { toJpegBlob, uploadToPresignedUrl } from "../utils/r2Upload";

export type SubmitPhase =
  | "idle"
  | "submitting"
  | "upload_session"
  | "uploading_images"
  | "uploading_documents"
  | "creating_hotel"
  | "done";

export const SUBMIT_PHASE_LABEL: Record<SubmitPhase, string> = {
  idle: "",
  submitting: "Submitting...",
  upload_session: "Creating upload session...",
  uploading_images: "Uploading images...",
  uploading_documents: "Uploading documents...",
  creating_hotel: "Creating hotel...",
  done: "Done",
};

export type SubmitProgressCallback = (phase: SubmitPhase) => void;

function assertReady(draft: OnboardingDraft) {
  if (
    !draft.hotel.name ||
    !draft.address.address_city ||
    !draft.hotel.price ||
    !draft.owner.owner_email ||
    !draft.owner.password
  ) {
    throw new Error("Please fill all required fields!");
  }
  if (!draft.photos.exterior) {
    throw new Error("Please upload at least the main exterior photo!");
  }
  if (!draft.docs.gst || !draft.docs.aadhaar) {
    throw new Error("Please upload both GST Certificate and Aadhaar Card!");
  }
  if (draft.owner.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  for (const [slot, file] of Object.entries(draft.docs)) {
    if (file && file.type !== "application/pdf") {
      throw new Error(
        `${slot === "gst" ? "GST" : "Aadhaar"} must be a PDF (required for secure upload).`
      );
    }
  }
}

/**
 * Phase 2 onboarding submit — Express upload-session + R2 PUT + POST /hotels.
 * No Supabase writes.
 */
export async function submitHotelOnboarding(
  draft: OnboardingDraft,
  onProgress?: SubmitProgressCallback
): Promise<void> {
  assertReady(draft);
  onProgress?.("submitting");

  const collected = collectOnboardingFiles(draft);
  const roomCount = Math.max(1, draft.rooms.length);

  onProgress?.("upload_session");
  const sessionRes = await hotelsApi.createUploadSession({
    hotelPhotos: collected.hotelPhotos.length,
    roomPhotos: collected.roomPhotos.length,
    documents: collected.documents.length,
    roomCount,
  });

  const session = sessionRes.data.data;
  const uploads = session.uploads ?? [];
  const expected =
    collected.hotelPhotos.length +
    collected.roomPhotos.length +
    collected.documents.length;

  if (uploads.length < expected) {
    throw new Error(
      "Upload session returned fewer slots than required. Please try again."
    );
  }

  // uploads[] order: hotel photos → room photos → documents
  let cursor = 0;
  const hotelPhotoKeys: string[] = [];
  const roomPhotoKeysByRoom: string[][] = draft.rooms.map(() => []);
  const documentKeys: string[] = [];

  onProgress?.("uploading_images");

  for (const item of collected.hotelPhotos) {
    const slot = uploads[cursor++];
    const body = await toJpegBlob(item.file);
    await uploadToPresignedUrl(body, slot.uploadUrl, slot.contentType);
    hotelPhotoKeys.push(slot.objectKey);
  }

  for (const item of collected.roomPhotos) {
    const slot = uploads[cursor++];
    const body = await toJpegBlob(item.file);
    await uploadToPresignedUrl(body, slot.uploadUrl, slot.contentType);
    roomPhotoKeysByRoom[item.roomIndex].push(slot.objectKey);
  }

  onProgress?.("uploading_documents");

  for (const item of collected.documents) {
    const slot = uploads[cursor++];
    await uploadToPresignedUrl(item.file, slot.uploadUrl, slot.contentType);
    documentKeys.push(slot.objectKey);
  }

  const payload = toExpressPayload(draft, {
    uploadSessionId: session.uploadSessionId,
    hotelPhotoKeys,
    roomPhotoKeysByRoom,
    documentKeys,
    collected,
  });

  onProgress?.("creating_hotel");
  const idempotencyKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `hotel-${Date.now()}`;

  await hotelsApi.createHotel(payload, idempotencyKey);
  onProgress?.("done");
}

export const hotelOnboardingService = {
  submit: submitHotelOnboarding,
};
