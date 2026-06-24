import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const terms = [
  "I acknowledge that the Event will be shot (both photos and videos) by L'Oreal and thus, my image will be captured. For the purpose of this undertaking, Image shall be defined as covering all my identification attributes, especially my image, surname, first name, voice, signature, likeness and qualities, this list being non-exhaustive.",
  "I agree to authorize L'Oreal its parent company, affiliates, sister companies, subsidiaries and in general to the L'Oreal Group to use, reproduce and display my Image for marketing and advertising purposes both online (on its digital assets, including but not limited to Facebook page, Instagram account, L'Oreal's website, YouTube channel etc.; e-magazine platforms; social media pages of retailers etc.) and offline (windows, podiums, all points of sale materials etc.) on any medium whatsoever, and on any format (including on modified formats) whether for internal use, external use, public event or other and in general for the purpose of advertising and promoting L'Oreal.",
  "Such usage by L'Oreal shall be limited to the Image collected and any other tangible or non-tangible materials produced within the scope of the Event (the Material), that may incorporate all or part of the Image, if necessary, by associating any trademark or service mark and L'Oreal's distinctive signs in general (including logos, or signatures). I fully acknowledge that L'Oreal has no obligation whatsoever to use the Material.",
  "This authorization includes the right for L'Oreal to make any changes, additions, deletions, cropping etc., that it deems necessary to my original Image and is granted without any limitation with regard to the number of reproductions, representations and adaptations made.",
  "Such usage rights shall be granted to L'Oreal worldwide and for an unlimited duration and shall not cause L'Oreal to be liable in any way in relation to any such publication and/or use.",
  "I acknowledge and expressly agree that:\n- the Material and the intellectual property rights relating to the Material shall remain L'Oreal's exclusive property wherein L'Oreal can, at any time, transfer them to its parent company, affiliates, subsidiaries and in general to the L'Oreal Group.\n- the use or publication of my identification attributes for the purpose described above will be free of charge and will not entitle me to receive any financial compensation whatsoever from L'Oreal.\n- I shall not use or publish any photos and/or videos related to L'Oreal without L'Oreal's prior approval.\n- I will maintain strictly confidential the content of the present authorization as well as all information, of any nature whatsoever, obtained as a result of its implementation.\n- No stipulation in the present authorization shall be interpreted as creating a partnership between L'Oreal and myself.",
  "I expressly and irrevocably acknowledge and agree that I will not receive any financial compensation whatsoever from L'Oreal in return for the use of my Image and I hereby waive all claims in relation with the usage of my Image made in accordance with the terms contained herein.",
  "The content of this personal release undertaking is governed by the laws of the United Arab Emirates and in case of any dispute arising out of or in connection with this consent which cannot be settled amicably, the Parties agree to refer to the jurisdiction of the courts of Dubai.",
];

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 54;
const contentWidth = pageWidth - margin * 2;
const bodySize = 9.5;
const lineHeight = 13.25;
const ink = rgb(0.09, 0.08, 0.07);
const graphite = rgb(0.25, 0.24, 0.23);
const rouge = rgb(0.7, 0.09, 0.2);

function wrapText(text, font, size, maxWidth) {
  const lines = [];

  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }

    if (line) lines.push(line);
  }

  return lines;
}

const pdf = await PDFDocument.create();
const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

let page;
let cursorY;
let pageNumber = 0;

function addPage() {
  page = pdf.addPage([pageWidth, pageHeight]);
  pageNumber += 1;
  cursorY = pageHeight - margin;

  page.drawLine({
    start: { x: margin, y: pageHeight - 36 },
    end: { x: pageWidth - margin, y: pageHeight - 36 },
    thickness: 0.75,
    color: rgb(0.82, 0.81, 0.79),
  });
  page.drawText("L'OREALISTAR", {
    x: margin,
    y: pageHeight - 28,
    size: 8,
    font: helveticaBold,
    color: rouge,
  });
  page.drawText("Sample document - layout approval only", {
    x: pageWidth - margin - 172,
    y: pageHeight - 28,
    size: 7.5,
    font: helvetica,
    color: graphite,
  });
}

function addFooter() {
  page.drawLine({
    start: { x: margin, y: 35 },
    end: { x: pageWidth - margin, y: 35 },
    thickness: 0.75,
    color: rgb(0.82, 0.81, 0.79),
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

function ensureSpace(height) {
  if (cursorY - height < 62) {
    addFooter();
    addPage();
  }
}

function drawParagraph(text, { font = helvetica, size = bodySize, color = graphite, gap = 8 } = {}) {
  const lines = wrapText(text, font, size, contentWidth);
  ensureSpace(lines.length * lineHeight + gap);

  for (const line of lines) {
    page.drawText(line, { x: margin, y: cursorY, size, font, color });
    cursorY -= lineHeight;
  }

  cursorY -= gap;
}

addPage();
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

drawParagraph(
  "The L'Orealistar Launch Event (the Event) is organized by L'Oreal Middle East FZE on 23 June 2026 in Isola Bay, Dubai, United Arab Emirates for the purpose of launching the L'Orealistar platform.",
  { font: helvetica, size: 10, color: ink, gap: 11 },
);
drawParagraph(
  "By attending the Event, I, the undersigned, accept without reserve the below terms.",
  { font: helveticaBold, size: 10, color: ink, gap: 16 },
);

terms.forEach((term, index) => {
  const heading = `${index + 1}.`;
  const bodyLines = wrapText(term, helvetica, bodySize, contentWidth - 22);
  ensureSpace(bodyLines.length * lineHeight + 13);
  page.drawText(heading, { x: margin, y: cursorY, size: bodySize, font: helveticaBold, color: ink });
  bodyLines.forEach((line) => {
    page.drawText(line, { x: margin + 22, y: cursorY, size: bodySize, font: helvetica, color: graphite });
    cursorY -= lineHeight;
  });
  cursorY -= 8;
});

drawParagraph(
  "By signing this personal release undertaking, I warrant that I am in my full capacity in order to grant the abovementioned rights to L'Oreal and irrevocably accept to be legally bound by the above terms.",
  { font: helveticaBold, size: 10, color: ink, gap: 14 },
);

ensureSpace(154);
page.drawLine({
  start: { x: margin, y: cursorY },
  end: { x: pageWidth - margin, y: cursorY },
  thickness: 0.75,
  color: rgb(0.82, 0.81, 0.79),
});
cursorY -= 23;
page.drawText("SIGNED BY", { x: margin, y: cursorY, size: 8, font: helveticaBold, color: rouge });
cursorY -= 25;
page.drawText("Sample Attendee", { x: margin, y: cursorY, size: 12, font: helveticaBold, color: ink });
page.drawText("23 June 2026, 2:30 PM GST", {
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
page.drawText("Sample Attendee", {
  x: margin + 10,
  y: cursorY + 11,
  size: 22,
  font: timesItalic,
  color: ink,
});
page.drawText("Handwritten signature", {
  x: margin,
  y: cursorY - 15,
  size: 8,
  font: helvetica,
  color: graphite,
});
cursorY -= 44;
drawParagraph(
  "Your personal data are collected and processed by L'Oreal in order to manage the Event, Film(s) and/or the Visual(s) for which you give your consent.",
  { size: 8, color: graphite, gap: 0 },
);
addFooter();

const outputDirectory = join(process.cwd(), "public", "samples");
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  join(outputDirectory, "lorealistar-sample-signed-waiver.pdf"),
  await pdf.save(),
);
