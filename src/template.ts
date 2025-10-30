/**
 * HTML template generation with TOC and page numbers
 */

import { ParsedMarkdown, PdfOptions, TocItem } from './types.js';
import { getTheme } from './themes.js';

/**
 * Generate complete HTML document
 */
export function generateHtml(
  parsed: ParsedMarkdown,
  options: PdfOptions
): string {
  const theme = getTheme(options.theme);
  const { frontMatter, html, toc } = parsed;

  const coverPage = generateCoverPage(frontMatter);
  const tocHtml = options.toc ? generateToc(toc) : '';

  // Wrap content in smart sections for better page breaks
  const wrappedContent = wrapContentSections(html);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(frontMatter.title || 'Document')}</title>
  <style>
    ${theme.css}
    ${getAdditionalStyles()}
    ${options.css ? `/* Custom CSS */\n${options.css}` : ''}
  </style>
</head>
<body>
  ${coverPage}
  ${tocHtml}
  <div class="content">
    ${wrappedContent}
  </div>
</body>
</html>`;
}

/**
 * Wrap content sections for better page break handling
 * Groups h2 sections together to keep related content on same pages
 */
function wrapContentSections(html: string): string {
  // Wrap each h2 section (heading + following content until next h2 or end)
  // This helps keep related content together
  const wrapped = html.replace(
    /(<h2[^>]*>.*?<\/h2>)((?:(?!<h2)[\s\S])*)/g,
    '<div class="section">$1$2</div>'
  );

  // Also wrap any content before the first h2
  const firstH2Index = wrapped.indexOf('<h2');
  if (firstH2Index > 0) {
    const beforeFirstH2 = wrapped.substring(0, firstH2Index);
    const afterFirstH2 = wrapped.substring(firstH2Index);
    if (beforeFirstH2.trim()) {
      return `<div class="section">${beforeFirstH2}</div>${afterFirstH2}`;
    }
  }

  return wrapped;
}

/**
 * Additional styles for smart content wrapping
 */
function getAdditionalStyles(): string {
  return `
    /* Section wrapper for better page breaks */
    .section {
      page-break-inside: auto;
      break-inside: auto;
    }

    /* Ensure all major containers respect margins */
    .content,
    .cover-page,
    .toc {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
  `;
}

/**
 * Generate cover page from frontmatter
 */
function generateCoverPage(frontMatter: any): string {
  if (!frontMatter.title && !frontMatter.author && !frontMatter.date) {
    return '';
  }

  const title = frontMatter.title ? `<h1 class="cover-title">${escapeHtml(frontMatter.title)}</h1>` : '';
  const subtitle = frontMatter.subtitle ? `<p class="cover-subtitle">${escapeHtml(frontMatter.subtitle)}</p>` : '';

  const metaParts: string[] = [];
  if (frontMatter.author) {
    metaParts.push(`<p><strong>Author:</strong> ${escapeHtml(frontMatter.author)}</p>`);
  }
  if (frontMatter.date) {
    const date = typeof frontMatter.date === 'string' ? frontMatter.date : new Date(frontMatter.date).toLocaleDateString();
    metaParts.push(`<p><strong>Date:</strong> ${escapeHtml(date)}</p>`);
  }

  const meta = metaParts.length > 0 ? `<div class="cover-meta">${metaParts.join('\n')}</div>` : '';

  return `<div class="cover-page">
  ${title}
  ${subtitle}
  ${meta}
</div>`;
}

/**
 * Generate table of contents
 */
function generateToc(toc: TocItem[]): string {
  if (toc.length === 0) {
    return '';
  }

  const tocItems = toc.map(item => {
    return `<li class="toc-item toc-level-${item.level}">
  <a href="#${item.id}">${escapeHtml(item.title)}</a>
  <span class="toc-item-page"></span>
</li>`;
  }).join('\n');

  return `<div class="toc">
  <h1 class="toc-title">Table of Contents</h1>
  <ul class="toc-list">
    ${tocItems}
  </ul>
</div>`;
}

/**
 * Generate header template for PDF
 */
export function getHeaderTemplate(options: PdfOptions): string {
  if (!options.pageNumbers) {
    return '<span></span>';
  }

  return `
    <div style="font-size: 9px; text-align: right; width: 100%; padding: 10mm 25mm 0 25mm;">
      <span class="pageNumber"></span>
    </div>
  `;
}

/**
 * Generate footer template for PDF
 */
export function getFooterTemplate(options: PdfOptions, title?: string): string {
  if (!options.pageNumbers) {
    return '<span></span>';
  }

  const docTitle = title || '';

  return `
    <div style="font-size: 9px; width: 100%; padding: 0 25mm 10mm 25mm; display: flex; justify-content: space-between; box-sizing: border-box;">
      <span style="flex: 1;">${escapeHtml(docTitle)}</span>
      <span style="margin-left: auto;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
