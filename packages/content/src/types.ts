/*
 * Article model shared by Collective products (D-277): the shape getproperty's guides started with, generalised.
 * Content stays per brand and per domain; the engine is shared.
 */
export type ArticleBlock =
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  /** An aside: an example, a warning, or how the product helps. */
  | { note: string; tone?: 'info' | 'warning' | 'product' }
  /** An affiliate product (D-277): rendered with the disclosure and `rel="sponsored nofollow"`. */
  | { affiliate: AffiliateItem };

export interface AffiliateItem {
  name: string;
  /** The programme link (Shopee, Lazada…), https only. */
  url: string;
  merchant: string;
  /** Why it is relevant to the article — never "best seller" or commission-driven wording. */
  why: string;
  imageUrl?: string;
}

export interface ArticleSection {
  /** Anchor id, stable across locales. */
  id: string;
  heading: string;
  blocks: ArticleBlock[];
}

export interface Article {
  slug: string;
  locale: string;
  category: string;
  title: string;
  /** Meta description and card text. */
  summary: string;
  /** The short answer first (AEO). */
  answer: string;
  /** ISO date the facts were last checked. */
  reviewed: string;
  published: string;
  readMinutes: number;
  /** Legal, tax or medical content: show the "general information, not advice" notice. */
  general: boolean;
  sections: ArticleSection[];
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
  /** Author shown on the page and in JSON-LD; the organisation when omitted. */
  author?: { name: string; url?: string };
}
