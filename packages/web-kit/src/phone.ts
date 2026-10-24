/**
 * Thai phone numbers for sign-in by OTP: accepts 0812345678, 081-234-5678, +66 81 234 5678, 66812345678 and returns
 * E.164 (+66812345678); null when it is not a Thai mobile or landline number.
 */
export function toE164Thai(input: string): string | null {
  const digits = input.replace(/[\s().-]/g, '');
  const national = digits.startsWith('+66')
    ? digits.slice(3)
    : digits.startsWith('66')
      ? digits.slice(2)
      : digits.startsWith('0')
        ? digits.slice(1)
        : null;
  if (national === null || !/^\d+$/.test(national)) return null;
  // Mobile: 9 digits starting 6, 8 or 9. Landline: 8 digits starting 2–7.
  if (/^[689]\d{8}$/.test(national) || /^[2-7]\d{7}$/.test(national)) return `+66${national}`;
  return null;
}

/** +66812345678 → 081-234-5678 (display); unknown formats are returned unchanged. */
export function formatThaiPhone(e164: string): string {
  const m = /^\+66([689]\d)(\d{3})(\d{4})$/.exec(e164);
  if (m) return `0${m[1]}-${m[2]}-${m[3]}`;
  const l = /^\+66([2-7])(\d{3})(\d{4})$/.exec(e164);
  return l ? `0${l[1]}-${l[2]}-${l[3]}` : e164;
}
