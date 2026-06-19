"use client";

import {
  Download,
  FileSearch,
  Loader2,
  Lock,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

type AdminSubmission = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  consentAccepted: boolean;
  signatureUrl: string;
  signaturePreviewUrl: string;
  signedAt: string;
  eventName: string;
  userAgent: string | null;
  tabletId: string | null;
};

type LoadState = "locked" | "loading" | "ready" | "error";

function formatSignedAt(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function csvEscape(value: string | number | boolean | null) {
  const stringValue = value === null ? "" : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function downloadCsv(submissions: AdminSubmission[]) {
  const headers = [
    "id",
    "signed_at",
    "full_name",
    "email",
    "phone",
    "consent_accepted",
    "event_name",
    "tablet_id",
    "signature_url",
    "user_agent",
  ];
  const rows = submissions.map((submission) => [
    submission.id,
    submission.signedAt,
    submission.fullName,
    submission.email,
    submission.phone,
    submission.consentAccepted,
    submission.eventName,
    submission.tabletId,
    submission.signatureUrl,
    submission.userAgent,
  ]);
  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `waiver-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [search, setSearch] = useState("");
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("locked");
  const [message, setMessage] = useState("");

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return submissions;
    }

    return submissions.filter((submission) => {
      return [
        submission.fullName,
        submission.email,
        submission.phone,
        submission.eventName,
        submission.tabletId,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );
    });
  }, [search, submissions]);
  const isPasswordSubmitting =
    loadState === "loading" && savedPassword.length === 0;

  async function loadSubmissions(passwordToUse = savedPassword || password) {
    setLoadState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/submissions", {
        headers: {
          "x-admin-password": passwordToUse,
        },
      });
      const result = (await response.json()) as {
        message?: string;
        totalCount?: number;
        submissions?: AdminSubmission[];
      };

      if (!response.ok) {
        setLoadState("error");
        setMessage(result.message || "Unable to load submissions.");
        return;
      }

      setSavedPassword(passwordToUse);
      setPassword("");
      setSubmissions(result.submissions || []);
      setTotalCount(result.totalCount || 0);
      setLoadState("ready");
    } catch {
      setLoadState("error");
      setMessage("Connection issue. Try refreshing the admin page.");
    }
  }

  function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadSubmissions(password);
  }

  if (loadState === "locked" || (loadState === "error" && !savedPassword)) {
    return (
      <main className="min-h-screen bg-[#f3eee7] px-4 py-8 text-ink">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
          <form
            onSubmit={submitPassword}
            className="w-full rounded-lg border border-ink/10 bg-pearl p-6 shadow-soft-panel"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white">
              <Lock aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rouge">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              Waiver submissions
            </h1>
            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm font-semibold text-graphite">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 w-full rounded-lg border border-ink/12 bg-white px-4 text-lg text-ink outline-none transition focus:border-rouge focus:ring-4 focus:ring-rouge/12"
              />
            </label>
            {message ? (
              <p className="mt-3 rounded-lg bg-rouge/10 px-3 py-2 text-sm font-medium text-rouge">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isPasswordSubmitting || password.length === 0}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 text-base font-semibold text-white transition hover:bg-rouge disabled:cursor-not-allowed disabled:bg-graphite/50"
            >
              {isPasswordSubmitting ? (
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : (
                <Lock aria-hidden="true" className="h-5 w-5" />
              )}
              Open admin
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3eee7] px-4 py-5 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="mb-5 rounded-lg border border-ink/10 bg-pearl p-5 shadow-soft-panel md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rouge">
                Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">
                Waiver submissions
              </h1>
              <p className="mt-2 text-base text-graphite">
                Total submissions:{" "}
                <span className="font-semibold text-ink">{totalCount}</span>
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void loadSubmissions()}
                disabled={loadState === "loading"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-ink/12 bg-white px-4 text-base font-semibold text-graphite transition hover:border-rouge hover:text-rouge disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadState === "loading" ? (
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw aria-hidden="true" className="h-5 w-5" />
                )}
                Refresh
              </button>
              <button
                type="button"
                onClick={() => downloadCsv(filteredSubmissions)}
                disabled={filteredSubmissions.length === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-base font-semibold text-white transition hover:bg-rouge disabled:cursor-not-allowed disabled:bg-graphite/50"
              >
                <Download aria-hidden="true" className="h-5 w-5" />
                Export CSV
              </button>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-semibold text-graphite">
              Search
            </span>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite/55"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, phone, event, or tablet"
                className="h-14 w-full rounded-lg border border-ink/12 bg-white pl-12 pr-4 text-lg text-ink outline-none transition focus:border-rouge focus:ring-4 focus:ring-rouge/12"
              />
            </div>
          </label>
        </header>

        {message ? (
          <p className="mb-4 rounded-lg bg-rouge/10 px-3 py-2 text-sm font-medium text-rouge">
            {message}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft-panel">
          <div className="overflow-x-auto">
            <div className="grid min-w-[720px] grid-cols-[190px_1fr_190px] border-b border-ink/10 bg-pearl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-graphite">
              <span>Signed at</span>
              <span>Name</span>
              <span>Signature</span>
            </div>
            <div className="max-h-[calc(100vh-300px)] min-w-[720px] overflow-y-auto">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => (
                <article
                  key={submission.id}
                  className="grid min-h-[92px] grid-cols-[190px_1fr_190px] items-center gap-4 border-b border-ink/8 px-4 py-3 last:border-b-0"
                >
                  <time className="text-sm font-medium text-graphite">
                    {formatSignedAt(submission.signedAt)}
                  </time>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-ink">
                      {submission.fullName}
                    </p>
                    <p className="mt-1 truncate text-sm text-graphite">
                      {submission.tabletId || "No tablet ID"}
                    </p>
                  </div>
                  <div className="h-16 overflow-hidden rounded-lg border border-ink/10 bg-pearl">
                    {submission.signaturePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={submission.signaturePreviewUrl}
                        alt={`Signature for ${submission.fullName}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-graphite">
                        No preview
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-4 py-10 text-center text-graphite">
                <FileSearch aria-hidden="true" className="mb-3 h-10 w-10" />
                <p className="text-lg font-semibold text-ink">
                  No submissions found
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
