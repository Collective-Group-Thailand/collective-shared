import type { StoragePolicy } from './policy';

/**
 * What a tenant stores (D-276): files at their real size, records at the counted size of their type — so the number
 * is predictable and can be audited, without measuring the database.
 */
export interface StorageUsage {
  fileBytes: bigint;
  /** Count of stored records per record type (invoice, receipt, meter_reading, message…). */
  records: Record<string, number>;
}

export type RetentionClass =
  /** Documents the law requires (receipts, tax invoices, leases, bills): always produced and kept, never held. */
  | 'legal'
  /** Operational files the product needs (meter photos, slips, repair photos): accepted even when full, billed. */
  | 'operational'
  /** Optional uploads (extra galleries, attachments): held when the tenant is over and overage is not sold. */
  | 'optional';

export function countedBytes(usage: StorageUsage, policy: StoragePolicy): bigint {
  let total = usage.fileBytes;
  for (const [type, count] of Object.entries(usage.records)) {
    if (count < 0 || !Number.isInteger(count)) throw new RangeError(`invalid record count for ${type}`);
    total += BigInt(count) * (policy.recordBytes[type] ?? policy.defaultRecordBytes);
  }
  return total;
}

export type QuotaLevel = 'ok' | 'warning' | 'full' | 'over';

export interface QuotaState {
  usedBytes: bigint;
  /** Free allowance plus purchased packs. */
  allowanceBytes: bigint;
  /** Used / allowance in basis points (10000 = 100 %). */
  usedBasisPoints: number;
  level: QuotaLevel;
}

/** Where a tenant stands against its allowance. `warning` from the first notice threshold below 100 %. */
export function quotaState(usage: StorageUsage, policy: StoragePolicy, purchasedPackKeys: string[] = []): QuotaState {
  const usedBytes = countedBytes(usage, policy);
  const allowanceBytes =
    policy.freeBytes +
    purchasedPackKeys.reduce((sum, key) => sum + (policy.packs.find((p) => p.key === key)?.bytes ?? 0n), 0n);
  const usedBasisPoints =
    allowanceBytes === 0n ? (usedBytes > 0n ? 1_000_000 : 0) : Number((usedBytes * 10000n) / allowanceBytes);
  const warnAt = (policy.noticeAtPercent.find((p) => p < 100) ?? 80) * 100;
  const level: QuotaLevel =
    usedBasisPoints > 10000
      ? 'over'
      : usedBasisPoints === 10000
        ? 'full'
        : usedBasisPoints >= warnAt
          ? 'warning'
          : 'ok';
  return { usedBytes, allowanceBytes, usedBasisPoints, level };
}

export type Admission =
  { accepted: true; overage: boolean } | { accepted: false; reason: 'storage.allowance_exceeded' };

/**
 * Whether a new item may be stored. Never refuses `legal` or `operational` items — the overage is billed instead
 * (D-276: a customer's data is never deleted or locked). `optional` uploads are held only when the tenant would be over
 * its allowance and overage is not sold.
 */
export function admit(
  item: { retention: RetentionClass; bytes: bigint },
  state: QuotaState,
  policy: StoragePolicy,
): Admission {
  const after = state.usedBytes + item.bytes;
  const overage = after > state.allowanceBytes;
  if (!overage || item.retention !== 'optional' || policy.pricePerGbMonthSatang !== null) {
    return { accepted: true, overage };
  }
  return { accepted: false, reason: 'storage.allowance_exceeded' };
}

/** The notice thresholds (percent) crossed going from one state to the next — each is sent once (LINE, console). */
export function crossedThresholds(before: QuotaState, after: QuotaState, policy: StoragePolicy): number[] {
  return policy.noticeAtPercent.filter((p) => before.usedBasisPoints < p * 100 && after.usedBasisPoints >= p * 100);
}
