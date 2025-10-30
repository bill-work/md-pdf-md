/**
 * PDF to Markdown converter using Ollama + LLaVA vision model
 */

import { fromPath } from 'pdf2pic';
import { Ollama } from 'ollama';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PdfToMarkdownOptions {
  /** Input PDF file path */
  input: string;
  /** Output markdown file path */
  output?: string;
  /** Ollama model to use (llava, llama3.2-vision) */
  model?: string;
  /** Ollama host URL */
  ollamaHost?: string;
  /** Enable debug output */
  debug?: boolean;
  /** Image quality (DPI) */
  quality?: number;
}

export interface ConversionProgress {
  totalPages: number;
  currentPage: number;
  status: string;
}

/**
 * Convert PDF to Markdown using LLaVA vision model
 */
export async function convertPdfToMarkdown(
  options: PdfToMarkdownOptions,
  onProgress?: (progress: ConversionProgress) => void
): Promise<{ success: boolean; markdown: string; outputPath?: string; error?: string }> {
  try {
    // Validate input file
    await validatePdfFile(options.input);

    // Initialize Ollama client
    const ollama = new Ollama({
      host: options.ollamaHost || 'http://localhost:11434'
    });

    let model = options.model || 'llava';

    // Check if model is available - handle version tags
    try {
      await ollama.show({ model });
    } catch (error) {
      // Try with :latest or :7b tag if base name fails
      const modelVariations = [
        `${model}:latest`,
        `${model}:7b`,
        `${model}:13b`,
        model
      ];

      let found = false;
      for (const variant of modelVariations) {
        try {
          await ollama.show({ model: variant });
          model = variant; // Use the working variant
          found = true;
          break;
        } catch (e) {
          // Continue trying
        }
      }

      if (!found) {
        return {
          success: false,
          markdown: '',
          error: `Model '${options.model || 'llava'}' not found. Please run: ollama pull ${options.model || 'llava'}`
        };
      }
    }

    // Convert PDF pages to images
    if (options.debug) {
      console.log('Converting PDF pages to images...');
    }

    const converter = fromPath(options.input, {
      density: options.quality || 200, // DPI
      format: 'png',
      width: 2000,
      height: 2000 * 1.414, // A4 aspect ratio
      preserveAspectRatio: true
    });

    // Get all pages
    const pageImages = await converter.bulk(-1, { responseType: 'base64' });

    if (options.debug) {
      console.log(`Found ${pageImages.length} pages`);
    }

    // Process each page with LLaVA
    const markdownPages: string[] = [];

    for (let i = 0; i < pageImages.length; i++) {
      const pageNum = i + 1;

      if (onProgress) {
        onProgress({
          totalPages: pageImages.length,
          currentPage: pageNum,
          status: `Processing page ${pageNum}/${pageImages.length}...`
        });
      }

      if (options.debug) {
        console.log(`Processing page ${pageNum}/${pageImages.length}...`);
      }

      // Get base64 image data
      const imageBase64 = pageImages[i].base64;

      if (!imageBase64) {
        console.error(`No image data for page ${pageNum}`);
        markdownPages.push(`\n\n<!-- Error: No image data for page ${pageNum} -->\n\n`);
        continue;
      }

      // Create smart prompt for markdown extraction
      const prompt = createMarkdownExtractionPrompt(pageNum, pageImages.length);

      try {
        // Convert base64 to Uint8Array
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const imageUint8 = new Uint8Array(imageBuffer);

        const response = await ollama.generate({
          model,
          prompt,
          images: [imageUint8],
          stream: false,
          options: {
            temperature: 0.1, // Low temperature for more consistent output
            top_p: 0.9
          }
        });

        // Extract and clean markdown
        let pageMarkdown = response.response;
        pageMarkdown = cleanMarkdownOutput(pageMarkdown);

        markdownPages.push(pageMarkdown);

        if (options.debug) {
          console.log(`Page ${pageNum} processed successfully`);
        }
      } catch (error) {
        console.error(`Error processing page ${pageNum}:`, error);
        markdownPages.push(`\n\n<!-- Error processing page ${pageNum} -->\n\n`);
      }
    }

    // Combine all pages
    const markdown = combineMarkdownPages(markdownPages);

    // Determine output path
    const outputPath = options.output || getDefaultMarkdownPath(options.input);

    // Write to file
    await fs.writeFile(outputPath, markdown, 'utf-8');

    if (options.debug) {
      console.log(`Markdown saved to: ${outputPath}`);
    }

    return {
      success: true,
      markdown,
      outputPath
    };

  } catch (error) {
    return {
      success: false,
      markdown: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create optimized prompt for markdown extraction
 */
function createMarkdownExtractionPrompt(pageNum: number, totalPages: number): string {
  return `You are a document conversion expert. Convert this PDF page image to markdown format.

IMPORTANT RULES:
1. Preserve all structure: headings, paragraphs, lists, tables
2. Use proper markdown heading levels: # for H1, ## for H2, ### for H3, etc.
3. For code blocks: use \`\`\`language for syntax highlighting
4. For tables: use proper markdown table format with | separators
5. Preserve bullet points and numbered lists exactly
6. Keep all text content - don't summarize or omit anything
7. If you see images, describe them briefly in [Image: description] format
8. DO NOT add explanations or commentary
9. Output ONLY markdown - no preamble or postscript

STRUCTURE DETECTION:
- Identify if text is a heading (larger, bold) → use # heading syntax
- Identify code blocks (monospace font, colored syntax) → use \`\`\`language blocks
- Identify tables (grid structure) → use markdown tables
- Identify lists (bullets or numbers) → use proper list syntax

Page ${pageNum} of ${totalPages}.

Convert this page to markdown now:`;
}

/**
 * Clean and normalize markdown output
 */
function cleanMarkdownOutput(markdown: string): string {
  // Remove common AI artifacts
  let cleaned = markdown
    // Remove "Here is the markdown:" type phrases
    .replace(/^(here is|here's|this is|the|okay,?\s*)?the\s+markdown.*?:?\s*\n+/gi, '')
    // Remove markdown code blocks wrapping (```markdown ... ```)
    .replace(/^```markdown\s*\n/gi, '')
    .replace(/^```\s*\n/gi, '')
    .replace(/\n```\s*$/gi, '')
    // Normalize multiple blank lines to max 2
    .replace(/\n{4,}/g, '\n\n\n')
    // Trim start/end
    .trim();

  return cleaned;
}

/**
 * Combine markdown pages intelligently
 */
function combineMarkdownPages(pages: string[]): string {
  if (pages.length === 0) return '';
  if (pages.length === 1) return pages[0];

  // Join pages with page separators
  return pages
    .map((page, index) => {
      // Add page comment for debugging
      const pageMarker = `<!-- Page ${index + 1} -->\n\n`;
      return pageMarker + page;
    })
    .join('\n\n---\n\n');
}

/**
 * Get default markdown output path
 */
function getDefaultMarkdownPath(pdfPath: string): string {
  const parsed = path.parse(pdfPath);
  return path.join(parsed.dir, `${parsed.name}.md`);
}

/**
 * Validate PDF file
 */
async function validatePdfFile(filePath: string): Promise<void> {
  try {
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) {
      throw new Error(`Not a file: ${filePath}`);
    }

    if (!filePath.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a PDF');
    }

    // Check file size (max 50MB)
    if (stats.size > 50 * 1024 * 1024) {
      throw new Error('PDF file too large (max 50MB)');
    }

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`PDF file not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Check if Ollama is running and accessible
 */
export async function checkOllamaConnection(host?: string): Promise<boolean> {
  try {
    const ollama = new Ollama({ host: host || 'http://localhost:11434' });
    await ollama.list();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * List available vision models in Ollama
 */
export async function listVisionModels(host?: string): Promise<string[]> {
  try {
    const ollama = new Ollama({ host: host || 'http://localhost:11434' });
    const response = await ollama.list();

    // Filter for vision-capable models
    const visionModels = response.models
      .filter(m =>
        m.name.includes('llava') ||
        m.name.includes('vision') ||
        m.name.includes('bakllava')
      )
      .map(m => m.name);

    return visionModels;
  } catch (error) {
    return [];
  }
}
