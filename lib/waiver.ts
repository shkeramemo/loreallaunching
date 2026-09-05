import {
  defaultWaiverLanguage,
  getWaiverContent,
  normalizeWaiverLanguage,
  type WaiverLanguage,
} from "@/lib/waiver-terms";

export type WaiverPayload = {
  fullName: string;
  termsRead: boolean;
  consentWaiver: boolean;
  signatureDataUrl: string;
  signedAt: string;
  deviceLabel: string;
  language: WaiverLanguage;
};

export type WaiverFieldErrors = Partial<Record<keyof WaiverPayload, string>>;

export const initialWaiverPayload: WaiverPayload = {
  fullName: "",
  termsRead: false,
  consentWaiver: false,
  signatureDataUrl: "",
  signedAt: "",
  deviceLabel: "Samsung tablet kiosk",
  language: defaultWaiverLanguage,
};

export function validateWaiverPayload(payload: WaiverPayload) {
  const errors: WaiverFieldErrors = {};
  const content = getWaiverContent(payload.language);

  if (payload.fullName.trim().length < 2) {
    errors.fullName = content.validation.fullName;
  }

  if (!payload.termsRead) {
    errors.termsRead = content.validation.termsRead;
  }

  if (!payload.consentWaiver) {
    errors.consentWaiver = content.validation.consentWaiver;
  }

  if (!payload.signatureDataUrl.startsWith("data:image/png;base64,")) {
    errors.signatureDataUrl = content.validation.signatureDataUrl;
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
    language: normalizeWaiverLanguage(payload.language),
  };
}
