#!/usr/bin/env node

/**
 * CLI interface for md-pdf-md - Smart bidirectional converter
 */

import { Command } from 'commander';
import * as path from 'path';
import { convertMarkdownToPdf, cleanup, formatFileSize, formatDuration } from './converter.js';
import { getAvailableThemes } from './themes.js';
import { PdfOptions } from './types.js';
import {
  convertPdfToMarkdown,
  checkOllamaConnection,
  listVisionModels,
  PdfToMarkdownOptions
} from './pdf-to-markdown.js';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('md-pdf-md')
  .description('Smart bidirectional Markdown-PDF converter with AI vision')
  .version('1.0.0');

// ========================================
// Smart Auto-Detect Command (Default)
// ========================================
program
  .argument('[input]', 'Input file (*.md or *.pdf) - automatically detects and converts')
  .option('-o, --output <path>', 'Output file path')
  .option('-t, --theme <name>', `Theme for MD→PDF (${getAvailableThemes().join(', ')})`, 'github')
  .option('--toc', 'Include table of contents (MD→PDF)', true)
  .option('--no-toc', 'Exclude table of contents')
  .option('--page-numbers', 'Include page numbers (MD→PDF)', true)
  .option('--no-page-numbers', 'Exclude page numbers')
  .option('-f, --format <format>', 'Page format for MD→PDF (A4, Letter, Legal)', 'A4')
  .option('--css <path>', 'Custom CSS file (MD→PDF)')
  .option('--highlight-theme <theme>', 'Syntax highlighting theme (MD→PDF)', 'github-dark')
  .option('-m, --model <name>', 'Ollama model for PDF→MD', 'llava')
  .option('--host <url>', 'Ollama server URL for PDF→MD', 'http://localhost:11434')
  .option('-q, --quality <dpi>', 'Image quality for PDF→MD', '200')
  .option('--debug', 'Enable debug mode', false)
  .action(async (input: string | undefined, options: any) => {
    // If no input and not a subcommand, show help
    if (!input) {
      program.help();
      return;
    }

    const inputPath = path.resolve(process.cwd(), input);
    const ext = path.extname(inputPath).toLowerCase();

    // Auto-detect file type and convert
    if (ext === '.pdf') {
      // PDF → Markdown
      await handlePdfToMarkdown(inputPath, options);
    } else if (ext === '.md' || ext === '.markdown') {
      // Markdown → PDF
      await handleMarkdownToPdf(inputPath, options);
    } else {
      console.error(chalk.red('Error: Unsupported file type'));
      console.log(chalk.yellow('Supported formats:'));
      console.log(chalk.dim('  • *.md, *.markdown → converts to PDF'));
      console.log(chalk.dim('  • *.pdf → converts to Markdown'));
      process.exit(1);
    }
  });

// ========================================
// Command: md2pdf (for power users)
// ========================================
program
  .command('md2pdf')
  .description('Convert Markdown to PDF (explicit)')
  .argument('<input>', 'Input markdown file path')
  .option('-o, --output <path>', 'Output PDF file path')
  .option('-t, --theme <name>', `Theme (${getAvailableThemes().join(', ')})`, 'github')
  .option('--toc', 'Include table of contents', true)
  .option('--no-toc', 'Exclude table of contents')
  .option('--page-numbers', 'Include page numbers', true)
  .option('--no-page-numbers', 'Exclude page numbers')
  .option('-f, --format <format>', 'Page format (A4, Letter, Legal)', 'A4')
  .option('--css <path>', 'Custom CSS file')
  .option('--highlight-theme <theme>', 'Syntax highlighting theme', 'github-dark')
  .option('--debug', 'Enable debug mode', false)
  .action(async (input: string, options: any) => {
    const inputPath = path.resolve(process.cwd(), input);
    await handleMarkdownToPdf(inputPath, options);
  });

// ========================================
// Command: pdf2md (for power users)
// ========================================
program
  .command('pdf2md')
  .description('Convert PDF to Markdown (explicit)')
  .argument('<input>', 'Input PDF file path')
  .option('-o, --output <path>', 'Output markdown file path')
  .option('-m, --model <name>', 'Ollama model', 'llava')
  .option('--host <url>', 'Ollama server URL', 'http://localhost:11434')
  .option('-q, --quality <dpi>', 'Image quality in DPI', '200')
  .option('--debug', 'Enable debug mode', false)
  .action(async (input: string, options: any) => {
    const inputPath = path.resolve(process.cwd(), input);
    await handlePdfToMarkdown(inputPath, options);
  });

// ========================================
// Handler: Markdown → PDF
// ========================================
async function handleMarkdownToPdf(inputPath: string, options: any) {
  const spinner = ora('Converting Markdown to PDF...').start();

  try {
    const pdfOptions: PdfOptions = {
      input: inputPath,
      output: options.output ? path.resolve(process.cwd(), options.output) : undefined,
      theme: options.theme,
      toc: options.toc,
      pageNumbers: options.pageNumbers,
      format: options.format,
      css: options.css ? path.resolve(process.cwd(), options.css) : undefined,
      highlightTheme: options.highlightTheme,
      debug: options.debug
    };

    // Validate theme
    const availableThemes = getAvailableThemes();
    if (!availableThemes.includes(pdfOptions.theme || 'github')) {
      spinner.fail(chalk.red(`Invalid theme: ${pdfOptions.theme}`));
      console.log(chalk.yellow(`Available themes: ${availableThemes.join(', ')}`));
      process.exit(1);
    }

    const result = await convertMarkdownToPdf(pdfOptions);

    if (result.success) {
      spinner.succeed(chalk.green('✓ MD → PDF conversion completed!'));
      console.log('');
      console.log(chalk.bold('📄 Output:'), chalk.cyan(result.outputPath));

      if (result.stats) {
        console.log(chalk.bold('📊 Stats:'));
        console.log(`   Pages: ${chalk.yellow(result.stats.pages)}`);
        console.log(`   Size: ${chalk.yellow(formatFileSize(result.stats.size))}`);
        console.log(`   Duration: ${chalk.yellow(formatDuration(result.stats.duration))}`);
      }
    } else {
      spinner.fail(chalk.red('Failed to generate PDF'));
      console.error(chalk.red('Error:'), result.error);
      process.exit(1);
    }

  } catch (error) {
    spinner.fail(chalk.red('An unexpected error occurred'));
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// ========================================
// Handler: PDF → Markdown
// ========================================
async function handlePdfToMarkdown(inputPath: string, options: any) {
  console.log(chalk.bold.cyan('\n🤖 PDF to Markdown with AI Vision\n'));

  // Check Ollama connection first
  const checkingSpinner = ora('Checking Ollama connection...').start();
  const isConnected = await checkOllamaConnection(options.host);

  if (!isConnected) {
    checkingSpinner.fail(chalk.red('Ollama is not running'));
    console.log('');
    console.log(chalk.yellow('Please start Ollama first:'));
    console.log(chalk.dim('  1. Install: https://ollama.ai'));
    console.log(chalk.dim('  2. Run: ollama serve'));
    console.log(chalk.dim('  3. Pull model: ollama pull llava'));
    console.log('');
    process.exit(1);
  }

  checkingSpinner.succeed(chalk.green('Ollama connected'));

  // List available models
  const models = await listVisionModels(options.host);
  if (models.length === 0) {
    console.log(chalk.yellow('\n⚠️  No vision models found'));
    console.log(chalk.dim('Install a vision model:'));
    console.log(chalk.dim('  ollama pull llava'));
    console.log('');
    process.exit(1);
  }

  if (options.debug) {
    console.log(chalk.dim(`Available models: ${models.join(', ')}`));
  }

  const pdfOptions: PdfToMarkdownOptions = {
    input: inputPath,
    output: options.output ? path.resolve(process.cwd(), options.output) : undefined,
    model: options.model,
    ollamaHost: options.host,
    debug: options.debug,
    quality: parseInt(options.quality)
  };

  let currentPage = 0;
  let totalPages = 0;
  let spinner: any;

  const result = await convertPdfToMarkdown(pdfOptions, (progress) => {
    if (progress.totalPages !== totalPages) {
      totalPages = progress.totalPages;
      if (spinner) spinner.stop();
      console.log(chalk.dim(`Found ${totalPages} pages\n`));
    }

    if (progress.currentPage !== currentPage) {
      currentPage = progress.currentPage;
      if (spinner) spinner.stop();
      spinner = ora(`${progress.status}`).start();
    }
  });

  if (spinner) spinner.stop();

  if (result.success) {
    console.log('');
    console.log(chalk.green('✓ PDF → MD conversion completed!'));
    console.log('');
    console.log(chalk.bold('📄 Output:'), chalk.cyan(result.outputPath));
    console.log(chalk.bold('📝 Pages:'), chalk.yellow(totalPages));
    console.log('');
    console.log(chalk.dim('Tip: Review the markdown and make adjustments as needed.'));
  } else {
    console.log('');
    console.log(chalk.red('✗ Conversion failed'));
    console.error(chalk.red('Error:'), result.error);
    process.exit(1);
  }
}

// ========================================
// Command: themes
// ========================================
program
  .command('themes')
  .description('List available themes for MD→PDF conversion')
  .action(() => {
    console.log(chalk.bold('Available themes for MD→PDF:'));
    console.log('');

    const themes = [
      { name: 'github', desc: 'Clean GitHub-style light theme (default)' },
      { name: 'github-dark', desc: 'GitHub dark theme with beautiful syntax highlighting' },
      { name: 'academic', desc: 'Formal academic style with serif fonts' },
      { name: 'minimal', desc: 'Clean and simple minimal design' }
    ];

    themes.forEach(theme => {
      console.log(`  ${chalk.cyan(theme.name.padEnd(15))} ${chalk.dim(theme.desc)}`);
    });

    console.log('');
    console.log(chalk.dim('Usage: md-pdf-md file.md --theme <name>'));
  });

// ========================================
// Command: check
// ========================================
program
  .command('check')
  .description('Check Ollama installation and available models')
  .option('--host <url>', 'Ollama server URL', 'http://localhost:11434')
  .action(async (options: any) => {
    console.log(chalk.bold.cyan('\n🔍 Checking Ollama Setup\n'));

    const spinner = ora('Connecting to Ollama...').start();
    const isConnected = await checkOllamaConnection(options.host);

    if (!isConnected) {
      spinner.fail(chalk.red('Ollama is not running'));
      console.log('');
      console.log(chalk.yellow('Setup instructions:'));
      console.log(chalk.dim('  1. Install: https://ollama.ai'));
      console.log(chalk.dim('  2. Start: ollama serve'));
      console.log(chalk.dim('  3. Pull model: ollama pull llava'));
      console.log('');
      process.exit(1);
    }

    spinner.succeed(chalk.green('Ollama is running'));

    // List models
    console.log('');
    const modelsSpinner = ora('Checking for vision models...').start();
    const models = await listVisionModels(options.host);

    if (models.length === 0) {
      modelsSpinner.warn(chalk.yellow('No vision models installed'));
      console.log('');
      console.log(chalk.dim('Install a vision model:'));
      console.log(chalk.dim('  ollama pull llava           # 4.7GB'));
      console.log(chalk.dim('  ollama pull llama3.2-vision # 7.9GB'));
      console.log('');
    } else {
      modelsSpinner.succeed(chalk.green(`Found ${models.length} vision model(s)`));
      console.log('');
      models.forEach(model => {
        console.log(`  ${chalk.cyan('✓')} ${model}`);
      });
      console.log('');
      console.log(chalk.green('✓ Ready for bidirectional conversion!'));
      console.log('');
    }
  });

// Error handling
program.exitOverride();

process.on('uncaughtException', async (error) => {
  console.error(chalk.red('Uncaught error:'), error.message);
  await cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (error) => {
  console.error(chalk.red('Unhandled rejection:'), error);
  await cleanup();
  process.exit(1);
});

// Parse arguments
program.parse();
