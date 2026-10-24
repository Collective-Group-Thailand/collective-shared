import { randomUUID } from 'node:crypto';

/** Content types a product accepts by default; each product narrows or extends per document kind. */
export const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
] as const;

/** A safe file name for `Content-Disposition`: no path, no control characters, at most 120 characters. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file';
  const clean = base
    .replace(/[\u0000-\u001f\u007f"<>|:*?]/g, '')
    .trim()
    .slice(-120);
  return clean || 'file';
}

/**
 * The object key of a new upload: tenant first (isolation, per-tenant metering and lifecycle rules), then the month,
 * then a random id — never the user's file name, which travels only as metadata.
 */
export function objectKey(input: { product: string; tenantId: string; kind: string; now?: Date }): string {
  if (!/^[a-z0-9-]{2,32}$/.test(input.product)) throw new RangeError('invalid product');
  if (!/^[0-9a-f-]{36}$/i.test(input.tenantId)) throw new RangeError('invalid tenant id');
  if (!/^[a-z0-9_]{2,40}$/.test(input.kind)) throw new RangeError('invalid document kind');
  const now = input.now ?? new Date();
  const month = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${input.product}/t/${input.tenantId.toLowerCase()}/${input.kind}/${month}/${randomUUID()}`;
}

export type UploadCheck =
  { ok: true } | { ok: false; code: 'document.type_not_allowed' | 'document.too_large' | 'document.empty' };

/** Checks an upload request before a presigned PUT is issued. */
export function checkUpload(
  request: { contentType: string; sizeBytes: number },
  rules: { allowedTypes?: readonly string[]; maxBytes: number },
): UploadCheck {
  if (request.sizeBytes <= 0) return { ok: false, code: 'document.empty' };
  if (request.sizeBytes > rules.maxBytes) return { ok: false, code: 'document.too_large' };
  const allowed = rules.allowedTypes ?? DEFAULT_ALLOWED_TYPES;
  if (!allowed.includes(request.contentType.toLowerCase())) return { ok: false, code: 'document.type_not_allowed' };
  return { ok: true };
}
