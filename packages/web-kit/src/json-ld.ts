/** schema.org JSON-LD builders for public pages (SEO/GEO/AEO). Plain data; each product renders its own <script>. */
export type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';

export function organizationSchema(input: {
  name: string;
  url: string;
  logo: string;
  description: string;
  legalName?: string;
  sameAs?: string[];
}): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    logo: input.logo,
    description: input.description,
    ...(input.legalName ? { legalName: input.legalName } : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}

/** WebSite with a SearchAction; `searchUrlTemplate` contains `{search_term_string}`. */
export function websiteSchema(input: {
  name: string;
  url: string;
  inLanguage: string;
  searchUrlTemplate?: string;
}): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
    inLanguage: input.inLanguage,
    ...(input.searchUrlTemplate
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: input.searchUrlTemplate },
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  };
}

export function softwareApplicationSchema(input: {
  name: string;
  url: string;
  description: string;
  category: string;
  price?: string;
  priceCurrency?: string;
}): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    name: input.name,
    url: input.url,
    description: input.description,
    applicationCategory: input.category,
    operatingSystem: 'Web, iOS, Android',
    offers: { '@type': 'Offer', price: input.price ?? '0', priceCurrency: input.priceCurrency ?? 'THB' },
  };
}

export function faqSchema(items: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** The last crumb usually has no URL (the current page). */
export function breadcrumbSchema(crumbs: { name: string; url?: string }[]): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  };
}

export function itemListSchema(urls: string[]): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    itemListElement: urls.map((url, index) => ({ '@type': 'ListItem', position: index + 1, url })),
  };
}

/** AboutPage, ContactPage, CollectionPage, WebPage… */
export function webPageSchema(
  type: string,
  input: { url: string; name: string; description: string; inLanguage: string },
): JsonLd {
  return { '@context': CONTEXT, '@type': type, ...input };
}

/** The body of one `<script type="application/ld+json">`: one graph or an array, `<` escaped against `</script>`. */
export function serializeJsonLd(...graphs: JsonLd[]): string {
  return JSON.stringify(graphs.length === 1 ? graphs[0] : graphs).replace(/</g, '\\u003c');
}
