# Adopt collective-shared in getproperty-api (run on the Mac — Node 24, Postgres, jest)

Paste into Claude Code in `~/Collective/getproperty/getproperty-api` (read `RESUME.md` and `AGENT-BRIEF.md` first).

```
Adopt @collective/integrations and @collective/documents (D-275, D-276) in getproperty-api. Plan first.
1. pnpm add @collective/integrations@link:../../collective-shared/packages/integrations and @collective/documents likewise.
2. For each integration listed in ../../collective-shared/PROVENANCE.md as coming from getproperty or as superseding
   getproperty's (sms, line, email, storage, secrets, pdf except the queue renderer, payments/qr, etax, ocr, ai, http):
   replace the local file imports with the package subpath (e.g. '@collective/integrations/sms'), keep the Nest
   providers in src/integrations/integrations.module.ts (tokens may stay), delete the now-unused local files.
   Map renamed types (e.g. SmsPort → SmsSender, ProviderError stays in http) with thin local aliases where many call
   sites use the old name. Call setIntegrationsLogger(new Logger('Integrations')) in bootstrap.
3. Keep product-specific integrations local: kms, locks, mqtt, integration-webhooks, queue PDF renderer.
4. D-276: add settings storage.free_gb, storage.price_per_gb_month (null = not sold), storage.packs,
   storage.record_bytes, storage.notice_at_percent (per tenant type) with effective dates; tables from
   @collective/documents/sql/storage-metering.sql adapted to the schema rules (schema-design.md first);
   a daily snapshot job; admission check on uploads; LINE notices at thresholds; the storage line on the monthly
   platform invoice next to the payment fee (D-250). Amounts stay null until the founder sets them.
5. Green: lint, typecheck, unit, EMBEDDED_PG=1 pnpm test:int (in batches), contract:build + contract:lint, build.
6. Commit on feat/b7-landlords-free-pricing; update RESUME.md and docs/PROGRESS.md.
```
