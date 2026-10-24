import { monthlyStorageCharge } from './billing';
import { checkUpload, objectKey, safeFileName } from './keys';
import { storagePolicy, type StoragePolicySettings } from './policy';
import { bahtToSatang, formatBytes, GIB, gbToBytes, MIB, satangToBaht } from './units';
import { admit, countedBytes, crossedThresholds, quotaState } from './usage';

const SETTINGS: StoragePolicySettings = {
  freeGb: '5',
  pricePerGbMonth: '2.00',
  packs: [{ key: 'plus50', gb: '50', monthlyPrice: '39.00' }],
  recordBytes: { invoice: 2048, meter_reading: 512 },
  defaultRecordBytes: 1024,
  noticeAtPercent: [80, 100],
};
const policy = storagePolicy(SETTINGS);

describe('units', () => {
  it('converts GB, baht and bytes exactly', () => {
    expect(gbToBytes('5')).toBe(5n * GIB);
    expect(gbToBytes('0.5')).toBe(GIB / 2n);
    expect(bahtToSatang('12.5')).toBe(1250n);
    expect(satangToBaht(1250n)).toBe('12.50');
    expect(formatBytes(GIB + GIB / 2n)).toBe('1.5 GB');
    expect(formatBytes(3n * MIB)).toBe('3 MB');
    expect(() => gbToBytes('-1')).toThrow();
  });
});

describe('usage and quota (D-276)', () => {
  it('counts files at their size and records at the counted size per type', () => {
    expect(countedBytes({ fileBytes: 1000n, records: { invoice: 10, meter_reading: 4, message: 2 } }, policy)).toBe(
      1000n + 20480n + 2048n + 2048n,
    );
  });

  it('reports ok, warning, full and over against free + purchased packs', () => {
    expect(quotaState({ fileBytes: GIB, records: {} }, policy).level).toBe('ok');
    expect(quotaState({ fileBytes: 4n * GIB, records: {} }, policy).level).toBe('warning');
    expect(quotaState({ fileBytes: 5n * GIB, records: {} }, policy).level).toBe('full');
    expect(quotaState({ fileBytes: 6n * GIB, records: {} }, policy).level).toBe('over');
    expect(quotaState({ fileBytes: 6n * GIB, records: {} }, policy, ['plus50']).level).toBe('ok');
  });

  it('never refuses legal or operational items; holds optional ones only when overage is not sold', () => {
    const full = quotaState({ fileBytes: 5n * GIB, records: {} }, policy);
    expect(admit({ retention: 'legal', bytes: MIB }, full, policy)).toEqual({ accepted: true, overage: true });
    expect(admit({ retention: 'optional', bytes: MIB }, full, policy)).toEqual({ accepted: true, overage: true });
    const noOverage = storagePolicy({ ...SETTINGS, pricePerGbMonth: null });
    const fullNoOverage = quotaState({ fileBytes: 5n * GIB, records: {} }, noOverage);
    expect(admit({ retention: 'optional', bytes: MIB }, fullNoOverage, noOverage)).toEqual({
      accepted: false,
      reason: 'storage.allowance_exceeded',
    });
    expect(admit({ retention: 'operational', bytes: MIB }, fullNoOverage, noOverage).accepted).toBe(true);
  });

  it('sends each notice once when a threshold is crossed', () => {
    const before = quotaState({ fileBytes: 3n * GIB, records: {} }, policy);
    const after = quotaState({ fileBytes: 5n * GIB, records: {} }, policy);
    expect(crossedThresholds(before, after, policy)).toEqual([80, 100]);
    expect(crossedThresholds(after, after, policy)).toEqual([]);
  });
});

describe('monthly storage charge (D-276)', () => {
  it('bills the average overage per GB-month plus packs', () => {
    // 30 days: 15 days at 5 GB (no overage), 15 days at 7 GB (2 GB over) → average 1 GB over → 2.00 baht.
    const days = [...Array(15).fill(5n * GIB), ...Array(15).fill(7n * GIB)] as bigint[];
    expect(monthlyStorageCharge({ dailyUsedBytes: days, policy })).toEqual({
      averageOverageBytes: GIB,
      overageGbMonths: '1.000',
      overageAmount: '2.00',
      packsAmount: '0.00',
      total: '2.00',
    });
    expect(monthlyStorageCharge({ dailyUsedBytes: days, policy, purchasedPackKeys: ['plus50'] }).total).toBe('39.00');
  });

  it('charges nothing under the allowance', () => {
    expect(monthlyStorageCharge({ dailyUsedBytes: [GIB, 2n * GIB], policy }).total).toBe('0.00');
  });
});

describe('keys and upload checks', () => {
  it('keys by product, tenant, kind and month with a random id', () => {
    const key = objectKey({
      product: 'getproperty',
      tenantId: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b',
      kind: 'payment_slip',
      now: new Date('2026-10-25T00:00:00Z'),
    });
    expect(key).toMatch(
      /^getproperty\/t\/0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b\/payment_slip\/2026\/10\/[0-9a-f-]{36}$/,
    );
    expect(() => objectKey({ product: 'x', tenantId: 'bad', kind: 'k' })).toThrow();
  });

  it('cleans file names and checks type and size', () => {
    expect(safeFileName('../../etc/passwd')).toBe('passwd');
    expect(safeFileName('สลิป:ตุลาคม?.jpg')).toBe('สลิปตุลาคม.jpg');
    expect(checkUpload({ contentType: 'image/jpeg', sizeBytes: 10 }, { maxBytes: 100 })).toEqual({ ok: true });
    expect(checkUpload({ contentType: 'text/html', sizeBytes: 10 }, { maxBytes: 100 })).toEqual({
      ok: false,
      code: 'document.type_not_allowed',
    });
    expect(checkUpload({ contentType: 'image/png', sizeBytes: 101 }, { maxBytes: 100 }).ok).toBe(false);
  });
});
