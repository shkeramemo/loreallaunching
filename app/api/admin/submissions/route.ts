import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type WaiverSubmissionRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  consent_accepted: boolean;
  signature_url: string;
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

export async function GET(request: Request) {
  const authError = getAdminAuthError(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error, count } = await supabase
      .from("waiver_submissions")
      .select(
        "id, full_name, email, phone, consent_accepted, signature_url, signed_at, event_name, user_agent, tablet_id",
        { count: "exact" },
      )
      .order("signed_at", { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const rows = (data || []) as WaiverSubmissionRow[];
    const submissions = await Promise.all(
      rows.map(async (row) => {
        const signaturePath = splitSignaturePath(row.signature_url);
        let signaturePreviewUrl = "";

        if (signaturePath) {
          const { data: signedUrlData } = await supabase.storage
            .from(signaturePath.bucketName)
            .createSignedUrl(signaturePath.objectPath, 60 * 10);

          signaturePreviewUrl = signedUrlData?.signedUrl || "";
        }

        return {
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          consentAccepted: row.consent_accepted,
          signatureUrl: row.signature_url,
          signaturePreviewUrl,
          signedAt: row.signed_at,
          eventName: row.event_name,
          userAgent: row.user_agent,
          tabletId: row.tablet_id,
        };
      }),
    );

    return NextResponse.json({
      totalCount: count || 0,
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
