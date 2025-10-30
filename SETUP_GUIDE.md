# md-pdf-md Setup Guide

Complete setup guide for both Markdown→PDF and PDF→Markdown features.

## Table of Contents

1. [Basic Setup (MD→PDF only)](#basic-setup-mdpdf-only)
2. [Full Setup (MD→PDF + PDF→MD)](#full-setup-mdpdf--pdfmd)
3. [Verification](#verification)
4. [Troubleshooting](#troubleshooting)

---

## Basic Setup (MD→PDF only)

If you only need Markdown→PDF conversion:

```bash
# Install the package
npm install -g md-pdf-md

# Test it
md-pdf-md md2pdf README.md

# Done! ✅
```

That's it! No other dependencies needed for MD→PDF.

---

## Full Setup (MD→PDF + PDF→MD)

For bidirectional conversion (including PDF→Markdown with AI):

### Step 1: Install md-pdf-md

```bash
npm install -g md-pdf-md
```

### Step 2: Install Ollama

#### macOS

```bash
# Download from https://ollama.ai
# Or use Homebrew:
brew install ollama
```

#### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows

Download installer from: https://ollama.ai/download/windows

### Step 3: Start Ollama

```bash
# Start Ollama server
ollama serve
```

**Keep this terminal open** or run in background.

### Step 4: Install LLaVA Model

In a new terminal:

```bash
# Pull LLaVA vision model (~4.7GB download)
ollama pull llava

# This will take 5-10 minutes depending on your internet speed
```

**Alternative models:**

```bash
# Larger, more accurate (7.9GB)
ollama pull llama3.2-vision

# Smaller, faster (4.5GB)
ollama pull bakllava
```

### Step 5: Verify Setup

```bash
# Check everything is working
md-pdf-md check
```

You should see:
```
✓ Ollama is running
✓ Found 1 vision model(s)
  ✓ llava
✓ Your system is ready for PDF→MD conversion!
```

---

## Verification

### Test MD→PDF

```bash
# Create test markdown
echo "# Hello World\n\nThis is a test." > test.md

# Convert to PDF
md-pdf-md md2pdf test.md

# Check output
ls -lh test.pdf
```

### Test PDF→MD

```bash
# Convert back to markdown
md-pdf-md pdf2md test.pdf -o recovered.md

# Check output
cat recovered.md
```

---

## Troubleshooting

### Issue: "Ollama is not running"

**Solution:**

```bash
# Start Ollama in a new terminal
ollama serve

# Or run in background (macOS/Linux)
ollama serve > /dev/null 2>&1 &
```

### Issue: "Model 'llava' not found"

**Solution:**

```bash
# Install the model
ollama pull llava

# Verify installation
ollama list
```

### Issue: "Puppeteer Chrome download fails"

**Solution:**

```bash
# Skip Chromium download initially
PUPPETEER_SKIP_DOWNLOAD=true npm install -g md-pdf-md

# Then install manually
npx puppeteer browsers install chrome
```

### Issue: "PDF→MD conversion is slow"

**Possible causes and solutions:**

1. **No GPU**: Vision models run faster with GPU
   - **Solution**: This is normal, expect 5-10s per page on CPU

2. **High DPI setting**: Higher quality = slower
   - **Solution**: Reduce quality:
   ```bash
   md-pdf-md pdf2md doc.pdf --quality 150
   ```

3. **Large PDF**: Many pages
   - **Solution**: Be patient or split PDF into smaller chunks

### Issue: "Out of memory"

**Solution:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" md-pdf-md pdf2md large.pdf
```

### Issue: "PDF→MD output is poor quality"

**Solutions:**

```bash
# 1. Try higher quality
md-pdf-md pdf2md doc.pdf --quality 300

# 2. Try different model
ollama pull llama3.2-vision
md-pdf-md pdf2md doc.pdf --model llama3.2-vision

# 3. Enable debug mode to see what's happening
md-pdf-md pdf2md doc.pdf --debug
```

### Issue: "Ollama running but check fails"

**Solution:**

```bash
# Check custom Ollama host
md-pdf-md check --host http://localhost:11434

# If Ollama is on different port
export OLLAMA_HOST=http://localhost:11434
md-pdf-md check
```

---

## Platform-Specific Notes

### macOS

- Ollama runs as system service
- GPU support via Metal
- Recommended: Install via Homebrew

```bash
brew install ollama
brew services start ollama
```

### Linux

- May need to run as service
- NVIDIA GPU recommended for speed
- AMD GPU supported

```bash
# Create systemd service
sudo systemctl enable ollama
sudo systemctl start ollama
```

### Windows

- Runs as Windows service
- GPU support via CUDA (NVIDIA) or DirectML
- May need admin rights for installation

---

## Configuration

### Environment Variables

```bash
# Ollama host (if not default)
export OLLAMA_HOST=http://localhost:11434

# Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Skip Puppeteer download
export PUPPETEER_SKIP_DOWNLOAD=true
```

### Config File (Future Feature)

Create `.md-pdf-md.json` in your project:

```json
{
  "theme": "github-dark",
  "toc": true,
  "pageNumbers": true,
  "format": "A4",
  "ollamaModel": "llava",
  "quality": 200
}
```

---

## Resource Requirements

### MD→PDF Only

- **RAM**: 500MB
- **Disk**: ~200MB (Puppeteer + Chromium)
- **CPU**: Any modern CPU

### PDF→MD (with Ollama + LLaVA)

- **RAM**: 2-4GB (for model)
- **Disk**: ~5GB (Ollama + models)
- **CPU**: Modern multi-core recommended
- **GPU**: Optional (significantly faster)

### Recommended Specs

- **RAM**: 8GB+ total
- **CPU**: 4+ cores
- **Disk**: 10GB free space
- **GPU**: NVIDIA/AMD for speed (optional)

---

## Network Requirements

### First-Time Setup

- Internet connection needed to:
  - Install npm package
  - Download Ollama
  - Pull LLaVA model (~4.7GB)

### After Setup

- **MD→PDF**: No internet needed ✅
- **PDF→MD**: No internet needed ✅
- **100% offline operation** after initial setup

---

## Quick Command Reference

```bash
# Check setup
md-pdf-md check

# List themes
md-pdf-md themes

# MD→PDF
md-pdf-md md2pdf input.md

# PDF→MD
md-pdf-md pdf2md input.pdf

# Help
md-pdf-md --help
md-pdf-md md2pdf --help
md-pdf-md pdf2md --help
```

---

## Getting Help

1. **Check setup**: `md-pdf-md check`
2. **Enable debug**: Add `--debug` flag
3. **Check logs**: Look in terminal output
4. **GitHub Issues**: https://github.com/josharsh/md-pdf-md/issues

---

## Next Steps

Once setup is complete:

1. ✅ Read the [README](README.md) for usage examples
2. ✅ Try the [examples](examples/) directory
3. ✅ Explore different [themes](README.md#themes)
4. ✅ Customize with [custom CSS](README.md#custom-css)

---

**Happy converting! 🚀**
