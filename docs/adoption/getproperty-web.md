# Adopt collective-shared in getproperty-web

```
Adopt @collective/web-kit and @collective/content in getproperty-web (D-275, D-277).
1. Install both with file: (not link: — Turbopack refuses files outside the repo and the standalone output must keep
   server.js at its root): "@collective/web-kit": "file:../../collective-shared/packages/web-kit", same for content, plus
   "pnpm": { "overrides": { "@collective/web-kit": "file:../../collective-shared/packages/web-kit" } }. Build
   collective-shared first; re-run pnpm install in the web repo after changing a package.
2. Replace src/features/owner/marketing/structured-data.ts builders with web-kit's (keep the file as a thin
   adapter if call sites need the old signatures); /llms.txt via renderLlmsTxt(); robots via robotsAllowRules().
3. Guides: type them as Article from @collective/content (locale, published added); the guides test uses
   validateArticle() and sameShape(); article pages use articleGraphs(); support the `affiliate` block with
   affiliateLinkProps() and a disclosure line when hasAffiliateLinks() (D-277).
4. Contact form phone check with toE164Thai(); sign-in return paths with safeReturnTo().
5. lint, typecheck, test, e2e green; commit; update RESUME.md.
```
