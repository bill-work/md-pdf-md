/**
 * PDF generation using Puppeteer
 */

import puppeteer, { Browser, PDFOptions as PuppeteerPDFOptions } from 'puppeteer';
import { PdfOptions, PAGE_FORMATS } from './types.js';
import { getHeaderTemplate, getFooterTemplate } from './template.js';

let browserInstance: Browser | null = null;

/**
 * Get or create browser instance (reusable)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
  }
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Generate PDF from HTML content with optimized settings
 */
export async function generatePdf(
  html: string,
  outputPath: string,
  options: PdfOptions,
  title?: string
): Promise<void> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2 // High DPI for crisp text
    });

    // Emulate print media type for CSS @media print rules
    await page.emulateMediaType('print');

    // Set content and wait for everything to load
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    // Give the page a moment to fully render and settle layout
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get page format
    const format = options.format || 'A4';
    const pageFormat = PAGE_FORMATS[format];

    // Configure PDF options with optimal settings
    const pdfOptions: PuppeteerPDFOptions = {
      path: outputPath,
      format: format as any,
      printBackground: true,
      preferCSSPageSize: true, // Respect CSS @page rules
      displayHeaderFooter: options.pageNumbers || false,
      headerTemplate: getHeaderTemplate(options),
      footerTemplate: getFooterTemplate(options, title),
      margin: pageFormat.margin,
      scale: 1, // Don't scale content
      omitBackground: false // Include backgrounds
    };

    // Generate PDF with a short delay for final render
    await new Promise(resolve => setTimeout(resolve, 100));
    await page.pdf(pdfOptions);

    if (options.debug) {
      console.log('PDF generated successfully at:', outputPath);
    }
  } finally {
    await page.close();
  }
}

/**
 * Extract page count from generated PDF
 */
export async function getPdfPageCount(html: string, options: PdfOptions): Promise<number> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set viewport and emulate print media
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });
    await page.emulateMediaType('print');

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    const format = options.format || 'A4';
    const pageFormat = PAGE_FORMATS[format];

    const pdfBuffer = await page.pdf({
      format: format as any,
      printBackground: true,
      preferCSSPageSize: true,
      margin: pageFormat.margin,
      scale: 1
    });

    // Count pages by analyzing PDF buffer
    const pageCount = countPdfPages(pdfBuffer);

    return pageCount;
  } finally {
    await page.close();
  }
}

/**
 * Count pages in PDF buffer (simple heuristic)
 */
function countPdfPages(buffer: Buffer): number {
  const pdfString = buffer.toString('latin1');
  const matches = pdfString.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 1;
}
