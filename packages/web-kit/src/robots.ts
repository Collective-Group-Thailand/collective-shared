/**
 * Robots allow rules generated from a product's list of public paths, in every locale prefix, so a new public page can
 * never be forgotten in robots.txt. Exact pages end with `$`; slug families (`/rent/`, `/guides/`) end with `/`.
 */
export function robotsAllowRules(input: {
  pages: readonly string[];
  families?: readonly string[];
  /** Locale prefixes besides the default one, e.g. ["/en"]. */
  localePrefixes?: readonly string[];
  extra?: readonly string[];
}): string[] {
  const base = [
    ...input.pages.map((path) => (path === '/' ? '/$' : `${path.replace(/\/+$/, '')}$`)),
    ...(input.families ?? []).map((family) => `${family.replace(/\/+$/, '')}/`),
  ];
  const prefixed = (input.localePrefixes ?? []).flatMap((prefix) =>
    base.map((rule) => (rule === '/$' ? `${prefix}$` : `${prefix}${rule}`)),
  );
  return [...new Set([...base, ...prefixed, ...(input.extra ?? [])])];
}
