/**
 * PDF post-processing: Add bookmarks/outline
 */

import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import { TocItem } from './types.js';

/**
 * Add bookmarks to PDF from TOC items
 */
export async function addBookmarks(
  pdfPath: string,
  tocItems: TocItem[]
): Promise<void> {
  if (tocItems.length === 0) {
    return;
  }

  try {
    // Load PDF
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Add metadata
    pdfDoc.setTitle('Generated Document');
    pdfDoc.setProducer('md-to-beautiful-pdf');
    pdfDoc.setCreator('md-to-beautiful-pdf');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    // Note: pdf-lib doesn't have built-in outline/bookmark support
    // This is a known limitation. For now, we'll add metadata only.
    // Full bookmark implementation would require lower-level PDF manipulation
    // or a different library like hummus.

    // Save modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, modifiedPdfBytes);

  } catch (error) {
    // Non-critical error - PDF is still usable without bookmarks
    console.warn('Warning: Could not add bookmarks to PDF:', error instanceof Error ? error.message : error);
  }
}

/**
 * Add metadata to PDF
 */
export async function addMetadata(
  pdfPath: string,
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  }
): Promise<void> {
  try {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    if (metadata.title) pdfDoc.setTitle(metadata.title);
    if (metadata.author) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);

    pdfDoc.setProducer('md-to-beautiful-pdf');
    pdfDoc.setCreator('md-to-beautiful-pdf');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    const modifiedPdfBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, modifiedPdfBytes);

  } catch (error) {
    console.warn('Warning: Could not add metadata to PDF:', error instanceof Error ? error.message : error);
  }
}

/**
 * Get PDF statistics
 */
export async function getPdfStats(pdfPath: string): Promise<{
  pages: number;
  size: number;
}> {
  try {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    return {
      pages: pdfDoc.getPageCount(),
      size: pdfBytes.length
    };
  } catch (error) {
    return {
      pages: 0,
      size: 0
    };
  }
}
