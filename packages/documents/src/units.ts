/** Bytes and money helpers. Money is integer satang in, decimal-string baht out (never floating point). */
export const KIB = 1024n;
export const MIB = 1024n * KIB;
export const GIB = 1024n * MIB;

/** "5" or "0.5" (GB, as a setting) → bytes, rounded down. Binary gigabytes (GiB), as storage providers bill. */
export function gbToBytes(gb: string): bigint {
  const match = /^(\d{1,9})(?:\.(\d{1,6}))?$/.exec(gb.trim());
  if (!match) throw new RangeError(`invalid GB value: ${gb}`);
  const fraction = (match[2] ?? '').padEnd(6, '0');
  return ((BigInt(match[1]!) * 1_000_000n + BigInt(fraction)) * GIB) / 1_000_000n;
}

/** "12.50" baht → 1250n satang. */
export function bahtToSatang(baht: string): bigint {
  const match = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(baht.trim());
  if (!match) throw new RangeError(`invalid baht amount: ${baht}`);
  return BigInt(match[1]!) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'));
}

/** 1250n satang → "12.50". */
export function satangToBaht(satang: bigint): string {
  const negative = satang < 0n;
  const abs = negative ? -satang : satang;
  return `${negative ? '-' : ''}${abs / 100n}.${String(abs % 100n).padStart(2, '0')}`;
}

/** a / b rounded half up, for non-negative integers. */
export function divRound(a: bigint, b: bigint): bigint {
  if (b <= 0n) throw new RangeError('division by a non-positive number');
  return (a + b / 2n) / b;
}

/** Human size for notices ("1.5 GB"): one decimal, binary units. */
export function formatBytes(bytes: bigint): string {
  const units: [bigint, string][] = [
    [GIB * 1024n, 'TB'],
    [GIB, 'GB'],
    [MIB, 'MB'],
    [KIB, 'KB'],
  ];
  for (const [size, label] of units) {
    if (bytes >= size) {
      const tenths = divRound(bytes * 10n, size);
      return `${tenths / 10n}${tenths % 10n ? `.${tenths % 10n}` : ''} ${label}`;
    }
  }
  return `${bytes} B`;
}
