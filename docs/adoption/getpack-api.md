# Adopt collective-shared in getpack-api (run on the Mac)

```
Adopt @collective/integrations, @collective/documents and @collective/content in getpack-api (decisions of
Collective: shared packages D-275, storage pricing D-276, content engine D-277 — record them in getpack's own
docs/decisions.md with getpack numbering first). Plan first; do not change behaviour.
1. pnpm add the three packages with link: to ../../collective-shared/packages/*.
2. Replace src/integrations/{http,identity,sms,email,secrets,pdf,virus-scan,web-push,webhooks-out,teams,payments,s3}
   imports with '@collective/integrations/<subpath>' (s3 → storage, webhooks-out → webhooks, payments →
   payments/gateways; line-messaging → line, adapting LineMessaging call sites). Keep carriers, dieline,
   material-price-index, bank-files local. setIntegrationsLogger in bootstrap.
3. Storage metering for factories/partners (D-276) as in getproperty: settings, snapshot job, admission, notices,
   monthly invoice line — amounts null until set.
4. CMS (catalog/cms): keep endpoints; validate articles with validateArticle() from @collective/content and render
   Article/FAQ JSON-LD with articleGraphs().
5. All gates green; commit on a branch feat/collective-shared; report.
```
