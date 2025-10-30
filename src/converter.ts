/**
 * Main converter orchestration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PdfOptions, ConversionResult } from './types.js';
import { parseMarkdown, validateMarkdown } from './parser.js';
import { processCodeBlocks } from './highlighter.js';
import { generateHtml } from './template.js';
import { generatePdf, closeBrowser } from './pdf-generator.js';
import { addMetadata, getPdfStats } from './pdf-postprocess.js';

/**
 * Convert markdown file to PDF
 */
export async function convertMarkdownToPdf(options: PdfOptions): Promise<ConversionResult> {
  const startTime = Date.now();

  try {
    // Validate input file exists
    await validateInputFile(options.input);

    // Read markdown file
    const markdownContent = await fs.readFile(options.input, 'utf-8');

    // Validate markdown content
    const validation = validateMarkdown(markdownContent);
    if (!validation.valid) {
      return {
        success: false,
        outputPath: '',
        error: validation.error
      };
    }

    // Parse markdown
    const parsed = await parseMarkdown(markdownContent);

    // Process code blocks with syntax highlighting
    const highlightTheme = mapThemeToHighlightTheme(options.theme);
    const highlightedHtml = await processCodeBlocks(parsed.html, highlightTheme);

    // Update parsed HTML
    parsed.html = highlightedHtml;

    // Generate complete HTML
    let customCss = '';
    if (options.css) {
      try {
        customCss = await fs.readFile(options.css, 'utf-8');
      } catch (error) {
        console.warn(`Warning: Could not read custom CSS file: ${options.css}`);
      }
    }

    const html = generateHtml(parsed, { ...options, css: customCss });

    // Determine output path
    const outputPath = options.output || getDefaultOutputPath(options.input);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Generate PDF
    await generatePdf(html, outputPath, options, parsed.frontMatter.title);

    // Add metadata
    await addMetadata(outputPath, {
      title: parsed.frontMatter.title,
      author: parsed.frontMatter.author,
      subject: parsed.frontMatter.subtitle,
      keywords: parsed.frontMatter.keywords
    });

    // Get PDF stats
    const stats = await getPdfStats(outputPath);

    const duration = Date.now() - startTime;

    return {
      success: true,
      outputPath,
      stats: {
        pages: stats.pages,
        size: stats.size,
        duration
      }
    };

  } catch (error) {
    return {
      success: false,
      outputPath: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Validate input file
 */
async function validateInputFile(inputPath: string): Promise<void> {
  try {
    const stats = await fs.stat(inputPath);

    if (!stats.isFile()) {
      throw new Error(`Input path is not a file: ${inputPath}`);
    }

    if (!inputPath.endsWith('.md') && !inputPath.endsWith('.markdown')) {
      console.warn('Warning: Input file does not have .md or .markdown extension');
    }

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    throw error;
  }
}

/**
 * Get default output path
 */
function getDefaultOutputPath(inputPath: string): string {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}.pdf`);
}

/**
 * Map theme name to highlight theme
 */
function mapThemeToHighlightTheme(theme?: string): any {
  const themeMap: Record<string, string> = {
    'github': 'github-light',
    'github-dark': 'github-dark',
    'academic': 'github-light',
    'minimal': 'github-light'
  };

  return themeMap[theme || 'github'] || 'github-dark';
}

/**
 * Clean up resources
 */
export async function cleanup(): Promise<void> {
  await closeBrowser();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
