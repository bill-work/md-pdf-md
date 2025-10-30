/**
 * md-pdf-md - Programmatic API
 *
 * Bidirectional Markdown-PDF converter with AI-powered vision.
 * Convert MD→PDF with beautiful themes, PDF→MD with LLaVA vision model.
 *
 * @example
 * ```typescript
 * import { convertMarkdownToPdf, convertPdfToMarkdown } from 'md-pdf-md';
 *
 * // Markdown to PDF
 * const pdfResult = await convertMarkdownToPdf({
 *   input: 'README.md',
 *   output: 'README.pdf',
 *   theme: 'github-dark',
 *   toc: true,
 *   pageNumbers: true
 * });
 *
 * // PDF to Markdown (requires Ollama + LLaVA)
 * const mdResult = await convertPdfToMarkdown({
 *   input: 'document.pdf',
 *   output: 'document.md',
 *   model: 'llava'
 * });
 * ```
 */

import { convertMarkdownToPdf as convert } from './converter.js';

// Markdown to PDF exports
export { convertMarkdownToPdf, cleanup, formatFileSize, formatDuration } from './converter.js';
export { parseMarkdown, validateMarkdown } from './parser.js';
export { getTheme, getAvailableThemes } from './themes.js';
export {
  PdfOptions,
  ConversionResult,
  FrontMatter,
  TocItem,
  ParsedMarkdown,
  PageDimensions,
  PAGE_FORMATS
} from './types.js';

// PDF to Markdown exports
export {
  convertPdfToMarkdown,
  checkOllamaConnection,
  listVisionModels,
  PdfToMarkdownOptions
} from './pdf-to-markdown.js';

// Re-export for convenience
export default convert;
