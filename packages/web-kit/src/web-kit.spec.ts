import { breadcrumbSchema, faqSchema, serializeJsonLd, websiteSchema } from './json-ld';
import { renderLlmsTxt } from './llms';
import { formatThaiPhone, toE164Thai } from './phone';
import { safeReturnTo } from './return-to';
import { robotsAllowRules } from './robots';

describe('json-ld', () => {
  it('builds graphs and escapes </script>', () => {
    expect(breadcrumbSchema([{ name: 'Home', url: 'https://x.co/' }, { name: 'Guides' }])).toMatchObject({
      itemListElement: [
        { position: 1, item: 'https://x.co/' },
        { position: 2, name: 'Guides' },
      ],
    });
    expect(
      websiteSchema({ name: 'x', url: 'u', inLanguage: 'th', searchUrlTemplate: 'u?q={search_term_string}' }),
    ).toHaveProperty('potentialAction');
    const body = serializeJsonLd(faqSchema([{ question: 'a</script>', answer: 'b' }]));
    expect(body).not.toContain('</script>');
    expect(JSON.parse(body).mainEntity[0].name).toBe('a</script>');
  });
});

describe('llms.txt', () => {
  it('renders name, facts, links (nested) and Q&A', () => {
    const text = renderLlmsTxt({
      name: 'getproperty',
      summary: 'Free rental management',
      facts: ['Operator: Collective Group (Thailand)'],
      sections: [
        {
          heading: 'Pages',
          links: [
            { title: 'Tools', url: 'https://x/tools', children: [{ title: 'Receipt', url: 'https://x/tools/r' }] },
          ],
          qa: [{ question: 'Is it free?', answer: 'Yes.', url: 'https://x/pricing' }],
        },
      ],
    });
    expect(text.startsWith('# getproperty\n\n> Free rental management\n\nKey facts:')).toBe(true);
    expect(text).toContain('  - [Receipt](https://x/tools/r)');
    expect(text).toContain('### [Is it free?](https://x/pricing)\n\nYes.');
  });
});

describe('robots', () => {
  it('allows every page and family in each locale', () => {
    expect(
      robotsAllowRules({
        pages: ['/', '/pricing'],
        families: ['/rent'],
        localePrefixes: ['/en'],
        extra: ['/llms.txt$'],
      }),
    ).toEqual(['/$', '/pricing$', '/rent/', '/en$', '/en/pricing$', '/en/rent/', '/llms.txt$']);
  });
});

describe('safeReturnTo', () => {
  it.each([
    ['/dashboard?x=1', '/dashboard?x=1'],
    ['//evil.example', '/'],
    ['https://evil.example', '/'],
    ['/\\evil', '/'],
    ['/%2F%2Fevil', '/'],
    ['/javascript:alert(1)', '/'],
    [null, '/'],
  ])('%s → %s', (input, expected) => expect(safeReturnTo(input)).toBe(expected));
});

describe('Thai phone numbers', () => {
  it.each([
    ['081-234-5678', '+66812345678'],
    ['+66 81 234 5678', '+66812345678'],
    ['66812345678', '+66812345678'],
    ['02-123-4567', '+6621234567'],
    ['12345', null],
    ['0112345678', null],
  ])('%s → %s', (input, expected) => expect(toE164Thai(input)).toBe(expected));
  it('formats for display', () => {
    expect(formatThaiPhone('+66812345678')).toBe('081-234-5678');
    expect(formatThaiPhone('+6621234567')).toBe('02-123-4567');
  });
});
