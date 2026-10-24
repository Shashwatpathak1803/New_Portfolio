/**
 * WhatsApp Phone Number & Click-to-Chat Utilities
 *
 * WhatsApp Click-to-Chat standard format:
 * https://wa.me/<number>?text=<urlencodedtext>
 * Where <number> is a full phone number in international format without plus signs,
 * hyphens, brackets, or zeroes.
 */

export interface PhoneValidationResult {
  valid: boolean;
  normalized: string; // Digits only without '+' for the wa.me URL
  formatted: string;  // Clean international format e.g. +91 98765 43210
  error?: string;
}

/**
 * Validates and normalizes an international phone number.
 * Strict rules:
 * - Must include country code with a leading '+' or clear country code prefix.
 * - Does NOT silently guess or assume a default country code.
 * - International numbers (E.164) have between 8 and 15 digits.
 */
export function validateAndNormalizePhone(rawPhone: string): PhoneValidationResult {
  const trimmed = String(rawPhone || "").trim();

  if (!trimmed) {
    return {
      valid: false,
      normalized: "",
      formatted: "",
      error: "Recipient mobile number is required.",
    };
  }

  // Remove common non-numeric punctuation: spaces, parentheses, hyphens, dots
  const stripped = trimmed.replace(/[\s\(\)\-\.]/g, "");

  // International numbers must specify country code, indicated by leading '+' or '00'
  const hasLeadingPlus = trimmed.startsWith("+");
  const hasLeadingDoubleZero = stripped.startsWith("00");

  if (!hasLeadingPlus && !hasLeadingDoubleZero) {
    // If entered as just 10 digits without country code, explicitly reject it
    return {
      valid: false,
      normalized: "",
      formatted: "",
      error: "Please include the country code with '+' (e.g. +91 9876543210 or +1 5551234567).",
    };
  }

  // Extract pure digits
  let digits = stripped.replace(/\D/g, "");
  if (hasLeadingDoubleZero) {
    digits = digits.replace(/^00/, "");
  }

  // E.164 international standard: 8 to 15 digits
  if (digits.length < 8 || digits.length > 15) {
    return {
      valid: false,
      normalized: "",
      formatted: "",
      error: `Invalid phone number length (${digits.length} digits). International phone numbers must have 8 to 15 digits.`,
    };
  }

  // Format with leading '+' for display
  const formatted = `+${digits}`;

  return {
    valid: true,
    normalized: digits,
    formatted,
  };
}

/**
 * Generates the official click-to-chat URL for WhatsApp.
 * Opens in browser/app with the pre-filled message.
 */
export function buildWhatsAppUrl(rawPhone: string, message: string): { url: string; error?: string } {
  const phoneValidation = validateAndNormalizePhone(rawPhone);
  if (!phoneValidation.valid) {
    return { url: "", error: phoneValidation.error };
  }

  const cleanMessage = String(message || "").trim();
  if (!cleanMessage) {
    return { url: "", error: "Message content cannot be empty." };
  }

  const encodedMessage = encodeURIComponent(cleanMessage);
  const url = `https://wa.me/${phoneValidation.normalized}?text=${encodedMessage}`;

  return { url };
}
