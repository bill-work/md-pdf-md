/**
 * Professional CSS themes for PDF generation
 */

export interface Theme {
  name: string;
  css: string;
}

/**
 * Base CSS with advanced page break handling and print optimization
 */
const baseStyles = `
  /* CSS Paged Media - Professional print optimization */
  @page {
    /* Don't override Puppeteer margins - let them work naturally */
  }

  /* Reset and base styles */
  * {
    box-sizing: border-box;
  }

  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #24292e;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  /* Content area with proper padding to respect margins */
  .content {
    width: 100%;
    max-width: 100%;
    padding: 0;
  }

  /* Advanced orphan and widow control */
  * {
    orphans: 3;
    widows: 3;
  }

  p, li {
    orphans: 2;
    widows: 2;
  }

  /* Enhanced page break controls */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid-page;
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-before: auto;
  }

  /* Keep headings with at least some following content */
  h1::after, h2::after, h3::after {
    content: "";
    display: block;
    height: 100px;
    margin-bottom: -100px;
  }

  /* Code blocks - advanced handling */
  pre {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-before: auto;
    page-break-after: auto;
  }

  /* Tables - smart breaking */
  table {
    page-break-inside: auto;
    break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tbody {
    display: table-row-group;
  }

  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Blockquotes */
  blockquote {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Images */
  img {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-before: auto;
    page-break-after: auto;
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Lists */
  li {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  ul, ol {
    page-break-before: avoid;
  }

  /* Typography with perfect vertical rhythm */
  h1 {
    font-size: 2.5em;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 0.8em 0;
    padding-bottom: 0.3em;
    border-bottom: 2px solid #eaecef;
    page-break-before: always;
  }

  h1:first-child,
  .cover-page + h1,
  .toc + h1 {
    page-break-before: avoid;
    margin-top: 0;
  }

  h2 {
    font-size: 2em;
    font-weight: 600;
    line-height: 1.3;
    margin: 2em 0 0.6em 0;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.4;
    margin: 1.5em 0 0.5em 0;
  }

  h4 {
    font-size: 1.25em;
    font-weight: 600;
    line-height: 1.4;
    margin: 1.2em 0 0.4em 0;
  }

  h5, h6 {
    font-size: 1em;
    font-weight: 600;
    line-height: 1.5;
    margin: 1em 0 0.4em 0;
  }

  p {
    margin: 0 0 1em 0;
  }

  p + p {
    margin-top: 0;
  }

  /* Links */
  a {
    color: #0366d6;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  /* Lists */
  ul, ol {
    margin-top: 0;
    margin-bottom: 1em;
    padding-left: 2em;
  }

  li {
    margin-bottom: 0.25em;
  }

  li > p {
    margin-bottom: 0.5em;
  }

  /* Code - Advanced handling */
  code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
    padding: 0.2em 0.4em;
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    word-wrap: break-word;
  }

  pre {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.85em;
    line-height: 1.5;
    background-color: #f6f8fa;
    border-radius: 6px;
    padding: 16px;
    margin: 1.5em 0;

    /* Prevent overflow and breaking issues */
    max-width: 100%;
    overflow-x: auto;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;

    /* Visual improvements */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e1e4e8;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 1em;
    line-height: 1.5;
    tab-size: 2;
    -moz-tab-size: 2;
  }

  /* Blockquotes */
  blockquote {
    margin: 0 0 1em 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 4px solid #dfe2e5;
  }

  blockquote > :first-child {
    margin-top: 0;
  }

  blockquote > :last-child {
    margin-bottom: 0;
  }

  /* Tables - Advanced handling */
  table {
    border-collapse: collapse;
    table-layout: auto;
    width: 100%;
    margin: 1.5em 0;
    overflow: visible;
  }

  table th,
  table td {
    padding: 10px 12px;
    border: 1px solid #dfe2e5;
    text-align: left;
    vertical-align: top;

    /* Prevent cell content overflow */
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }

  table th {
    background-color: #f6f8fa;
    font-weight: 600;
  }

  table tr:nth-child(even) {
    background-color: #f6f8fa;
  }

  /* Prevent breaking within table rows */
  table tbody tr {
    page-break-inside: avoid;
  }

  /* Horizontal rule */
  hr {
    height: 2px;
    padding: 0;
    margin: 1.5em 0;
    background-color: #e1e4e8;
    border: 0;
  }

  /* Cover page */
  .cover-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    text-align: center;
    page-break-after: always;
  }

  .cover-title {
    font-size: 3.5em;
    font-weight: 700;
    margin-bottom: 0.5em;
    color: #24292e;
  }

  .cover-subtitle {
    font-size: 1.5em;
    color: #586069;
    margin-bottom: 2em;
  }

  .cover-meta {
    font-size: 1.1em;
    color: #6a737d;
  }

  .cover-meta p {
    margin: 0.3em 0;
  }

  /* Table of Contents */
  .toc {
    page-break-after: always;
    margin-bottom: 2em;
  }

  .toc-title {
    font-size: 2.5em;
    font-weight: 700;
    margin-bottom: 1em;
    padding-bottom: 0.3em;
    border-bottom: 2px solid #eaecef;
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .toc-item {
    margin-bottom: 0.5em;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .toc-item a {
    color: #24292e;
    text-decoration: none;
    flex: 1;
  }

  .toc-item a:hover {
    color: #0366d6;
  }

  .toc-item-page {
    color: #6a737d;
    margin-left: 1em;
    font-size: 0.9em;
  }

  .toc-level-1 {
    font-weight: 600;
    font-size: 1.1em;
    margin-top: 1em;
  }

  .toc-level-2 {
    padding-left: 1.5em;
  }

  .toc-level-3 {
    padding-left: 3em;
    font-size: 0.95em;
  }

  /* Task lists */
  .task-list-item {
    list-style-type: none;
  }

  .task-list-item input {
    margin-right: 0.5em;
  }
`;

/**
 * GitHub theme (light, clean, professional)
 */
const githubTheme: Theme = {
  name: 'github',
  css: baseStyles
};

/**
 * GitHub Dark theme
 */
const githubDarkTheme: Theme = {
  name: 'github-dark',
  css: baseStyles + `
    body {
      background-color: #0d1117;
      color: #c9d1d9;
    }

    h1, h2 {
      border-bottom-color: #21262d;
      color: #c9d1d9;
    }

    a {
      color: #58a6ff;
    }

    code {
      background-color: rgba(110, 118, 129, 0.4);
      color: #c9d1d9;
    }

    pre {
      background-color: #161b22;
    }

    blockquote {
      color: #8b949e;
      border-left-color: #3b434b;
    }

    table th,
    table td {
      border-color: #30363d;
    }

    table th {
      background-color: #161b22;
    }

    table tr:nth-child(even) {
      background-color: #0d1117;
    }

    hr {
      background-color: #21262d;
    }

    .cover-title {
      color: #c9d1d9;
    }

    .cover-subtitle {
      color: #8b949e;
    }

    .cover-meta {
      color: #8b949e;
    }

    .toc-title {
      border-bottom-color: #21262d;
      color: #c9d1d9;
    }

    .toc-item a {
      color: #c9d1d9;
    }

    .toc-item a:hover {
      color: #58a6ff;
    }

    .toc-item-page {
      color: #8b949e;
    }
  `
};

/**
 * Academic theme (formal, serif font)
 */
const academicTheme: Theme = {
  name: 'academic',
  css: baseStyles + `
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    }

    h1 {
      text-align: center;
      border-bottom: none;
    }

    .cover-page {
      border: 3px double #24292e;
      padding: 2em;
    }
  `
};

/**
 * Minimal theme (clean and simple)
 */
const minimalTheme: Theme = {
  name: 'minimal',
  css: baseStyles + `
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
    }

    h1, h2 {
      border-bottom: none;
    }

    h1 {
      font-size: 2em;
    }

    h2 {
      font-size: 1.5em;
    }

    h3 {
      font-size: 1.2em;
    }
  `
};

/**
 * Get theme by name
 */
export function getTheme(themeName: string = 'github'): Theme {
  const themes: Record<string, Theme> = {
    'github': githubTheme,
    'github-dark': githubDarkTheme,
    'academic': academicTheme,
    'minimal': minimalTheme
  };

  return themes[themeName] || githubTheme;
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): string[] {
  return ['github', 'github-dark', 'academic', 'minimal'];
}
