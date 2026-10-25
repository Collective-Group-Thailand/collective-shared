# collective-shared

Shared packages of Collective Group (Thailand) products — **getproperty**, **getpack**, **getbuild** (D-275, D-276, D-277).
One pnpm monorepo, one version per package (changesets), distributed like `@collective/asset-core`:
`link:` during development → git tag → GitHub Packages (`@collective` scope, restricted).

| Package                                             | What                                                                                                                                                                                                                                                                                                                                                                     | Used by              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| [`@collective/integrations`](packages/integrations) | Provider ports + real adapters + fakes, framework-free: identity (Firebase phone/Google/Apple, LINE), SMS, LINE login & messaging, e-mail (SES), object storage (S3), secrets, PDF (Puppeteer, PDF/A-3), virus scan (clamd), web push, outgoing webhooks, Teams, payments (gateways: SCB, 2C2P, Slip2Go; QR: KBank, SCB, Opn, Thai QR, EasySlip), e-Tax, OCR, AI gateway | API of every product |
| [`@collective/documents`](packages/documents)       | Document storage rules and **storage-based pricing**: object keys, upload checks, counted usage (files + records), quota levels, admission (never blocks legal documents), 80/100 % notices, monthly GB-month charge, SQL template                                                                                                                                       | API of every product |
| [`@collective/content`](packages/content)           | Article engine: model, validation, Article/FAQ JSON-LD, llms.txt sections, sitemap entries, affiliate link policy                                                                                                                                                                                                                                                        | web + API (CMS)      |
| [`@collective/web-kit`](packages/web-kit)           | Framework-free web helpers: schema.org JSON-LD builders, `llms.txt` renderer, robots rules, safe return-to, Thai phone numbers                                                                                                                                                                                                                                           | web of every product |

## Rules

- Products never import each other; shared code lives here. Product-specific integrations (locks, MQTT, carriers, dieline…) stay in their product.
- Framework-free: no NestJS, no React in package code. Each product wraps adapters in its own module and passes its logger with `setIntegrationsLogger()`.
- Money is integer satang inside, decimal strings at the edges. Every configurable number (allowances, prices) comes from the product's settings.
- Adapters never log request or response bodies (PDPA). Real adapters marked `UNVERIFIED` in their file header have not been run against the live provider.
- A change to a package = a changeset (`pnpm changeset`) + green `pnpm typecheck && pnpm test && pnpm build`.

## Commands

`pnpm install` · `pnpm typecheck` · `pnpm test` · `pnpm build` · `pnpm format` · `pnpm changeset` · `pnpm release` (CI, GitHub Packages)

## Using a package from a product (development)

```bash
# in getproperty-api (sibling folders under ~/Collective)
pnpm add @collective/integrations@link:../../collective-shared/packages/integrations
```

A Next.js web app installs with `file:` instead (Turbopack and the standalone output need the files inside the repo) and
pins `@collective/web-kit` with a pnpm override — see getproperty-web's package.json. Build this repo first.

Adoption guides per product: [`docs/adoption/`](docs/adoption). Where each file came from: [`PROVENANCE.md`](PROVENANCE.md).
