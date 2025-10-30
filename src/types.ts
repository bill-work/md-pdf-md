/**
 * Core types for md-to-beautiful-pdf
 */

export interface PdfOptions {
  /** Input markdown file path */
  input: string;
  /** Output PDF file path */
  output?: string;
  /** Theme for styling (github, github-dark, dracula, academic) */
  theme?: string;
  /** Include table of contents */
  toc?: boolean;
  /** Include page numbers */
  pageNumbers?: boolean;
  /** Page format (A4, Letter, Legal) */
  format?: 'A4' | 'Letter' | 'Legal';
  /** Custom CSS file path */
  css?: string;
  /** Enable debug mode */
  debug?: boolean;
  /** Syntax highlighting theme */
  highlightTheme?: 'github-dark' | 'github-light' | 'dracula' | 'nord' | 'monokai';
}

export interface FrontMatter {
  title?: string;
  author?: string;
  date?: string;
  subtitle?: string;
  [key: string]: any;
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
  page?: number;
}

export interface ParsedMarkdown {
  content: string;
  frontMatter: FrontMatter;
  toc: TocItem[];
  html: string;
}

export interface PageDimensions {
  width: number;
  height: number;
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export const PAGE_FORMATS: Record<string, PageDimensions> = {
  A4: {
    width: 210,
    height: 297,
    margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' }
  },
  Letter: {
    width: 215.9,
    height: 279.4,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  },
  Legal: {
    width: 215.9,
    height: 355.6,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  }
};

export interface ConversionResult {
  success: boolean;
  outputPath: string;
  error?: string;
  stats?: {
    pages: number;
    size: number;
    duration: number;
  };
}
