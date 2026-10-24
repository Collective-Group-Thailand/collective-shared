import { breadcrumbSchema, faqSchema, type JsonLd, type LlmsSection } from '@collective/web-kit';

import type { AffiliateItem, Article } from './types';

/** Article JSON-LD with author, publisher and dates. */
export function articleJsonLd(
  article: Article,
  site: { name: string; origin: string; logo: string; url: string },
): JsonLd {
  const publisher = {
    '@type': 'Organization',
    name: site.name,
    url: site.origin,
    logo: { '@type': 'ImageObject', url: site.logo },
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    url: site.url,
    mainEntityOfPage: site.url,
    inLanguage: article.locale,
    articleSection: article.category,
    datePublished: article.published,
    dateModified: article.reviewed,
    author: article.author
      ? { '@type': 'Person', ...article.author }
      : { '@type': 'Organization', name: site.name, url: site.origin },
    publisher,
  };
}

/** Every graph an article page carries: Article, breadcrumb, FAQ (when it has one). */
export function articleGraphs(
  article: Article,
  site: { name: string; origin: string; logo: string; url: string },
  crumbs: { name: string; url?: string }[],
): JsonLd[] {
  return [
    articleJsonLd(article, site),
    breadcrumbSchema(crumbs),
    ...(article.faq.length ? [faqSchema(article.faq.map((f) => ({ question: f.q, answer: f.a })))] : []),
  ];
}

/** The `/llms.txt` section of a set of articles: each title linked, with its short answer. */
export function articlesLlmsSection(heading: string, articles: { article: Article; url: string }[]): LlmsSection {
  return {
    heading,
    qa: articles.map(({ article, url }) => ({ question: article.title, answer: article.answer, url })),
  };
}

/** Sitemap entry of an article (the product adds its own alternates). */
export function articleSitemapEntry(article: Article, url: string) {
  return { url, lastModified: article.reviewed, changeFrequency: 'monthly' as const, priority: 0.7 };
}

/**
 * Attributes of an affiliate link (D-277): `sponsored` and `nofollow` for search engines, a new tab, no referrer
 * leak beyond the origin. The page shows the disclosure next to it.
 */
export function affiliateLinkProps(item: AffiliateItem) {
  if (!/^https:\/\//.test(item.url)) throw new RangeError('affiliate links must be https');
  return { href: item.url, rel: 'sponsored nofollow noopener', target: '_blank', referrerPolicy: 'origin' as const };
}

/** Whether an article needs the affiliate disclosure (any affiliate block). */
export function hasAffiliateLinks(article: Article): boolean {
  return article.sections.some((section) => section.blocks.some((block) => 'affiliate' in block));
}

/** Reading time: Thai has no spaces, so count characters (≈ 500 per minute) and Latin words (≈ 220 per minute). */
export function estimateReadMinutes(article: Pick<Article, 'sections' | 'answer'>): number {
  const text = [article.answer, ...article.sections.flatMap((s) => [s.heading, ...s.blocks.map(blockText)])].join(' ');
  const thai = (text.match(/[฀-๿]/g) ?? []).length;
  const latinWords = (text.replace(/[฀-๿]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(thai / 500 + latinWords / 220));
}

function blockText(block: Article['sections'][number]['blocks'][number]): string {
  if ('p' in block) return block.p;
  if ('ul' in block) return block.ul.join(' ');
  if ('ol' in block) return block.ol.join(' ');
  if ('note' in block) return block.note;
  return `${block.affiliate.name} ${block.affiliate.why}`;
}
