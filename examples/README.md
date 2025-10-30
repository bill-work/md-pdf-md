---
title: md-to-beautiful-pdf Example
subtitle: A demonstration of all features
author: The md-to-beautiful-pdf Team
date: 2025-01-15
---

# Introduction

This is an example document demonstrating all the features of **md-to-beautiful-pdf**.

## Features Showcase

### Syntax Highlighting

JavaScript example:

```javascript
async function convertMarkdownToPdf(options) {
  const result = await converter.convert(options);

  if (result.success) {
    console.log('PDF generated:', result.outputPath);
  }

  return result;
}
```

Python example:

```python
def generate_pdf(input_file, output_file):
    """Generate a beautiful PDF from markdown."""
    with open(input_file, 'r') as f:
        content = f.read()

    result = converter.convert(content, output_file)
    return result
```

TypeScript example:

```typescript
interface PdfOptions {
  input: string;
  output?: string;
  theme?: 'github' | 'github-dark' | 'academic';
  toc?: boolean;
}

const convertToPdf = async (options: PdfOptions): Promise<void> => {
  const result = await convert(options);
  console.log('Done!');
};
```

### Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Syntax Highlighting | ✅ | 100+ languages |
| Table of Contents | ✅ | Auto-generated |
| Page Numbers | ✅ | Header/footer |
| Custom CSS | ✅ | Full control |
| Themes | ✅ | 4 built-in themes |

### Lists

Unordered list:
- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

Ordered list:
1. First step
2. Second step
3. Third step

Task list:
- [x] Completed task
- [x] Another completed task
- [ ] Pending task
- [ ] Another pending task

### Blockquotes

> "The best way to predict the future is to invent it."
>
> — Alan Kay

> This is a multi-paragraph blockquote.
>
> It spans multiple lines and demonstrates how blockquotes are formatted
> in the PDF output.

### Code Blocks

Shell commands:

```bash
npm install -g md-to-beautiful-pdf
md-to-pdf README.md --theme github-dark
```

JSON example:

```json
{
  "name": "md-to-beautiful-pdf",
  "version": "1.0.0",
  "description": "Beautiful PDF generation from Markdown",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "node dist/cli.js examples/README.md"
  }
}
```

### Links and Images

Check out the [documentation](https://github.com/josharsh/md-to-beautiful-pdf) for more information.

Internal link example: See [Introduction](#introduction) section.

### Inline Code

Use `npm install` to install the package. The main function is `convertMarkdownToPdf()`.

### Horizontal Rules

---

## Advanced Features

### Nested Structures

1. First level
   - Second level item 1
   - Second level item 2
     - Third level item
2. Back to first level
   - Another second level

### Complex Code Example

Here's a more complex example showing class definitions:

```typescript
class PdfConverter {
  private options: PdfOptions;

  constructor(options: PdfOptions) {
    this.options = options;
  }

  async convert(): Promise<ConversionResult> {
    const parsed = await this.parseMarkdown();
    const html = this.generateHtml(parsed);
    const pdf = await this.generatePdf(html);

    return {
      success: true,
      outputPath: this.options.output,
      stats: {
        pages: pdf.pages,
        size: pdf.size
      }
    };
  }

  private async parseMarkdown(): Promise<ParsedMarkdown> {
    // Implementation
    return {} as ParsedMarkdown;
  }
}
```

### SQL Example

```sql
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC;
```

## Conclusion

This example demonstrates all the key features of md-to-beautiful-pdf:

- ✅ Professional formatting
- ✅ Beautiful syntax highlighting
- ✅ Table of contents
- ✅ Page numbers
- ✅ All markdown features

Try converting this file with different themes to see how it looks!

```bash
md-to-pdf examples/README.md --theme github
md-to-pdf examples/README.md --theme github-dark
md-to-pdf examples/README.md --theme academic
md-to-pdf examples/README.md --theme minimal
```
