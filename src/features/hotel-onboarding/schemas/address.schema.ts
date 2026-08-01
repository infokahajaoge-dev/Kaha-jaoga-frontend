import * as yup from "yup";

/** Aligns with backend addressSchema (street, city, state, postalCode). */
export const addressStepSchema = yup.object({
  address_street: yup
    .string()
    .trim()
    .min(3, "Street must be at least 3 characters")
    .max(250)
    .required("Street address is required"),
  address_city: yup
    .string()
    .trim()
    .min(2, "City is required")
    .required("City is required"),
  address_state: yup
    .string()
    .trim()
    .min(2, "State is required")
    .required("State is required"),
  address_pincode: yup
    .string()
    .trim()
    .min(4, "PIN code must be at least 4 characters")
    .max(20, "PIN code is too long")
    .required("PIN code is required"),
});

export type AddressStepValues = yup.InferType<typeof addressStepSchema>;
