# Personal Website - Charly Webster

A modern personal website and blog built with Astro, featuring markdown-based blog posts with GitHub-integrated comments.

## Features

- **Modern Stack**: Built with [Astro](https://astro.build) for optimal performance
- **Blog System**: Markdown/MDX support with type-safe content collections
- **GitHub Comments**: Integrated [giscus](https://giscus.app/) for blog comments via GitHub Discussions
- **Dark Mode**: Built-in dark mode toggle with system preference detection
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards, and sitemap
- **RSS Feed**: Automatic RSS feed generation at `/rss.xml`
- **Responsive Design**: Mobile-first responsive design
- **Performance**: Minimal JavaScript, optimized assets, fast page loads

## Tech Stack

- **Framework**: Astro 7.x
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, plus custom CSS variables for theming
- **Content**: Markdown/MDX for blog posts
- **Comments**: giscus (GitHub Discussions)
- **Deployment**: Netlify, configured via `netlify.toml`

## Getting Started

### Prerequisites

- Node.js 22.12 or higher
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/webstercharly/personal-site.git
cd personal-site
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:4321`

## Setting Up Giscus Comments

To enable GitHub-integrated comments on blog posts:

1. Visit [giscus.app](https://giscus.app/)
2. Follow the setup wizard to:
   - Enable Discussions on your repository
   - Install the giscus app
   - Get your repository ID and category ID
3. Update the giscus configuration in `src/pages/blog/[...slug].astro`:
   ```javascript
   'data-repo': 'webstercharly/personal-site', // Your repo
   'data-repo-id': 'YOUR_REPO_ID', // From giscus.app
   'data-category': 'Blog Comments',
   'data-category-id': 'YOUR_CATEGORY_ID', // From giscus.app
   ```

## Project Structure

```
/
├── public/
│   ├── images/           # Static images
│   └── favicon.svg       # Site favicon
├── src/
│   ├── components/       # Reusable components
│   │   ├── content/          # Components for use in MDX posts
│   │   ├── Icon.astro        # Icons addressed by name
│   │   ├── icons.ts          # The icon name registry
│   │   └── Navigation.astro
│   ├── content/
│   │   └── blog/         # Published posts (Markdown/MDX)
│   │       └── _drafts/  # Drafts, left out of the build
│   ├── content.config.ts # Content collection schema and loader
│   ├── icons/            # Vendored Lucide SVGs (see its README)
│   ├── layouts/
│   │   └── BaseLayout.astro  # Base HTML layout
│   ├── lib/
│   │   ├── constants.ts
│   │   └── posts.ts          # getPosts() / isDraft()
│   ├── pages/
│   │   ├── index.astro       # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro   # Blog listing
│   │   │   └── [...slug].astro  # Blog post template
│   │   └── rss.xml.ts        # RSS feed
│   └── styles/
│       └── global.css        # Global styles and theme
├── scripts/
│   └── editorial-audit.mjs   # Deterministic blog post quality checks
├── .github/workflows/    # PR checks (editorial audit, production build, Lighthouse)
├── astro.config.mjs      # Astro configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Writing Blog Posts

Create a new `.md` or `.mdx` file in `src/content/blog/`:

```markdown
---
title: 'Your Post Title'
description: 'A brief description of your post'
pubDate: 2025-11-01
author: 'Charly Webster'
tags: ['tag1', 'tag2']
---

Your content goes here...
```

### Drafts

A post's directory decides whether it is published — there is no `draft`
frontmatter flag:

| Location | Live site | `npm run dev` |
| --- | --- | --- |
| `src/content/blog/` | Published | Shown |
| `src/content/blog/_drafts/` | Excluded entirely | Shown, with a "Draft preview" banner |

Drafts are dropped by the content loader itself, so a draft cannot reach a
public URL, the sitemap, the RSS feed, or any index page. Draft pages also
carry `noindex, nofollow` while you preview them.

A draft previews at the URL it will have once it is live — `_drafts/` never
appears in the path. **To publish, move the file up one directory** into
`src/content/blog/`. Nothing else changes, and the URL stays the same.

In `.mdx` posts, import components through the `@components/*` alias rather
than a relative path, so imports keep working when the file moves:

```mdx
import Callout from '@components/content/Callout.astro';
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check (`astro check`) and build for production
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run audit:drafts` - Run deterministic quality checks against posts in `_drafts/`
- `npm run audit:posts` - Run the same checks against every post, published or draft
- `npm run screenshots` - Capture light/dark screenshots of key pages with Puppeteer (needs `npm run dev` running first)

## Quality checks on pull requests

Three GitHub Actions run automatically:

- **Editorial audit** (`.github/workflows/editorial-audit.yml`) - on PRs touching `src/content/blog/**`, checks changed posts for frontmatter, word counts, broken links, and readability, then adds a qualitative Claude Code review. Posts both as PR comments. Requires a `CLAUDE_CODE_OAUTH_TOKEN` repo secret.
- **Build check** (`.github/workflows/build-check.yml`) - on every PR, installs and builds under the same production-only conditions Netlify uses, so a build that would fail on deploy fails here first.
- **Lighthouse check** (`.github/workflows/lighthouse-check.yml`) - on every PR, runs Lighthouse against the homepage, blog index, and any changed post. Gates on Accessibility/Best Practices/SEO scoring 90+; Performance is reported, not gated.

## Customization

### Update Site Configuration

Edit `astro.config.mjs` to update your site URL:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',
  // ... other config
});
```

### Modify Theme Colors

Update CSS variables in `src/styles/global.css`:

```css
:root {
  --color-accent: #3b82f6;  /* Primary color */
  /* ... other variables */
}
```

### Update Social Links

Edit social links in `src/pages/index.astro`

## Deployment

This site deploys to Netlify, configured via `netlify.toml`: build command
`npm run build`, publish directory `dist`, Node 22. Push to `master` and
Netlify builds and deploys automatically; every PR also gets a preview
deploy. See the "Quality checks on pull requests" section above for the
build check that runs before a PR merges.

## Performance

This site is optimized for performance:

- Minimal JavaScript (only what's needed for dark mode and comments)
- Static site generation for fast page loads
- Optimized asset loading
- SEO-friendly markup

Measured locally against a production build (`npm run build && npm run preview`), Performance/Accessibility/Best Practices/SEO:

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Homepage | 100 | 100 | 96 | 100 |
| Blog post | 100 | 96 | 100 | 100 |

`netlify.toml` also runs `@netlify/plugin-lighthouse` on every Netlify deploy for the canonical, hosted-environment numbers.

## License

MIT License - feel free to use this as a template for your own site!

## Contact

- Website: [charlywebster.com](https://charlywebster.com)
- LinkedIn: [charlywebster](https://www.linkedin.com/in/charlywebster)
