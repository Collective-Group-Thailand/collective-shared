---
'@collective/integrations': patch
'@collective/web-kit': patch
'@collective/content': patch
'@collective/documents': patch
---

Adoption fixes from getproperty (2026-10-25): builds use code splitting, so every subpath shares one copy of the
logger hook, the circuit breakers and the error classes (`instanceof ProviderError` holds across subpaths);
`safeReturnTo()` takes getproperty-web's stricter open-redirect guard (review H3: control characters, whitespace and
backslashes raw or encoded, protocol-relative after decoding, normalised result); `pnpm typecheck` and `pnpm test`
build `@collective/web-kit` first (content depends on its types).
