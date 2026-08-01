import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const DIR = path.join(process.cwd(), ".google-tokens");

/**
 * Dev-only: persist a captured Google ID token for backend E2E scripts.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not available" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const idToken = body?.idToken;
  const label = typeof body?.label === "string" ? body.label : "primary";

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ message: "idToken required" }, { status: 400 });
  }

  await mkdir(DIR, { recursive: true });
  const file = path.join(DIR, `${label}.txt`);
  await writeFile(file, idToken, "utf8");
  await writeFile(
    path.join(DIR, `${label}.meta.json`),
    JSON.stringify({ savedAt: new Date().toISOString(), length: idToken.length }),
    "utf8"
  );

  return NextResponse.json({ success: true, file });
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not available" }, { status: 404 });
  }
  return NextResponse.json({
    hint: "POST { idToken, label } to save a token under .google-tokens/",
  });
}
