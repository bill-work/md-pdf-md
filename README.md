# md-pdf-md

> **Bidirectional Markdown ↔ PDF converter with AI-powered vision**

Convert Markdown to beautiful PDFs **AND** extract Markdown from PDFs using local AI vision. Zero configuration, completely private, and open source.

[![npm version](https://img.shields.io/npm/v/md-pdf-md.svg)](https://www.npmjs.com/package/md-pdf-md)
[![npm downloads](https://img.shields.io/npm/dm/md-pdf-md.svg)](https://www.npmjs.com/package/md-pdf-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/josharsh/md-pdf-md?style=social)](https://github.com/josharsh/md-pdf-md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Good First Issues](https://img.shields.io/github/issues/josharsh/md-pdf-md/good%20first%20issue?label=good%20first%20issues)](https://github.com/josharsh/md-pdf-md/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
[![Contributor Friendly](https://img.shields.io/badge/contributor-friendly-success)](CONTRIBUTING.md)

## ✨ Features

### Markdown → PDF
- 🎨 **4 Beautiful Themes** - GitHub, GitHub Dark, Academic, Minimal
- 💎 **VS Code Syntax Highlighting** - Powered by Shiki
- 📄 **Smart Page Breaks** - No orphaned headings or broken code blocks
- 📊 **Auto Table of Contents** - With page numbers
- 🚀 **2-3 Second Generation** - Fast and efficient
- ⚙️ **Zero Configuration** - Works out of the box

### PDF → Markdown (NEW!)
- 🤖 **AI-Powered Vision** - Uses LLaVA to understand document structure
- 🔒 **100% Private** - Runs locally via Ollama (no cloud APIs)
- 📝 **Structure Preservation** - Maintains headings, lists, code blocks, tables
- 💰 **Free Forever** - No API costs, completely open source

## 🚀 Quick Start

```bash
# Install
npm install -g md-pdf-md

# Convert Markdown to PDF
md-pdf-md README.md

# Convert PDF to Markdown (requires Ollama + LLaVA)
md-pdf-md document.pdf
```

That's it! The tool auto-detects file type and converts appropriately.

## 📦 Installation

### Basic (MD→PDF only)
```bash
npm install -g md-pdf-md
```

### Full Setup (MD↔PDF bidirectional)
```bash
# 1. Install the package
npm install -g md-pdf-md

# 2. Install Ollama (for PDF→MD)
# Visit: https://ollama.ai

# 3. Pull LLaVA model (~4.7GB)
ollama pull llava

# 4. Verify setup
md-pdf-md check
```

## 💡 Usage

### Smart Auto-Detection
```bash
# Just pass any file!
md-pdf-md README.md        # → Converts to PDF
md-pdf-md document.pdf     # → Converts to Markdown
md-pdf-md slides.md --theme github-dark
```

### With Options
```bash
# Markdown to PDF
md-pdf-md docs.md -o output.pdf --theme academic --format Letter

# PDF to Markdown
md-pdf-md report.pdf -o report.md --model llava --quality 300
```

### Explicit Commands (for power users)
```bash
md-pdf-md md2pdf input.md       # Explicit MD→PDF
md-pdf-md pdf2md input.pdf      # Explicit PDF→MD
md-pdf-md themes                # List available themes
md-pdf-md check                 # Verify Ollama setup
```

## 🎨 Themes

| Theme | Description | Best For |
|-------|-------------|----------|
| `github` | Clean light theme | General docs |
| `github-dark` | Dark with syntax highlighting | Code-heavy docs |
| `academic` | Formal serif fonts | Papers & reports |
| `minimal` | Simple & clean | Minimalist design |

Preview: `md-pdf-md themes`

## 🔧 Options

### Markdown → PDF
```bash
-o, --output <path>          Output PDF path
-t, --theme <name>           Theme (default: github)
--toc / --no-toc             Table of contents (default: true)
--page-numbers               Page numbers (default: true)
-f, --format <format>        A4, Letter, or Legal (default: A4)
--css <path>                 Custom CSS file
--highlight-theme <theme>    Syntax highlight theme
```

### PDF → Markdown
```bash
-o, --output <path>          Output markdown path
-m, --model <name>           Ollama model (default: llava)
--host <url>                 Ollama server URL
-q, --quality <dpi>          Image quality (default: 200)
--debug                      Debug mode
```

## 📝 Programmatic API

```typescript
import { convertMarkdownToPdf, convertPdfToMarkdown } from 'md-pdf-md';

// Markdown → PDF
const result = await convertMarkdownToPdf({
  input: 'README.md',
  output: 'README.pdf',
  theme: 'github-dark',
  toc: true,
  pageNumbers: true
});

// PDF → Markdown (with progress)
const result = await convertPdfToMarkdown({
  input: 'document.pdf',
  output: 'document.md',
  model: 'llava'
}, (progress) => {
  console.log(`Page ${progress.currentPage}/${progress.totalPages}`);
});
```

## 🤖 How PDF→MD Works

Traditional PDF extractors just dump text blindly. **md-pdf-md uses LLaVA vision AI** to:
1. **Understand structure** - Identifies H1, H2, H3 correctly
2. **Preserve formatting** - Maintains lists, code blocks, tables
3. **Detect code** - Recognizes programming languages
4. **Keep hierarchy** - Preserves document organization

All processing happens **locally on your machine** - no cloud APIs, no data leaving your computer.

## 🆚 Comparison

| Feature | md-pdf-md | pandoc | md-to-pdf | pdf2md |
|---------|-----------|--------|-----------|---------|
| MD→PDF Beautiful | ✅ | ⚠️ Complex | ⚠️ Basic | ❌ |
| PDF→MD AI-powered | ✅ | ❌ | ❌ | ⚠️ Poor |
| Zero config | ✅ | ❌ | ❌ | ✅ |
| 100% Private | ✅ | ✅ | ✅ | ✅ |
| Free | ✅ | ✅ | ✅ | ✅ |

## 💡 Use Cases

**Developers**: Beautiful README PDFs with syntax highlighting
```bash
md-pdf-md README.md --theme github-dark
```

**Enterprises**: Professional reports and documentation
```bash
md-pdf-md quarterly-report.md --theme academic --format Letter
```

**Writers**: Edit PDFs by converting to Markdown
```bash
md-pdf-md document.pdf    # Edit the .md, then convert back!
md-pdf-md document.md
```

**Students**: Format papers and extract notes from PDFs
```bash
md-pdf-md thesis.md --theme academic
md-pdf-md lecture-slides.pdf
```

## 🐛 Troubleshooting

### "Ollama is not running"
```bash
ollama serve              # Start Ollama
ollama pull llava         # Install model
md-pdf-md check           # Verify
```

### Poor PDF→MD results
```bash
md-pdf-md doc.pdf --quality 300              # Higher quality
md-pdf-md doc.pdf --model llama3.2-vision    # Different model
md-pdf-md doc.pdf --debug                     # Debug mode
```

### Memory issues
```bash
NODE_OPTIONS="--max-old-space-size=4096" md-pdf-md large.pdf
```

## 📊 Performance

**MD→PDF**: 2-3 seconds for typical documents
**PDF→MD**: ~5-10 seconds per page (CPU), ~2-5 seconds (GPU)
**Accuracy**: 90%+ structure preservation

## 🛠️ Requirements

- **Node.js** ≥ 16.0.0
- **Ollama** (PDF→MD only) - [ollama.ai](https://ollama.ai)
- **LLaVA model** (PDF→MD only) - `ollama pull llava`

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Built With

- [Puppeteer](https://pptr.dev/) - PDF generation
- [Ollama](https://ollama.ai/) - Local AI runtime
- [LLaVA](https://llava-vl.github.io/) - Vision language model
- [Shiki](https://shiki.matsu.io/) - Syntax highlighting
- [Marked](https://marked.js.org/) - Markdown parsing

---

**Made with ❤️ by [josharsh](https://github.com/josharsh)**

⭐ Star this repo if you find it useful!
