/**
 * Client-side file size limits for onboarding uploads (aligned with 5 MB UX rule).
 */
export const MAX_ONBOARDING_FILE_BYTES = 5 * 1024 * 1024;

export function isFileWithinSizeLimit(file: File, maxBytes = MAX_ONBOARDING_FILE_BYTES): boolean {
  return file.size <= maxBytes;
}

export function fileTooLargeMessage(maxBytes = MAX_ONBOARDING_FILE_BYTES): string {
  const mb = Math.round(maxBytes / (1024 * 1024));
  return `File is too large. Maximum size is ${mb} MB.`;
}
