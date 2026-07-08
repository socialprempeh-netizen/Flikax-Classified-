/** Normalizes a Ghana phone number to E.164 (e.g. "024 123 4567" -> "+233241234567"). */
export function toGhanaE164(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    return digits.length === 12 && digits.startsWith("233") ? `+${digits}` : null;
  }
  if (digits.startsWith("233") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+233${digits}`;
  }
  return null;
}

/** Reverse of toGhanaE164, for prefilling local-format inputs (e.g. "+233241234567" -> "024 123 4567"). */
export function toGhanaLocal(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("233") ? `0${digits.slice(3)}` : digits;
  return local.length === 10 ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}` : local;
}
