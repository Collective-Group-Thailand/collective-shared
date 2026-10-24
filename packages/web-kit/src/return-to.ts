/**
 * Where to send someone after sign-in (`?next=`, `returnTo`): a same-origin path only — the open-redirect guard of
 * getproperty-web (review H3), shared by every product (D-275).
 *
 * The value is parsed the way the browser will resolve it — `new URL(value, origin)` with WHATWG rules, which strip
 * TAB/LF/CR and treat `\` as `/` — and must stay on that origin. Before parsing, anything a browser would silently
 * rewrite is refused outright: ASCII control characters, whitespace and backslashes, raw or percent-encoded in the path
 * (`/%09/evil.example`, `/\evil`, `/%5Cevil`), a path that starts with `//` (protocol-relative) in raw or decoded form,
 * and a first segment that looks like a scheme (`/javascript:…`). What comes back is the normalised
 * `pathname + search + hash`, never the raw string; anything unsafe gives `fallback`.
 */
const PROBE_ORIGIN = 'https://next.invalid';
const MAX_LENGTH = 2048;
const RAW_FORBIDDEN = /[\u0000-\u001F\u007F\s\\]/u;
const DECODED_FORBIDDEN = /[\u0000-\u001F\u007F\\]/u;

function decodeAll(value: string): string | undefined {
  // Decode until stable (bounded): `%2509` → `%09` → TAB.
  let current = value;
  for (let round = 0; round < 3; round += 1) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return undefined;
    }
    if (next === current) return current;
    current = next;
  }
  return current;
}

function safePath(value: string): string | undefined {
  if (value.length === 0 || value.length > MAX_LENGTH) return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  if (RAW_FORBIDDEN.test(value)) return undefined;

  let url: URL;
  try {
    url = new URL(value, PROBE_ORIGIN);
  } catch {
    return undefined;
  }
  if (url.origin !== PROBE_ORIGIN) return undefined;

  // The path is what a later redirect or `location.assign` resolves again: no encoded control characters, whitespace
  // or backslashes there, no protocol-relative start once decoded, no scheme-like first segment.
  const decodedPath = decodeAll(url.pathname);
  if (decodedPath === undefined || DECODED_FORBIDDEN.test(decodedPath) || /\s/u.test(decodedPath)) return undefined;
  if (decodedPath.startsWith('//') || url.pathname.startsWith('//')) return undefined;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(decodedPath)) return undefined;
  // The query may carry encoded spaces (`?q=a%20b`) but never control characters.
  const decodedSearch = decodeAll(url.search);
  if (decodedSearch === undefined || /[\u0000-\u001F\u007F]/u.test(decodedSearch)) return undefined;

  return `${url.pathname}${url.search}${url.hash}`;
}

export function safeReturnTo(value: unknown, fallback = '/'): string {
  return (typeof value === 'string' ? safePath(value) : undefined) ?? fallback;
}
