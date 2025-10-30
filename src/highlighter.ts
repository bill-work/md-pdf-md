/**
 * Syntax highlighting using Shiki (VS Code quality)
 */

import { getHighlighter, Highlighter, BundledLanguage, BundledTheme } from 'shiki';

let highlighterInstance: Highlighter | null = null;

/**
 * Initialize Shiki highlighter (cached)
 */
export async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await getHighlighter({
      themes: ['github-dark', 'github-light', 'dracula', 'nord', 'monokai'],
      langs: [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'python',
        'java',
        'go',
        'rust',
        'c',
        'cpp',
        'csharp',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'scala',
        'bash',
        'shell',
        'json',
        'yaml',
        'xml',
        'html',
        'css',
        'scss',
        'sql',
        'dockerfile',
        'markdown',
        'graphql',
        'regex'
      ]
    });
  }
  return highlighterInstance;
}

/**
 * Highlight code block with language detection
 */
export async function highlightCode(
  code: string,
  lang: string,
  theme: BundledTheme = 'github-dark'
): Promise<string> {
  const highlighter = await getHighlighterInstance();

  // Normalize language name
  const normalizedLang = normalizeLang(lang);

  try {
    return highlighter.codeToHtml(code, {
      lang: normalizedLang as BundledLanguage,
      theme
    });
  } catch (error) {
    // Fallback to plaintext if language not supported
    return highlighter.codeToHtml(code, {
      lang: 'text',
      theme
    });
  }
}

/**
 * Process HTML to highlight all code blocks
 */
export async function processCodeBlocks(
  html: string,
  theme: BundledTheme = 'github-dark'
): Promise<string> {
  // Match code blocks: <pre><code class="language-xxx">...</code></pre>
  const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;

  let result = html;
  const matches = [...html.matchAll(codeBlockRegex)];

  for (const match of matches) {
    const [fullMatch, lang, code] = match;
    // Decode HTML entities
    const decodedCode = decodeHtml(code);

    const highlighted = await highlightCode(decodedCode, lang, theme);

    // Replace with highlighted version
    result = result.replace(fullMatch, highlighted);
  }

  // Also handle code blocks without language specification
  const plainCodeRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
  const plainMatches = [...result.matchAll(plainCodeRegex)];

  for (const match of plainMatches) {
    const [fullMatch, code] = match;
    const decodedCode = decodeHtml(code);

    const highlighted = await highlightCode(decodedCode, 'text', theme);
    result = result.replace(fullMatch, highlighted);
  }

  return result;
}

/**
 * Normalize language identifiers
 */
function normalizeLang(lang: string): string {
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'rs': 'rust',
    'cs': 'csharp',
    'c++': 'cpp',
    'dockerfile': 'dockerfile'
  };

  return langMap[lang.toLowerCase()] || lang.toLowerCase();
}

/**
 * Decode HTML entities
 */
function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
