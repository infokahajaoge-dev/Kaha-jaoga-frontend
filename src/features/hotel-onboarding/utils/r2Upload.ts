/**
 * Browser PUT to Cloudflare R2 via presigned URL.
 * Content-Type must match the value used when the URL was signed.
 */

/** Convert any browser image to JPEG so it matches signed image/jpeg slots. */
export async function toJpegBlob(file: File, quality = 0.92): Promise<Blob> {
  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not prepare image for upload.");
    }
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("JPEG conversion failed."))),
        "image/jpeg",
        quality
      );
    });
    return blob;
  } finally {
    bitmap.close();
  }
}

export async function uploadToPresignedUrl(
  body: Blob,
  uploadUrl: string,
  contentType: string
): Promise<void> {
  // Backend R2_MOCK returns mock-r2.local URLs; HeadObject is stubbed as present.
  if (uploadUrl.includes("mock-r2.local")) {
    return;
  }

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body,
  });

  if (!res.ok) {
    throw new Error(
      `Upload failed (${res.status}). Please retry with a smaller JPEG/PDF file.`
    );
  }
}
