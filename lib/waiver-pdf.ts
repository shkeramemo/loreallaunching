import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import {
  dataProcessingNotice,
  signatureAcknowledgement,
  waiverAcceptanceStatement,
  waiverEventIntroduction,
  waiverTerms,
} from "@/lib/waiver-terms";

type SignedWaiverDocumentInput = {
  fullName: string;
  signaturePng: Uint8Array;
  signedAt: string;
  submissionId: string;
};

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 54;
const contentWidth = pageWidth - margin * 2;
const bodySize = 9.5;
const lineHeight = 13.25;
const ink = rgb(0.09, 0.08, 0.07);
const graphite = rgb(0.25, 0.24, 0.23);
const rouge = rgb(0.7, 0.09, 0.2);
const divider = rgb(0.82, 0.81, 0.79);

function printableText(value: string) {
  return value
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"');
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  size: number,
  maxWidth: number,
) {
  const lines: string[] = [];

  for (const paragraph of printableText(text).split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;

      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) {
          lines.push(line);
        }
        line = word;
      }
    }

    if (line) {
      lines.push(line);
    }
  }

  return lines;
}

function formatDubaiTime(value: string) {
  return `${new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(new Date(value))} GST`;
}

export async function createSignedWaiverPdf({
  fullName,
  signaturePng,
  signedAt,
  submissionId,
}: SignedWaiverDocumentInput) {
  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const signatureImage = await pdf.embedPng(signaturePng);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let pageNumber = 1;
  let cursorY = pageHeight - margin;

  function addPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    pageNumber += 1;
    cursorY = pageHeight - margin;
    drawPageHeader();
  }

  function drawPageHeader() {
    page.drawLine({
      start: { x: margin, y: pageHeight - 36 },
      end: { x: pageWidth - margin, y: pageHeight - 36 },
      thickness: 0.75,
      color: divider,
    });
    page.drawText("L'OREALISTAR", {
      x: margin,
      y: pageHeight - 28,
      size: 8,
      font: helveticaBold,
      color: rouge,
    });
    page.drawText("Personal Release Undertaking", {
      x: pageWidth - margin - 116,
      y: pageHeight - 28,
      size: 7.5,
      font: helvetica,
      color: graphite,
    });
  }

  function drawPageFooter() {
    page.drawLine({
      start: { x: margin, y: 35 },
      end: { x: pageWidth - margin, y: 35 },
      thickness: 0.75,
      color: divider,
    });
    page.drawText("L'Orealistar Launch Event | 23 June 2026 | Isola Bay, Dubai", {
      x: margin,
      y: 22,
      size: 7,
      font: helvetica,
      color: graphite,
    });
    page.drawText(`Page ${pageNumber}`, {
      x: pageWidth - margin - 34,
      y: 22,
      size: 7,
      font: helvetica,
      color: graphite,
    });
  }

  function ensureSpace(height: number) {
    if (cursorY - height < 62) {
      drawPageFooter();
      addPage();
    }
  }

  function drawParagraph(
    text: string,
    {
      font = helvetica,
      size = bodySize,
      color = graphite,
      gap = 8,
      x = margin,
      width = contentWidth,
    }: {
      font?: typeof helvetica;
      size?: number;
      color?: ReturnType<typeof rgb>;
      gap?: number;
      x?: number;
      width?: number;
    } = {},
  ) {
    const lines = wrapText(text, font, size, width);
    ensureSpace(lines.length * lineHeight + gap);

    for (const line of lines) {
      page.drawText(line, { x, y: cursorY, size, font, color });
      cursorY -= lineHeight;
    }

    cursorY -= gap;
  }

  drawPageHeader();
  page.drawText("PERSONAL RELEASE UNDERTAKING", {
    x: margin,
    y: cursorY,
    size: 18,
    font: helveticaBold,
    color: ink,
  });
  cursorY -= 29;
  page.drawText("L'Orealistar Launch Event", {
    x: margin,
    y: cursorY,
    size: 12,
    font: helveticaBold,
    color: rouge,
  });
  cursorY -= 28;

  drawParagraph(waiverEventIntroduction, {
    font: helvetica,
    size: 10,
    color: ink,
    gap: 11,
  });
  drawParagraph(waiverAcceptanceStatement, {
    font: helveticaBold,
    size: 10,
    color: ink,
    gap: 16,
  });

  waiverTerms.forEach((term, index) => {
    const lines = wrapText(term.body, helvetica, bodySize, contentWidth - 22);
    ensureSpace(lines.length * lineHeight + 13);
    page.drawText(`${index + 1}.`, {
      x: margin,
      y: cursorY,
      size: bodySize,
      font: helveticaBold,
      color: ink,
    });
    for (const line of lines) {
      page.drawText(line, {
        x: margin + 22,
        y: cursorY,
        size: bodySize,
        font: helvetica,
        color: graphite,
      });
      cursorY -= lineHeight;
    }
    cursorY -= 8;
  });

  drawParagraph(signatureAcknowledgement, {
    font: helveticaBold,
    size: 10,
    color: ink,
    gap: 14,
  });

  ensureSpace(166);
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: pageWidth - margin, y: cursorY },
    thickness: 0.75,
    color: divider,
  });
  cursorY -= 23;
  page.drawText("SIGNED BY", {
    x: margin,
    y: cursorY,
    size: 8,
    font: helveticaBold,
    color: rouge,
  });
  cursorY -= 25;
  page.drawText(printableText(fullName), {
    x: margin,
    y: cursorY,
    size: 12,
    font: helveticaBold,
    color: ink,
  });
  page.drawText(formatDubaiTime(signedAt), {
    x: pageWidth - margin - 145,
    y: cursorY,
    size: 9,
    font: helvetica,
    color: graphite,
  });
  cursorY -= 52;
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: margin + 215, y: cursorY },
    thickness: 0.75,
    color: rgb(0.45, 0.44, 0.42),
  });
  const signatureDimensions = signatureImage.scaleToFit(205, 72);
  page.drawImage(signatureImage, {
    x: margin + 8,
    y: cursorY + 7,
    width: signatureDimensions.width,
    height: signatureDimensions.height,
  });
  page.drawText("Handwritten signature", {
    x: margin,
    y: cursorY - 15,
    size: 8,
    font: helvetica,
    color: graphite,
  });
  cursorY -= 44;
  drawParagraph(dataProcessingNotice, { size: 8, color: graphite, gap: 0 });

  page.drawText(`Document reference: ${submissionId}`, {
    x: margin,
    y: 46,
    size: 7,
    font: helvetica,
    color: graphite,
  });
  drawPageFooter();

  return pdf.save();
}
