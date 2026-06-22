"use client";

import {
  Check,
  ChevronRight,
  Eraser,
  FilePenLine,
  FileText,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  initialWaiverPayload,
  validateWaiverPayload,
  type WaiverFieldErrors,
  type WaiverPayload,
} from "@/lib/waiver";

type SubmitState = "idle" | "submitting" | "success" | "error";
const MIN_SIGNATURE_DISTANCE = 28;

const waiverTerms = [
  {
    body: "I acknowledge that the Event will be shot (both photos and videos) by L’Oréal and thus, my image will be captured. For the purpose of this undertaking, “Image” shall be defined as covering all my identification attributes, especially my image, surname, first name, voice, signature, likeness and qualities, this list being non-exhaustive.",
  },
  {
    body: "I agree to authorize L’Oréal its parent company, affiliates, sister companies, subsidiaries and in general to the L’Oréal Group to use, reproduce and display my Image for marketing and advertising purposes both online (on its digital assets, including but not limited to Facebook page, Instagram account, L’Oréal’s website, YouTube channel etc. ; e-magazine platforms; social media pages of retailers etc.) and offline (windows, podiums, all points of sale materials etc.) on any medium whatsoever, and on any format (including on modified formats) whether for internal use, external use, public event or other and in general for the purpose of advertising and promoting L’Oréal.",
  },
  {
    body: "Such usage by L’Oréal shall be limited to the Image collected and any other tangible or non-tangible materials produced within the scope of the Event (the “Material”), that may incorporate all or part of the Image, if necessary, by associating any trademark or service mark and L’Oréal’s distinctive signs in general (including logos, or signatures). I fully acknowledge that L’Oréal has no obligation whatsoever to use the Material.",
  },
  {
    body: "This authorization includes the right for L’Oréal to make any changes, additions, deletions, cropping etc., that it deems necessary to my original Image and is granted without any limitation with regard to the number of reproductions, representations and adaptations made.",
  },
  {
    body: "Such usage rights shall be granted to L’Oréal worldwide and for an unlimited duration and shall not cause L’Oréal to be liable in any way in relation to any such publication and/or use.",
  },
  {
    body: "I acknowledge and expressly agree that:\n- the Material and the intellectual property rights relating to the Material shall remain L’Oréal’s exclusive property wherein L’Oréal can, at any time, transfer them to its parent company, affiliates, subsidiaries and in general to the L’Oréal Group.\n- the use or publication of my identification attributes for the purpose described above will be free of charge and will not entitle me to receive any financial compensation whatsoever from L’Oréal.\n- I shall not use or publish any photos and/or videos related to L’Oréal without L’Oréal’s prior approval.\n- I will maintain strictly confidential the content of the present authorization as well as all information, of any nature whatsoever, obtained as a result of its implementation.\n- No stipulation in the present authorization shall be interpreted as creating a partnership between L’Oréal and myself.",
  },
  {
    body: "I expressly and irrevocably acknowledge and agree that I will not receive any financial compensation whatsoever from L’Oréal in return for the use of my Image and I hereby waive all claims in relation with the usage of my Image made in accordance with the terms contained herein.",
  },
  {
    body: "The content of this personal release undertaking is governed by the laws of the United Arab Emirates and in case of any dispute arising out of or in connection with this consent which cannot be settled amicably, the Parties agree to refer to the jurisdiction of the courts of Dubai.",
  },
];

export function WaiverForm() {
  const [payload, setPayload] = useState<WaiverPayload>(initialWaiverPayload);
  const [errors, setErrors] = useState<WaiverFieldErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [signatureKey, setSignatureKey] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const submitInFlightRef = useRef(false);

  function updateField<Key extends keyof WaiverPayload>(
    key: Key,
    value: WaiverPayload[Key],
  ) {
    setPayload((current) => ({
      ...current,
      [key]: value,
    }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
    setSubmitState("idle");
  }

  function resetForm() {
    submitInFlightRef.current = false;
    setPayload(initialWaiverPayload);
    setErrors({});
    setServerMessage("");
    setSubmitState("idle");
    setTermsOpen(false);
    setSignatureKey((value) => value + 1);
  }

  async function submitWaiver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitInFlightRef.current || submitState === "submitting") {
      return;
    }

    const signedPayload = {
      ...payload,
      signedAt: new Date().toISOString(),
    };
    const validation = validateWaiverPayload(signedPayload);

    if (!validation.valid) {
      setErrors(validation.errors);
      setSubmitState("error");
      setServerMessage("Please complete the required waiver steps.");
      return;
    }

    setSubmitState("submitting");
    setServerMessage("");
    submitInFlightRef.current = true;

    try {
      const response = await fetch("/api/waivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signedPayload),
      });
      const result = (await response.json()) as {
        message?: string;
        errors?: WaiverFieldErrors;
      };

      if (!response.ok) {
        setErrors(result.errors || {});
        setSubmitState("error");
        setServerMessage(result.message || "Unable to submit the waiver.");
        submitInFlightRef.current = false;
        return;
      }

      setSubmitState("success");
      setServerMessage("Waiver submitted. Ready for the next attendee.");
      setPayload(initialWaiverPayload);
      setErrors({});
      setSignatureKey((value) => value + 1);
    } catch {
      setSubmitState("error");
      setServerMessage("Connection issue. Check the tablet network and try again.");
      submitInFlightRef.current = false;
    }
  }

  if (submitState === "success") {
    return (
      <section className="w-full">
        <div className="w-full rounded-lg border border-ink/10 bg-pearl p-6 shadow-soft-panel md:p-8">
          <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check aria-hidden="true" className="h-10 w-10" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rouge">
              L&apos;Oréalistar
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Thank you, you may proceed.
            </h1>
            <button
              type="button"
              onClick={resetForm}
              className="mt-10 inline-flex h-14 min-w-[260px] items-center justify-center gap-2 rounded-lg bg-ink px-6 text-lg font-semibold text-white transition hover:bg-rouge"
            >
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
              Next attendee
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <form
        onSubmit={submitWaiver}
        className="w-full rounded-lg border border-ink/10 bg-pearl p-4 shadow-soft-panel sm:p-5 md:max-h-[calc(100vh-4rem)] md:overflow-y-auto md:p-7"
      >
        <header className="mb-6 border-b border-ink/10 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rouge">
            LOrealistar
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink md:text-4xl">
            Launch Event Waiver
          </h1>
        </header>

        <div className="grid gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-graphite">
              Full name <span className="text-rouge">*</span>
            </span>
            <input
              type="text"
              autoComplete="name"
              value={payload.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Attendee full name"
              className="h-14 w-full rounded-lg border border-ink/12 bg-white px-4 text-lg text-ink outline-none transition focus:border-rouge focus:ring-4 focus:ring-rouge/12"
            />
            <FieldError message={errors.fullName} />
          </label>

          <section className="rounded-lg border border-ink/12 bg-white p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-ink">
                  Waiver terms and policy
                </h3>
                <p className="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-graphite md:text-base md:leading-7">
                  {`The L’Oréalistar Launch Event (the “Event”) is organized by L’Oréal Middle East FZE (“L’Oréal”) on 23rd of June 2026 in Isola Bay, Dubai, United Arab Emirates for the purpose of launching the L’Oréalistar platform.

By attending the Event, I, the undersigned, accept without reserve the below terms`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 text-base font-semibold text-white transition hover:bg-rouge md:w-[180px] md:whitespace-nowrap"
              >
                <FileText aria-hidden="true" className="h-5 w-5" />
                Open policy
              </button>
            </div>

            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                payload.termsRead
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-rouge/10 text-rouge"
              }`}
            >
              {payload.termsRead ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              )}
              {payload.termsRead ? "Terms read" : "Terms not read yet"}
            </div>
            <FieldError message={errors.termsRead} />
          </section>

          <section className="rounded-lg border border-ink/12 bg-white p-4 md:p-5">
            <label
              className={`grid grid-cols-[auto_1fr] gap-3 rounded-lg border p-3 ${
                payload.termsRead
                  ? "border-ink/10 bg-pearl/55"
                  : "border-ink/8 bg-graphite/5 text-graphite/55"
              }`}
            >
              <input
                type="checkbox"
                checked={payload.consentWaiver}
                disabled={!payload.termsRead}
                onChange={(event) =>
                  updateField("consentWaiver", event.target.checked)
                }
                className="mt-1 h-6 w-6 accent-rouge disabled:cursor-not-allowed"
              />
              <span>
                <span className="block text-base font-semibold text-ink">
                  I have read and agree to the waiver consent{" "}
                  <span className="text-rouge">*</span>
                </span>
                <span className="mt-1 block text-sm leading-6 text-graphite">
                  By checking this box, I confirm that the attendee named above
                  accepts the waiver terms and policy for the L&apos;Oréalistar
                  Launch Event.
                </span>
                <FieldError message={errors.consentWaiver} />
              </span>
            </label>
          </section>

          <section className="rounded-lg border border-ink/12 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-ink">Signature</h3>
              <button
                type="button"
                onClick={() => {
                  updateField("signatureDataUrl", "");
                  setSignatureKey((value) => value + 1);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink/12 px-3 text-sm font-semibold text-graphite transition hover:border-rouge hover:text-rouge"
              >
                <Eraser aria-hidden="true" className="h-4 w-4" />
                Clear
              </button>
            </div>
            <SignaturePad
              key={signatureKey}
              onChange={(signatureDataUrl) =>
                updateField("signatureDataUrl", signatureDataUrl)
              }
            />
            <FieldError message={errors.signatureDataUrl} />
          </section>
        </div>

        <div className="mt-6 border-t border-ink/10 pt-5">
          {serverMessage ? (
            <p
              className="mb-3 rounded-lg bg-rouge/10 px-3 py-2 text-sm font-medium text-rouge"
            >
              {serverMessage}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-ink/12 bg-white px-4 text-base font-semibold text-graphite transition hover:border-rouge hover:text-rouge"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={submitState === "submitting"}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-lg font-semibold text-white transition hover:bg-rouge disabled:cursor-not-allowed disabled:bg-graphite/50"
              aria-busy={submitState === "submitting"}
            >
              {submitState === "submitting" ? (
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : (
                <FilePenLine aria-hidden="true" className="h-5 w-5" />
              )}
              Submit waiver
            </button>
          </div>
        </div>
      </form>

      {termsOpen ? (
        <TermsDialog
          onClose={() => setTermsOpen(false)}
          onConfirm={() => {
            updateField("termsRead", true);
            setTermsOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

function TermsDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-ink/72 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg bg-pearl shadow-soft-panel">
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rouge">
              Required reading
            </p>
            <h3 id="terms-title" className="mt-1 text-2xl font-semibold text-ink">
              Waiver terms and policy
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-ink/12 text-graphite transition hover:border-rouge hover:text-rouge"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-4">
            {waiverTerms.map((term, index) => (
              <section key={term.body} className="rounded-lg bg-white p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-champagne">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 whitespace-pre-line text-base leading-7 text-graphite">
                  {term.body}
                </p>
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-ink/10 bg-pearl px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 text-base font-semibold text-white transition hover:bg-rouge"
          >
            <Check aria-hidden="true" className="h-5 w-5" />
            Read terms and conditions
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-sm font-medium text-rouge">{message}</p>;
}

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeDistanceRef = useRef(0);
  const [hasInk, setHasInk] = useState(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "#171412";
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  function pointFromEvent(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function beginDraw(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !lastPointRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    const nextPoint = pointFromEvent(event);
    const segmentDistance = Math.hypot(
      nextPoint.x - lastPointRef.current.x,
      nextPoint.y - lastPointRef.current.y,
    );

    if (segmentDistance < 0.5) {
      return;
    }

    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(nextPoint.x, nextPoint.y);
    context.stroke();
    lastPointRef.current = nextPoint;
    strokeDistanceRef.current += segmentDistance;

    if (!hasInk && strokeDistanceRef.current >= MIN_SIGNATURE_DISTANCE) {
      setHasInk(true);
    }
  }

  function endDraw() {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (canvas && strokeDistanceRef.current >= MIN_SIGNATURE_DISTANCE) {
      onChange(canvas.toDataURL("image/png"));
    }
  }

  return (
    <div className="relative h-40 overflow-hidden rounded-lg border border-dashed border-ink/25 bg-[linear-gradient(#ffffff,#ffffff),repeating-linear-gradient(0deg,transparent,transparent_37px,rgba(23,20,18,0.07)_38px)] md:h-48">
      {!hasInk ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-base font-medium text-graphite/45">
          Sign here
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        aria-label="Signature"
        className="h-full w-full"
        onPointerDown={beginDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerCancel={endDraw}
        onPointerLeave={endDraw}
      />
    </div>
  );
}
