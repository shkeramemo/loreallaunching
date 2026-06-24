import { NextResponse } from "next/server";
import { inflateSync } from "zlib";

import {
  normalizeWaiverPayload,
  validateWaiverPayload,
  type WaiverPayload,
} from "@/lib/waiver";
import {
  createSupabaseServerClient,
  getSignedDocumentBucketName,
  getSignatureBucketName,
} from "@/lib/supabase/server";
import { createSignedWaiverPdf } from "@/lib/waiver-pdf";

export const runtime = "nodejs";

const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function signatureBufferFromDataUrl(signatureDataUrl: string) {
  const [metadata, base64Data] = signatureDataUrl.split(",");

  if (metadata !== "data:image/png;base64" || !base64Data) {
    throw new Error("Signature must be a PNG data URL.");
  }

  const buffer = Buffer.from(base64Data, "base64");

  if (!pngHasVisibleInk(buffer)) {
    throw new Error("Signature is required.");
  }

  return buffer;
}

function pngHasVisibleInk(buffer: Buffer) {
  if (buffer.length < 64 || !buffer.subarray(0, 8).equals(pngSignature)) {
    return false;
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;

    if (dataEnd + 4 > buffer.length) {
      return false;
    }

    const chunkData = buffer.subarray(dataStart, dataEnd);

    if (type === "IHDR") {
      width = chunkData.readUInt32BE(0);
      height = chunkData.readUInt32BE(4);
      bitDepth = chunkData[8];
      colorType = chunkData[9];
    } else if (type === "IDAT") {
      idatChunks.push(chunkData);
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  if (width <= 0 || height <= 0 || bitDepth !== 8 || colorType !== 6) {
    return false;
  }

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  let sourceOffset = 0;
  let previousRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filterType = inflated[sourceOffset];
    sourceOffset += 1;
    const rawRow = inflated.subarray(sourceOffset, sourceOffset + stride);
    sourceOffset += stride;
    const row = Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = previousRow[x] || 0;
      const upLeft = x >= bytesPerPixel ? previousRow[x - bytesPerPixel] || 0 : 0;
      const value = rawRow[x];

      if (filterType === 0) {
        row[x] = value;
      } else if (filterType === 1) {
        row[x] = (value + left) & 0xff;
      } else if (filterType === 2) {
        row[x] = (value + up) & 0xff;
      } else if (filterType === 3) {
        row[x] = (value + Math.floor((left + up) / 2)) & 0xff;
      } else if (filterType === 4) {
        const predictor = paethPredictor(left, up, upLeft);
        row[x] = (value + predictor) & 0xff;
      } else {
        return false;
      }
    }

    for (let x = 3; x < stride; x += bytesPerPixel) {
      if (row[x] > 16) {
        return true;
      }
    }

    previousRow = row;
  }

  return false;
}

function paethPredictor(left: number, up: number, upLeft: number) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
    return left;
  }

  if (upDistance <= upLeftDistance) {
    return up;
  }

  return upLeft;
}

export async function POST(request: Request) {
  let payload: WaiverPayload;

  try {
    payload = (await request.json()) as WaiverPayload;
  } catch {
    return NextResponse.json(
      { message: "Invalid waiver submission." },
      { status: 400 },
    );
  }

  const normalizedPayload = normalizeWaiverPayload({
    ...payload,
    signedAt: payload.signedAt || new Date().toISOString(),
  });
  const validation = validateWaiverPayload(normalizedPayload);

  if (!validation.valid) {
    return NextResponse.json(
      { errors: validation.errors, message: "Please review the highlighted fields." },
      { status: 422 },
    );
  }

  let signatureBuffer: Buffer;

  try {
    signatureBuffer = signatureBufferFromDataUrl(
      normalizedPayload.signatureDataUrl,
    );
  } catch {
    return NextResponse.json(
      {
        errors: { signatureDataUrl: "Signature is required." },
        message: "Please add a clear signature.",
      },
      { status: 422 },
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    const signatureBucketName = getSignatureBucketName();
    const documentBucketName = getSignedDocumentBucketName();
    const submissionId = crypto.randomUUID();
    const storageDate = new Date().toISOString().slice(0, 10);
    const signaturePath = [
      "signatures",
      storageDate,
      `${submissionId}.png`,
    ].join("/");
    const documentPath = [
      "documents",
      storageDate,
      `${submissionId}.pdf`,
    ].join("/");

    const { error: uploadError } = await supabase.storage
      .from(signatureBucketName)
      .upload(signaturePath, signatureBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { message: "Unable to save signature. Please try again." },
        { status: 500 },
      );
    }

    let documentBytes: Uint8Array;

    try {
      documentBytes = await createSignedWaiverPdf({
        fullName: normalizedPayload.fullName,
        signaturePng: signatureBuffer,
        signedAt: normalizedPayload.signedAt,
        submissionId,
      });
    } catch {
      await supabase.storage.from(signatureBucketName).remove([signaturePath]);
      return NextResponse.json(
        { message: "Unable to create the signed waiver document. Please try again." },
        { status: 500 },
      );
    }

    const { error: documentUploadError } = await supabase.storage
      .from(documentBucketName)
      .upload(documentPath, documentBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (documentUploadError) {
      await supabase.storage.from(signatureBucketName).remove([signaturePath]);
      return NextResponse.json(
        { message: "Unable to save the signed waiver document. Please try again." },
        { status: 500 },
      );
    }

    const { error } = await supabase.from("waiver_submissions").insert({
      id: submissionId,
      full_name: normalizedPayload.fullName,
      email: null,
      phone: null,
      consent_accepted:
        normalizedPayload.termsRead && normalizedPayload.consentWaiver,
      signature_url: `${signatureBucketName}/${signaturePath}`,
      signed_document_url: `${documentBucketName}/${documentPath}`,
      signed_at: normalizedPayload.signedAt,
      event_name: "L'Oréalistar Launch Event",
      user_agent: request.headers.get("user-agent"),
      tablet_id: normalizedPayload.deviceLabel,
    });

    if (error) {
      await Promise.all([
        supabase.storage.from(signatureBucketName).remove([signaturePath]),
        supabase.storage.from(documentBucketName).remove([documentPath]),
      ]);

      return NextResponse.json(
        { message: "Unable to save waiver. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Waiver received." }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error &&
      error.message === "Supabase environment variables are not configured."
        ? "Submission service is not configured."
        : "Unable to submit the waiver right now.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
