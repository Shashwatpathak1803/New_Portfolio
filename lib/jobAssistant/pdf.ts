import { extractText } from "unpdf";

export interface PdfExtractionResult {
  text: string;
  isScannedOrEmpty: boolean;
  totalPages: number;
}

/**
 * Validates PDF magic bytes (%PDF-).
 */
export function isPdfBuffer(buffer: Buffer | Uint8Array): boolean {
  if (!buffer || buffer.length < 5) return false;
  // %PDF- in ASCII is 0x25, 0x50, 0x44, 0x46, 0x2D
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Extracts and sanitizes plain text from a PDF buffer.
 * Gracefully flags scanned/image-only PDFs.
 */
export async function extractPdfText(
  buffer: Buffer | Uint8Array
): Promise<PdfExtractionResult> {
  if (!isPdfBuffer(buffer)) {
    throw new Error("Invalid file content: Not a valid PDF document.");
  }

  try {
    // Clone buffer bytes to prevent unpdf/PDF.js from detaching the caller's ArrayBuffer
    const copy = new Uint8Array(buffer.slice(0));
    const result = await extractText(copy);

    let rawText = "";
    if (Array.isArray(result.text)) {
      rawText = result.text.join("\n\n");
    } else if (typeof result.text === "string") {
      rawText = result.text;
    }

    // Clean up excessive whitespace and control characters while preserving paragraphs
    const cleanedText = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Check if the PDF has meaningful extractable text
    // Scanned or image-only PDFs usually return empty or very few characters
    const meaningfulCharCount = cleanedText.replace(/\s+/g, "").length;
    const isScannedOrEmpty = meaningfulCharCount < 60;

    return {
      text: cleanedText,
      isScannedOrEmpty,
      totalPages: result.totalPages || 1,
    };
  } catch (err) {
    console.error("[job-assistant/pdf] Text extraction failed:", err);
    return {
      text: "",
      isScannedOrEmpty: true,
      totalPages: 1,
    };
  }
}
