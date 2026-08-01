import * as yup from "yup";

/**
 * Owner fields for step 6. Final submit also re-checks cross-step requirements
 * (name, city, price, exterior, docs) — same as original handleSubmit.
 * Password min length aligned with backend Joi (8).
 */
export const ownerStepSchema = yup.object({
  owner_name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  owner_email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  owner_phone: yup
    .string()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .required("Phone is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .required("Password is required"),
});

export type OwnerStepValues = yup.InferType<typeof ownerStepSchema>;
