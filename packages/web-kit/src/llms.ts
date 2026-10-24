/**
 * `/llms.txt` (llmstxt.org) builder: a markdown statement of what a product is, for answer engines (GEO/AEO). The
 * product supplies only text it already publishes on its pages, so the file never claims more than the site.
 */
export interface LlmsLink {
  title: string;
  url: string;
  description?: string;
  children?: LlmsLink[];
}

export interface LlmsSection {
  heading: string;
  summary?: string;
  links?: LlmsLink[];
  /** Question and answer pairs, rendered as `### question` + answer. */
  qa?: { question: string; answer: string; url?: string }[];
}

export interface LlmsDocument {
  name: string;
  summary: string;
  facts?: string[];
  sections: LlmsSection[];
}

function linkLines(links: LlmsLink[], depth = 0): string[] {
  return links.flatMap((link) => [
    `${'  '.repeat(depth)}- [${link.title}](${link.url})${link.description ? `: ${link.description}` : ''}`,
    ...linkLines(link.children ?? [], depth + 1),
  ]);
}

export function renderLlmsTxt(doc: LlmsDocument): string {
  const blocks: string[] = [`# ${doc.name}`, `> ${doc.summary}`];
  if (doc.facts?.length) blocks.push(['Key facts:', ...doc.facts.map((fact) => `- ${fact}`)].join('\n'));
  for (const section of doc.sections) {
    const parts = [`## ${section.heading}`];
    if (section.summary) parts.push(`> ${section.summary}`);
    if (section.links?.length) parts.push(linkLines(section.links).join('\n'));
    for (const qa of section.qa ?? []) {
      parts.push(`### ${qa.url ? `[${qa.question}](${qa.url})` : qa.question}\n\n${qa.answer}`);
    }
    blocks.push(parts.join('\n\n'));
  }
  return `${blocks.join('\n\n')}\n`;
}
