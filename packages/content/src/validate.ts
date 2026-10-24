import { z } from 'zod';

import type { Article } from './types';

const https = z.string().regex(/^https:\/\//, 'must be an https URL');
const block = z.union([
  z.object({ p: z.string().min(1) }).strict(),
  z.object({ ul: z.array(z.string().min(1)).min(1) }).strict(),
  z.object({ ol: z.array(z.string().min(1)).min(1) }).strict(),
  z.object({ note: z.string().min(1), tone: z.enum(['info', 'warning', 'product']).optional() }).strict(),
  z
    .object({
      affiliate: z
        .object({
          name: z.string().min(1),
          url: https,
          merchant: z.string().min(1),
          why: z.string().min(1),
          imageUrl: https.optional(),
        })
        .strict(),
    })
    .strict(),
]);

export const articleSchemaZ = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
    locale: z.string().regex(/^[a-z]{2}$/),
    category: z.string().regex(/^[a-z0-9-]{1,40}$/),
    title: z.string().min(1).max(120),
    summary: z.string().min(1).max(200),
    answer: z.string().min(1).max(600),
    reviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    readMinutes: z.number().int().min(1).max(60),
    general: z.boolean(),
    sections: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]{1,40}$/),
          heading: z.string().min(1),
          blocks: z.array(block).min(1),
        }),
      )
      .min(1),
    faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })),
    sources: z.array(z.object({ label: z.string().min(1), url: https })),
    author: z.object({ name: z.string().min(1), url: https.optional() }).optional(),
  })
  .strict();

/** Validates one article (CMS write, content file test); returns the problems as readable lines. */
export function validateArticle(input: unknown): { ok: true; article: Article } | { ok: false; problems: string[] } {
  const parsed = articleSchemaZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, problems: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) };
  }
  const article = parsed.data as Article;
  const ids = article.sections.map((s) => s.id);
  if (new Set(ids).size !== ids.length) return { ok: false, problems: ['sections: duplicate id'] };
  if (article.reviewed < article.published) return { ok: false, problems: ['reviewed: before published'] };
  return { ok: true, article };
}

/** Two locales of one article must have the same slug, section ids and FAQ count. */
export function sameShape(a: Article, b: Article): boolean {
  return (
    a.slug === b.slug &&
    a.category === b.category &&
    a.general === b.general &&
    a.faq.length === b.faq.length &&
    a.sections.map((s) => s.id).join() === b.sections.map((s) => s.id).join()
  );
}
