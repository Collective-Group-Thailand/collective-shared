import type { StoragePolicy } from './policy';
import { divRound, GIB, satangToBaht } from './units';

export interface StorageCharge {
  /** Average counted bytes above the allowance over the month, as byte-days / days. */
  averageOverageBytes: bigint;
  /** Overage in GB-months, three decimals (for the invoice line). */
  overageGbMonths: string;
  overageAmount: string;
  packsAmount: string;
  /** Overage + packs, baht, two decimals. */
  total: string;
}

/**
 * Monthly storage charge (D-276), like cloud drives bill: the average of the daily snapshots above the allowance,
 * priced per GB-month, plus the purchased packs. Days without a snapshot count as the previous day's size (the caller
 * passes one value per day of the month). Rounded half up to the satang.
 */
export function monthlyStorageCharge(input: {
  dailyUsedBytes: bigint[];
  policy: StoragePolicy;
  purchasedPackKeys?: string[];
}): StorageCharge {
  const { dailyUsedBytes, policy } = input;
  if (dailyUsedBytes.length === 0) throw new RangeError('at least one daily snapshot is required');
  const packs = (input.purchasedPackKeys ?? []).map((key) => {
    const pack = policy.packs.find((p) => p.key === key);
    if (!pack) throw new RangeError(`unknown storage pack ${key}`);
    return pack;
  });
  const allowance = policy.freeBytes + packs.reduce((sum, p) => sum + p.bytes, 0n);
  const days = BigInt(dailyUsedBytes.length);
  const overByteDays = dailyUsedBytes.reduce((sum, used) => sum + (used > allowance ? used - allowance : 0n), 0n);
  const averageOverageBytes = divRound(overByteDays, days);
  // satang = average bytes / GiB × price per GB-month, rounded half up.
  const overageSatang =
    policy.pricePerGbMonthSatang === null ? 0n : divRound(averageOverageBytes * policy.pricePerGbMonthSatang, GIB);
  const packsSatang = packs.reduce((sum, p) => sum + p.monthlyPriceSatang, 0n);
  const milliGbMonths = divRound(averageOverageBytes * 1000n, GIB);
  return {
    averageOverageBytes,
    overageGbMonths: `${milliGbMonths / 1000n}.${String(milliGbMonths % 1000n).padStart(3, '0')}`,
    overageAmount: satangToBaht(overageSatang),
    packsAmount: satangToBaht(packsSatang),
    total: satangToBaht(overageSatang + packsSatang),
  };
}
