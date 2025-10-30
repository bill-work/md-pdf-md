/**
 * Markdown parser with frontmatter and TOC extraction
 */

import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import matter from 'gray-matter';
import { ParsedMarkdown, TocItem, FrontMatter } from './types.js';

// Configure marked for GitHub Flavored Markdown
marked.use(gfmHeadingId());
marked.use({
  gfm: true,
  breaks: true
});

/**
 * Parse markdown content with frontmatter and extract TOC
 */
export async function parseMarkdown(content: string): Promise<ParsedMarkdown> {
  // Parse frontmatter
  const { data: frontMatter, content: markdownContent } = matter(content);

  // Extract TOC items by walking the tokens
  const toc: TocItem[] = [];

  // Custom renderer to capture headings
  const renderer = new marked.Renderer();
  const originalHeading = renderer.heading.bind(renderer);

  renderer.heading = function(text, level, raw) {
    const id = generateId(raw);

    // Add to TOC (only h1, h2, h3)
    if (level <= 3) {
      toc.push({
        id,
        title: raw,
        level,
      });
    }

    // Return the heading with proper ID
    return originalHeading(text, level, raw);
  };

  marked.use({ renderer });

  // Convert markdown to HTML
  const html = await marked.parse(markdownContent);

  return {
    content: markdownContent,
    frontMatter: frontMatter as FrontMatter,
    toc,
    html
  };
}

/**
 * Generate ID from heading text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Validate markdown file content
 */
export function validateMarkdown(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Markdown content is empty' };
  }

  // Check for common markdown issues
  if (content.length > 10 * 1024 * 1024) {
    return { valid: false, error: 'Markdown file is too large (max 10MB)' };
  }

  return { valid: true };
}
