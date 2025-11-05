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
        if (options.debug) {
          console.log(`Converting image data for page ${pageNum}...`);
        }

        // Convert base64 to Uint8Array
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const imageUint8 = new Uint8Array(imageBuffer);

        if (options.debug) {
          console.log(`Calling Ollama API for page ${pageNum}...`);
        }

        // Use streaming for better responsiveness and progress feedback
        const stream = await ollama.generate({
          model,
          prompt,
          images: [imageUint8],
          stream: true,
          options: {
            temperature: 0.0, // Zero temperature for deterministic, exact extraction
            top_p: 0.9
          }
        });

        // Collect the streamed response
        let fullResponse = '';
        let lastProgressUpdate = Date.now();

        for await (const chunk of stream) {
          fullResponse += chunk.response;

          // Update progress every 2 seconds to show the API is responding
          const now = Date.now();
          if (options.debug && (now - lastProgressUpdate) > 2000) {
            console.log(`  ...still processing page ${pageNum} (${fullResponse.length} chars received)...`);
            lastProgressUpdate = now;
          }
        }

        if (options.debug) {
          console.log(`Received complete response from Ollama for page ${pageNum}`);
        }

        // Extract and clean markdown
        let pageMarkdown = fullResponse;
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
  return `You are a precise document transcription tool. Your ONLY job is to extract and transcribe the EXACT text visible on this PDF page image into markdown format.

CRITICAL RULES - READ CAREFULLY:
1. EXTRACT ONLY what you can SEE - do NOT add, infer, interpret, or elaborate on anything
2. COPY text VERBATIM - do NOT paraphrase, summarize, or rewrite
3. DO NOT add ANY explanations, commentary, context, or extra information
4. DO NOT add research, definitions, or background information
5. DO NOT describe what the document is about
6. DO NOT add introductory or concluding statements
7. If there are images/diagrams, just note [Image] - do NOT describe or explain them
8. Output ONLY the markdown - no preamble, no postscript, no meta-commentary

FORMATTING RULES:
- Preserve headings: use # for large/bold headings, ## for subheadings, etc.
- Preserve lists: use - for bullets, 1. 2. 3. for numbered lists
- Preserve tables: use markdown table format with | separators
- Preserve code blocks: use \`\`\` for code sections
- Preserve text EXACTLY as it appears

Page ${pageNum} of ${totalPages}.

Extract the visible text now:`;
}

/**
 * Clean and normalize markdown output
 */
function cleanMarkdownOutput(markdown: string): string {
  // Remove common AI artifacts and hallucinated content
  let cleaned = markdown
    // Remove "Here is the markdown:" type phrases
    .replace(/^(here is|here's|this is|the|okay,?\s*)?the\s+markdown.*?:?\s*\n+/gi, '')
    // Remove AI meta-commentary about the document
    .replace(/^(this|the)?\s*(document|page|text|content)\s+(appears to be|is about|contains|describes|shows).*?\n+/gmi, '')
    // Remove introductory AI phrases
    .replace(/^(i'll|i will|let me|i can see|based on).*?\n+/gmi, '')
    // Remove concluding AI phrases
    .replace(/\n+(that's all|that is all|hope this helps|let me know).*?$/gmi, '')
    // Remove markdown code blocks wrapping (```markdown ... ```)
    .replace(/^```markdown\s*\n/gi, '')
    .replace(/^```\s*\n/gi, '')
    .replace(/\n```\s*$/gi, '')
    // Remove common research/definition introductions
    .replace(/^(note:|important:|definition:|background:).*?\n+/gmi, '')
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
