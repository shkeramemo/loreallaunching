export type WaiverPayload = {
  fullName: string;
  termsRead: boolean;
  consentWaiver: boolean;
  signatureDataUrl: string;
  signedAt: string;
  deviceLabel: string;
};

export type WaiverFieldErrors = Partial<Record<keyof WaiverPayload, string>>;

export const initialWaiverPayload: WaiverPayload = {
  fullName: "",
  termsRead: false,
  consentWaiver: false,
  signatureDataUrl: "",
  signedAt: "",
  deviceLabel: "Samsung tablet kiosk",
};

export function validateWaiverPayload(payload: WaiverPayload) {
  const errors: WaiverFieldErrors = {};

  if (payload.fullName.trim().length < 2) {
    errors.fullName = "Enter the attendee's full name.";
  }

  if (!payload.termsRead) {
    errors.termsRead = "The attendee must read the waiver terms first.";
  }

  if (!payload.consentWaiver) {
    errors.consentWaiver = "Waiver consent is required.";
  }

  if (!payload.signatureDataUrl.startsWith("data:image/png;base64,")) {
    errors.signatureDataUrl = "Signature is required.";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

export function normalizeWaiverPayload(payload: WaiverPayload): WaiverPayload {
  return {
    ...payload,
    fullName: payload.fullName.trim(),
    deviceLabel: payload.deviceLabel.trim() || "Samsung tablet kiosk",
  };
}
