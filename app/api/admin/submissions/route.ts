import { NextResponse } from "next/server";

import {
  createSupabaseServerClient,
  getSignedDocumentBucketName,
} from "@/lib/supabase/server";
import { createSignedWaiverPdf } from "@/lib/waiver-pdf";

export const runtime = "nodejs";
const SIGNATURE_VIEW_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 7;
const BACKFILL_BATCH_SIZE = 20;

type WaiverSubmissionRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  consent_accepted: boolean;
  signature_url: string;
  signed_document_url: string | null;
  signed_at: string;
  event_name: string;
  user_agent: string | null;
  tablet_id: string | null;
};

function getAdminAuthError(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();
  const submittedPassword = request.headers.get("x-admin-password")?.trim();

  if (!configuredPassword) {
    return "Admin password is not configured on the server.";
  }

  if (submittedPassword !== configuredPassword) {
    return "Unauthorized.";
  }

  return null;
}

function splitSignaturePath(signatureUrl: string) {
  const slashIndex = signatureUrl.indexOf("/");

  if (slashIndex === -1) {
    return null;
  }

  return {
    bucketName: signatureUrl.slice(0, slashIndex),
    objectPath: signatureUrl.slice(slashIndex + 1),
  };
}

async function getMissingSignedDocumentCount(
  supabase: ReturnType<typeof createSupabaseServerClient>,
) {
  const { count, error } = await supabase
    .from("waiver_submissions")
    .select("id", { count: "exact", head: true })
    .is("signed_document_url", null);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function GET(request: Request) {
  const authError = getAdminAuthError(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const [submissionsResult, missingSignedDocumentCount] = await Promise.all([
      supabase
        .from("waiver_submissions")
        .select(
          "id, full_name, email, phone, consent_accepted, signature_url, signed_document_url, signed_at, event_name, user_agent, tablet_id",
          { count: "exact" },
        )
        .order("signed_at", { ascending: false })
        .limit(1000),
      getMissingSignedDocumentCount(supabase),
    ]);
    const { data, error, count } = submissionsResult;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const rows = (data || []) as WaiverSubmissionRow[];
    const submissions = await Promise.all(
      rows.map(async (row) => {
        const signaturePath = splitSignaturePath(row.signature_url);
        const signedDocumentPath = row.signed_document_url
          ? splitSignaturePath(row.signed_document_url)
          : null;
        let signaturePreviewUrl = "";
        let signedDocumentPreviewUrl = "";

        if (signaturePath) {
          const { data: signedUrlData } = await supabase.storage
            .from(signaturePath.bucketName)
            .createSignedUrl(
              signaturePath.objectPath,
              SIGNATURE_VIEW_URL_EXPIRY_SECONDS,
            );

          signaturePreviewUrl = signedUrlData?.signedUrl || "";
        }

        if (signedDocumentPath) {
          const { data: signedUrlData } = await supabase.storage
            .from(signedDocumentPath.bucketName)
            .createSignedUrl(
              signedDocumentPath.objectPath,
              SIGNATURE_VIEW_URL_EXPIRY_SECONDS,
            );

          signedDocumentPreviewUrl = signedUrlData?.signedUrl || "";
        }

        return {
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          consentAccepted: row.consent_accepted,
          signatureUrl: row.signature_url,
          signaturePreviewUrl,
          signedDocumentUrl: row.signed_document_url,
          signedDocumentPreviewUrl,
          signedAt: row.signed_at,
          eventName: row.event_name,
          userAgent: row.user_agent,
          tabletId: row.tablet_id,
        };
      }),
    );

    return NextResponse.json({
      totalCount: count || 0,
      missingSignedDocumentCount,
      submissions,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load waiver submissions.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = getAdminAuthError(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("waiver_submissions")
      .select("id, full_name, signature_url, signed_at")
      .is("signed_document_url", null)
      .order("signed_at", { ascending: true })
      .limit(BACKFILL_BATCH_SIZE);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const rows = (data || []) as Pick<
      WaiverSubmissionRow,
      "id" | "full_name" | "signature_url" | "signed_at"
    >[];
    const documentBucketName = getSignedDocumentBucketName();
    let processedCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      const signaturePath = splitSignaturePath(row.signature_url);

      if (!signaturePath) {
        failedCount += 1;
        continue;
      }

      try {
        const { data: signatureFile, error: signatureError } = await supabase.storage
          .from(signaturePath.bucketName)
          .download(signaturePath.objectPath);

        if (signatureError || !signatureFile) {
          throw new Error("Unable to read signature file.");
        }

        const signedAt = new Date(row.signed_at);
        const documentDate = Number.isNaN(signedAt.getTime())
          ? new Date().toISOString().slice(0, 10)
          : signedAt.toISOString().slice(0, 10);
        const documentPath = [
          "documents",
          documentDate,
          `${row.id}.pdf`,
        ].join("/");
        const pdf = await createSignedWaiverPdf({
          fullName: row.full_name,
          signaturePng: new Uint8Array(await signatureFile.arrayBuffer()),
          signedAt: row.signed_at,
          submissionId: row.id,
        });
        const { error: uploadError } = await supabase.storage
          .from(documentBucketName)
          .upload(documentPath, pdf, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          throw new Error("Unable to save signed document.");
        }

        const { error: updateError } = await supabase
          .from("waiver_submissions")
          .update({ signed_document_url: `${documentBucketName}/${documentPath}` })
          .eq("id", row.id)
          .is("signed_document_url", null);

        if (updateError) {
          throw new Error("Unable to attach signed document.");
        }

        processedCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    const remainingCount = await getMissingSignedDocumentCount(supabase);

    return NextResponse.json({
      processedCount,
      failedCount,
      remainingCount,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to generate signed documents right now." },
      { status: 500 },
    );
  }
}
