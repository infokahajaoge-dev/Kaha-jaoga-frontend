import * as yup from "yup";

/**
 * Photos step — File presence is validated against the Zustand store
 * in the step component (exterior required). Schema is a passthrough marker.
 */
export const photosStepSchema = yup.object({});

export type PhotosStepValues = yup.InferType<typeof photosStepSchema>;
