#!/usr/bin/env node

/**
 * CLI interface for md-to-beautiful-pdf
 */

import { Command } from 'commander';
import * as path from 'path';
import { convertMarkdownToPdf, cleanup, formatFileSize, formatDuration } from './converter.js';
import { getAvailableThemes } from './themes.js';
import { PdfOptions } from './types.js';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('md-to-pdf')
  .description('Convert Markdown to professionally formatted PDFs with syntax highlighting')
  .version('1.0.0')
  .argument('<input>', 'Input markdown file path')
  .option('-o, --output <path>', 'Output PDF file path')
  .option('-t, --theme <name>', `Theme to use (${getAvailableThemes().join(', ')})`, 'github')
  .option('--toc', 'Include table of contents', true)
  .option('--no-toc', 'Exclude table of contents')
  .option('--page-numbers', 'Include page numbers', true)
  .option('--no-page-numbers', 'Exclude page numbers')
  .option('-f, --format <format>', 'Page format (A4, Letter, Legal)', 'A4')
  .option('--css <path>', 'Custom CSS file path')
  .option('--highlight-theme <theme>', 'Syntax highlighting theme (github-dark, github-light, dracula, nord, monokai)', 'github-dark')
  .option('--debug', 'Enable debug mode', false)
  .action(async (input: string, options: any) => {
    const spinner = ora('Converting Markdown to PDF...').start();

    try {
      // Resolve input path
      const inputPath = path.resolve(process.cwd(), input);

      // Prepare options
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

      // Validate format
      const validFormats = ['A4', 'Letter', 'Legal'];
      if (!validFormats.includes(pdfOptions.format || 'A4')) {
        spinner.fail(chalk.red(`Invalid format: ${pdfOptions.format}`));
        console.log(chalk.yellow(`Valid formats: ${validFormats.join(', ')}`));
        process.exit(1);
      }

      // Convert
      const result = await convertMarkdownToPdf(pdfOptions);

      if (result.success) {
        spinner.succeed(chalk.green('PDF generated successfully!'));

        console.log('');
        console.log(chalk.bold('📄 Output:'), chalk.cyan(result.outputPath));

        if (result.stats) {
          console.log(chalk.bold('📊 Stats:'));
          console.log(`   Pages: ${chalk.yellow(result.stats.pages)}`);
          console.log(`   Size: ${chalk.yellow(formatFileSize(result.stats.size))}`);
          console.log(`   Duration: ${chalk.yellow(formatDuration(result.stats.duration))}`);
        }

        console.log('');
        console.log(chalk.dim('Generated with md-to-beautiful-pdf'));

      } else {
        spinner.fail(chalk.red('Failed to generate PDF'));
        console.error(chalk.red('Error:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      spinner.fail(chalk.red('An unexpected error occurred'));
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);

      if (options.debug && error instanceof Error) {
        console.error(chalk.dim('\nStack trace:'));
        console.error(chalk.dim(error.stack));
      }

      process.exit(1);

    } finally {
      // Cleanup
      await cleanup();
    }
  });

// Add info command
program
  .command('themes')
  .description('List available themes')
  .action(() => {
    console.log(chalk.bold('Available themes:'));
    console.log('');

    const themes = [
      { name: 'github', desc: 'Clean GitHub-style light theme (default)' },
      { name: 'github-dark', desc: 'GitHub dark theme with syntax highlighting' },
      { name: 'academic', desc: 'Formal academic style with serif fonts' },
      { name: 'minimal', desc: 'Clean and simple minimal design' }
    ];

    themes.forEach(theme => {
      console.log(`  ${chalk.cyan(theme.name.padEnd(15))} ${chalk.dim(theme.desc)}`);
    });

    console.log('');
    console.log(chalk.dim('Usage: md-to-pdf input.md --theme <name>'));
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
