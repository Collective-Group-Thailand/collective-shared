import { bahtToSatang, gbToBytes } from './units';

/**
 * Storage policy of one product and tenant type (D-276), built from the product's settings — every number here is a
 * setting, never a constant in code. Each product decides its own values (getproperty: dormitory / landlord; getpack:
 * factory / partner).
 */
export interface StoragePolicySettings {
  /** Free allowance per tenant, in GB (setting, e.g. "5"). */
  freeGb: string;
  /** Price per GB-month above the allowance, in baht (setting, e.g. "1.00"); null = overage not sold, uploads held. */
  pricePerGbMonth: string | null;
  /** Add-on packs the tenant can buy: size and monthly price. */
  packs: { key: string; gb: string; monthlyPrice: string }[];
  /** Counted size of one stored record per record type, in bytes (setting, e.g. invoice: 2048). */
  recordBytes: Record<string, number>;
  /** Default counted size for a record type not listed. */
  defaultRecordBytes: number;
  /** Usage ratios that trigger a notice, in percent (default 80 and 100). */
  noticeAtPercent: number[];
}

export interface StoragePolicy {
  freeBytes: bigint;
  pricePerGbMonthSatang: bigint | null;
  packs: { key: string; bytes: bigint; monthlyPriceSatang: bigint }[];
  recordBytes: Record<string, bigint>;
  defaultRecordBytes: bigint;
  noticeAtPercent: number[];
}

export function storagePolicy(settings: StoragePolicySettings): StoragePolicy {
  const notices = [...new Set(settings.noticeAtPercent)].filter((p) => p > 0 && p <= 1000).sort((a, b) => a - b);
  return {
    freeBytes: gbToBytes(settings.freeGb),
    pricePerGbMonthSatang: settings.pricePerGbMonth === null ? null : bahtToSatang(settings.pricePerGbMonth),
    packs: settings.packs.map((pack) => ({
      key: pack.key,
      bytes: gbToBytes(pack.gb),
      monthlyPriceSatang: bahtToSatang(pack.monthlyPrice),
    })),
    recordBytes: Object.fromEntries(Object.entries(settings.recordBytes).map(([type, size]) => [type, BigInt(size)])),
    defaultRecordBytes: BigInt(settings.defaultRecordBytes),
    noticeAtPercent: notices.length > 0 ? notices : [80, 100],
  };
}
