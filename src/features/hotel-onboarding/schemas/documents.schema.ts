import * as yup from "yup";

/** Aligns with backend documentNumber (min 3, max 100). */
export const documentsStepSchema = yup.object({
  gst_number: yup
    .string()
    .trim()
    .min(3, "GST number must be at least 3 characters")
    .max(100)
    .required("GST number is required"),
  owner_aadhaar_number: yup
    .string()
    .trim()
    .min(3, "Aadhaar number must be at least 3 characters")
    .max(100)
    .required("Aadhaar number is required"),
});

export type DocumentsStepValues = yup.InferType<typeof documentsStepSchema>;
