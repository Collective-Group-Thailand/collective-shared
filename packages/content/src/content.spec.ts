import { affiliateLinkProps, articleGraphs, articlesLlmsSection, estimateReadMinutes, hasAffiliateLinks } from './seo';
import type { Article } from './types';
import { sameShape, validateArticle } from './validate';

const article: Article = {
  slug: 'tm30',
  locale: 'th',
  category: 'law',
  title: 'ตม.30 คืออะไร',
  summary: 'สรุปการแจ้งที่พักคนต่างด้าว',
  answer: 'แจ้งภายใน 24 ชั่วโมง',
  reviewed: '2026-10-24',
  published: '2026-10-24',
  readMinutes: 4,
  general: true,
  sections: [
    { id: 'what', heading: 'คืออะไร', blocks: [{ p: 'แบบแจ้งที่พัก' }] },
    {
      id: 'tools',
      heading: 'อุปกรณ์',
      blocks: [
        {
          affiliate: {
            name: 'Digital lock',
            url: 'https://s.shopee.co.th/x',
            merchant: 'Shopee',
            why: 'เปลี่ยนรหัสได้เมื่อผู้เช่าย้ายออก',
          },
        },
      ],
    },
  ],
  faq: [{ q: 'ใครแจ้ง', a: 'เจ้าบ้าน' }],
  sources: [{ label: 'ตม.', url: 'https://www.immigration.go.th/' }],
};
const site = {
  name: 'getproperty',
  origin: 'https://getproperty.co',
  logo: 'https://getproperty.co/logo.png',
  url: 'https://getproperty.co/guides/tm30',
};

describe('content (D-277)', () => {
  it('validates articles and reports problems', () => {
    expect(validateArticle(article).ok).toBe(true);
    const bad = validateArticle({ ...article, slug: 'Bad Slug', sources: [{ label: 'x', url: 'http://x' }] });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.problems.join()).toMatch(/slug|url/);
    expect(validateArticle({ ...article, reviewed: '2026-01-01' })).toEqual({
      ok: false,
      problems: ['reviewed: before published'],
    });
  });

  it('compares the shape of two locales', () => {
    expect(sameShape(article, { ...article, locale: 'en', title: 'TM30' })).toBe(true);
    expect(sameShape(article, { ...article, faq: [] })).toBe(false);
  });

  it('builds Article, breadcrumb and FAQ graphs and an llms section', () => {
    const graphs = articleGraphs(article, site, [
      { name: 'Home', url: 'https://getproperty.co/' },
      { name: article.title },
    ]);
    expect(graphs.map((g) => g['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
    expect(graphs[0]).toMatchObject({ dateModified: '2026-10-24', inLanguage: 'th' });
    expect(articlesLlmsSection('Guides', [{ article, url: site.url }]).qa?.[0]).toEqual({
      question: 'ตม.30 คืออะไร',
      answer: 'แจ้งภายใน 24 ชั่วโมง',
      url: site.url,
    });
  });

  it('marks affiliate links sponsored and detects the need for a disclosure', () => {
    expect(hasAffiliateLinks(article)).toBe(true);
    const block = article.sections[1]!.blocks[0]!;
    if (!('affiliate' in block)) throw new Error('expected affiliate');
    expect(affiliateLinkProps(block.affiliate).rel).toBe('sponsored nofollow noopener');
    expect(() => affiliateLinkProps({ ...block.affiliate, url: 'http://x' })).toThrow();
  });

  it('estimates reading time for Thai text', () => {
    expect(estimateReadMinutes({ answer: 'ก'.repeat(1000), sections: [] })).toBe(2);
  });
});
