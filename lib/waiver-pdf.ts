import chromium from "@sparticuz/chromium";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";

import {
  fallbackWaiverLanguage,
  getWaiverContent,
  normalizeWaiverLanguage,
  type WaiverLanguage,
} from "@/lib/waiver-terms";

type SignedWaiverDocumentInput = {
  fullName: string;
  signaturePng: Uint8Array;
  signedAt: string;
  submissionId: string;
  language?: WaiverLanguage | null;
};

const arabicFontPath = join(
  process.cwd(),
  "public",
  "fonts",
  "NotoNaskhArabic-Regular.woff",
);
const localChromePaths = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDubaiTime(value: string, language: WaiverLanguage) {
  const locale = language === "ar" ? "ar-AE" : "en-AE";

  return `${new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(new Date(value))} GST`;
}

function getLocalExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return localChromePaths.find((path) => existsSync(path));
}

async function getBrowser() {
  const localExecutablePath = getLocalExecutablePath();
  const executablePath = localExecutablePath || (await chromium.executablePath());

  return puppeteer.launch({
    args: localExecutablePath
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : chromium.args,
    executablePath,
    headless: true,
  });
}

function buildSignedWaiverHtml({
  fullName,
  signaturePng,
  signedAt,
  submissionId,
  language,
  arabicFontBase64,
}: SignedWaiverDocumentInput & {
  language: WaiverLanguage;
  arabicFontBase64: string;
}) {
  const content = getWaiverContent(language);
  const signatureDataUrl = `data:image/png;base64,${Buffer.from(signaturePng).toString("base64")}`;
  const isArabic = content.dir === "rtl";
  const terms = content.terms
    .map(
      (term, index) => `
        <li value="${index + 1}">${escapeHtml(term.body).replaceAll("\n", "<br />")}</li>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="${content.htmlLang}" dir="${content.dir}">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: "Noto Naskh Arabic";
        font-style: normal;
        font-weight: 400 700;
        src: url("data:font/woff;base64,${arabicFontBase64}") format("woff");
      }

      @page {
        size: A4;
        margin: 19mm 17mm 17mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #171412;
        background: #ffffff;
        font-family: ${
          isArabic
            ? '"Noto Naskh Arabic", Arial, sans-serif'
            : 'Arial, "Helvetica Neue", sans-serif'
        };
        font-size: ${isArabic ? "11.5px" : "10.5px"};
        line-height: ${isArabic ? "1.55" : "1.45"};
        text-align: ${isArabic ? "right" : "left"};
      }

      header,
      footer {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        border-color: #d6d1ca;
        color: #2b2a28;
      }

      header {
        align-items: flex-start;
        border-bottom: 1px solid #d6d1ca;
        padding-bottom: 8px;
        margin-bottom: 20px;
      }

      footer {
        border-top: 1px solid #d6d1ca;
        margin-top: 22px;
        padding-top: 8px;
        font-size: 9px;
      }

      .brand {
        color: #b31732;
        font-weight: 700;
        letter-spacing: ${isArabic ? "0" : "0.12em"};
        text-transform: ${isArabic ? "none" : "uppercase"};
      }

      h1 {
        margin: 0;
        font-size: ${isArabic ? "22px" : "20px"};
        line-height: 1.25;
        font-weight: 700;
      }

      .event {
        margin: 5px 0 14px;
        color: #b31732;
        font-size: ${isArabic ? "15px" : "13px"};
        font-weight: 700;
      }

      .intro {
        margin: 0 0 8px;
      }

      .acceptance {
        margin: 0 0 12px;
        font-weight: 700;
      }

      .terms {
        margin: 0;
        padding-${isArabic ? "right" : "left"}: 22px;
        padding-${isArabic ? "left" : "right"}: 0;
      }

      .terms li::marker {
        color: #b31732;
        font-weight: 700;
      }

      .terms li {
        margin: 0 0 8px;
        padding-${isArabic ? "right" : "left"}: 7px;
        break-inside: auto;
        page-break-inside: auto;
      }

      .acknowledgement {
        margin: 14px 0 12px;
        font-weight: 700;
        break-inside: avoid;
      }

      .signature-block {
        break-inside: avoid;
        border-top: 1px solid #d6d1ca;
        margin-top: 18px;
        padding-top: 16px;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 26px;
      }

      .label {
        color: #b31732;
        font-size: 10px;
        font-weight: 700;
        text-transform: ${isArabic ? "none" : "uppercase"};
      }

      .name {
        margin-top: 6px;
        font-size: ${isArabic ? "18px" : "14px"};
        font-weight: 700;
      }

      .date {
        color: #2b2a28;
        font-size: 10px;
        text-align: ${isArabic ? "left" : "right"};
      }

      .signature-line {
        width: 250px;
        border-top: 1px solid #736f6b;
        padding-top: 7px;
        margin-${isArabic ? "right" : "left"}: 0;
        margin-${isArabic ? "left" : "right"}: auto;
      }

      .signature-line img {
        display: block;
        width: 230px;
        height: 74px;
        object-fit: contain;
      }

      .signature-caption {
        color: #2b2a28;
        font-size: 10px;
      }

      .privacy {
        margin: 14px 0 0;
        color: #2b2a28;
        font-size: ${isArabic ? "10px" : "9px"};
      }

      .reference {
        margin-top: 18px;
        color: #2b2a28;
        font-size: 9px;
      }
    </style>
  </head>
  <body>
    <header>
      <div class="brand">${escapeHtml(content.pdf.headerLabel)}</div>
      <div>${escapeHtml(content.documentTitle)}</div>
    </header>

    <main>
      <h1>${escapeHtml(content.documentTitle)}</h1>
      <div class="event">${escapeHtml(content.eventLabel)}</div>
      <p class="intro">${escapeHtml(content.eventIntroduction)}</p>
      <p class="acceptance">${escapeHtml(content.acceptanceStatement)}</p>
      <ol class="terms">${terms}</ol>
      <p class="acknowledgement">${escapeHtml(content.signatureAcknowledgement)}</p>

      <section class="signature-block">
        <div class="meta">
          <div>
            <div class="label">${escapeHtml(content.pdf.signedBy)}</div>
            <div class="name">${escapeHtml(fullName)}</div>
          </div>
          <div class="date">${escapeHtml(formatDubaiTime(signedAt, language))}</div>
        </div>

        <div class="signature-line">
          <img src="${signatureDataUrl}" alt="" />
          <div class="signature-caption">${escapeHtml(content.pdf.handwrittenSignature)}</div>
        </div>
      </section>

      <p class="privacy">${escapeHtml(content.dataProcessingNotice)}</p>
      <p class="reference">${escapeHtml(content.pdf.documentReference)}: ${escapeHtml(submissionId)}</p>
    </main>

    <footer>
      <div>${escapeHtml(content.pdf.footerLabel)}</div>
      <div>${escapeHtml(submissionId)}</div>
    </footer>
  </body>
</html>`;
}

export async function createSignedWaiverPdf(input: SignedWaiverDocumentInput) {
  const language = normalizeWaiverLanguage(input.language || fallbackWaiverLanguage);
  const arabicFontBytes = await readFile(arabicFontPath);
  let browser: Browser | null = null;

  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    const html = buildSignedWaiverHtml({
      ...input,
      language,
      arabicFontBase64: Buffer.from(arabicFontBytes).toString("base64"),
    });

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.evaluateHandle("document.fonts.ready");

    const pdfBytes = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return pdfBytes;
  } finally {
    await browser?.close();
  }
}
