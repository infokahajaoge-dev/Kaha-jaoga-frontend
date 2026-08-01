import * as yup from "yup";

/** Aligns with backend hotelSchema / price fragment. */
export const hotelStepSchema = yup.object({
  name: yup.string().trim().min(2, "Hotel name must be at least 2 characters").required("Hotel name is required"),
  hotel_type: yup.string().required(),
  category: yup.string().required(),
  star_rating: yup.string().required(),
  total_rooms: yup.string().default(""),
  description: yup.string().default(""),
  price: yup
    .string()
    .trim()
    .required("Price is required")
    .test(
      "numeric-price",
      "Price must be a valid number greater than or equal to 0",
      (value) => {
        if (value == null || value === "") return false;
        const n = Number(value);
        return Number.isFinite(n) && n >= 0;
      }
    ),
  check_in_time: yup.string().required(),
  check_out_time: yup.string().required(),
  website: yup
    .string()
    .trim()
    .default("")
    .test("optional-url", "Enter a valid URL (e.g. https://example.com)", (value) => {
      if (!value) return true;
      try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }),
  amenities: yup.string().default(""),
});

export type HotelStepValues = yup.InferType<typeof hotelStepSchema>;
