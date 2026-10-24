/**
 * Where to send someone after sign-in: only a same-site relative path, never another origin, a protocol-relative URL
 * (`//evil.example`), a backslash trick or a control character. Falls back when unsafe.
 */
export function safeReturnTo(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\')) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(decoded)) return fallback;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(decoded)) return fallback;
  return decoded.length > 2048 ? fallback : decoded;
}
