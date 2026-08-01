import * as yup from "yup";
import { BED_TYPES } from "../constants/enums";

/**
 * Aligns with backend roomFieldsSchema (draft uses string inputs):
 * roomName min 2 max 120, bedType enum, maxGuests 1–20,
 * roomCount 1–500, pricePerNight >= 0 required, areaSqft optional >= 0.
 */
const optionalNonNegativeNumberString = yup
  .string()
  .default("")
  .test("optional-nonneg", "Area must be a non-negative number", (value) => {
    if (value == null || String(value).trim() === "") return true;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0;
  });

const requiredNonNegativePriceString = yup
  .string()
  .trim()
  .required("Price per night is required")
  .test("price", "Price must be a non-negative number", (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0;
  });

export const roomItemSchema = yup.object({
  room_name: yup
    .string()
    .trim()
    .min(2, "Room name must be at least 2 characters")
    .max(120)
    .required("Room name is required"),
  bed_type: yup
    .string()
    .required("Bed type is required")
    .test("bed-type", "Invalid bed type", (value) =>
      Boolean(value && (BED_TYPES as readonly string[]).includes(value))
    ),
  area_sqm: optionalNonNegativeNumberString,
  max_guests: yup
    .string()
    .required("Max guests is required")
    .test("max-guests", "Max guests must be between 1 and 20", (value) => {
      const n = parseInt(String(value), 10);
      return Number.isInteger(n) && n >= 1 && n <= 20;
    }),
  total_rooms: yup
    .string()
    .required("Number of rooms is required")
    .test("room-count", "Number of rooms must be between 1 and 500", (value) => {
      const n = parseInt(String(value), 10);
      return Number.isInteger(n) && n >= 1 && n <= 500;
    }),
  price_per_night: requiredNonNegativePriceString,
  has_ac: yup.boolean().required(),
  features: yup.string().default(""),
  photo1: yup.mixed().nullable().optional(),
  photo2: yup.mixed().nullable().optional(),
  photo3: yup.mixed().nullable().optional(),
  preview1: yup.string().default(""),
  preview2: yup.string().default(""),
  preview3: yup.string().default(""),
});

export const roomsStepSchema = yup.object({
  rooms: yup
    .array()
    .of(roomItemSchema)
    .min(1, "Add at least one room type")
    .required(),
});

export type RoomsStepValues = yup.InferType<typeof roomsStepSchema>;
