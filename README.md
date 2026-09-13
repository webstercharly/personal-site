# Charly Webster’s personal site

This is the source for [charlywebster.com](https://www.charlywebster.com): a small personal site and blog built with Astro.

The site is intentionally simple. Posts live in Markdown or MDX, the site is statically generated, and the browser only gets JavaScript where it earns its place.

The visual direction was inspired by [Cassidy Williams’ site](https://cassidoo.co/). No code was used from it; the design and implementation here are original.

## What is here

- Astro 7 with TypeScript
- Markdown and MDX blog posts with typed content collections
- Dark mode with system preference detection
- GitHub Discussions comments through [giscus](https://giscus.app/)
- RSS at `/rss.xml`
- Open Graph and Twitter metadata
- Build-time social cards for the homepage and posts
- Local SVG icons rather than an icon library
- Responsive layouts and accessibility checks
- Netlify deployment from `master`

## Stack

- **Framework:** [Astro](https://astro.build) 7
- **Language:** TypeScript in strict mode
- **Styling:** Tailwind CSS 4 and custom CSS variables
- **Content:** Markdown and MDX
- **Comments:** giscus and GitHub Discussions
- **Deployment:** Netlify

## Run it locally

You need Node.js 22.12 or newer and npm.

```bash
git clone https://github.com/webstercharly/personal-site.git
cd personal-site
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

To check the production build locally:

```bash
npm run build
npm run test:site
npm run validate:site
npm run preview
```

The site validator checks every generated HTML page for broken internal links,
missing assets, invalid fragments, canonical URLs, and required SEO/social metadata.

## Comments with giscus

The blog uses giscus to turn GitHub Discussions into a comment system.

1. Enable Discussions on the repository.
2. Install and configure the giscus app at [giscus.app](https://giscus.app/).
3. Copy the repository and category IDs into `src/pages/blog/[...slug].astro`:

```javascript
'data-repo': 'webstercharly/personal-site',
'data-repo-id': 'YOUR_REPO_ID',
'data-category': 'Blog Comments',
'data-category-id': 'YOUR_CATEGORY_ID',
```

## Project layout

```text
/
├── public/
│   ├── images/              # Static images
│   └── favicon.svg          # Site favicon
├── src/
│   ├── components/
│   │   ├── content/         # Components used inside MDX posts
│   │   ├── Icon.astro       # Named icon component
│   │   ├── icons.ts         # Icon registry
│   │   └── Navigation.astro
│   ├── content/blog/        # Published Markdown/MDX posts
│   │   └── _drafts/         # Drafts, excluded from production
│   ├── content.config.ts    # Content schema and loader
│   ├── icons/               # Local Lucide SVGs
│   ├── layouts/             # Shared page layouts
│   ├── lib/                 # Site constants and post helpers
│   ├── pages/               # Routes and page templates
│   └── styles/              # Global styles and theme variables
├── scripts/
│   ├── editorial-audit.mjs  # Deterministic post checks
│   └── validate-site.mjs    # Generated links and metadata checks
├── .github/workflows/       # Editorial, build and Lighthouse checks
├── astro.config.mjs
├── netlify.toml
├── package.json
└── tsconfig.json
```

## Writing a post

Use Markdown by default. Create a `.md` file in `src/content/blog/` for an ordinary post:

```markdown
---
title: 'A useful title'
description: 'A short description of the post'
pubDate: 2026-01-15
author: 'Charly Webster'
tags: ['engineering', 'architecture']
---

The post starts here.
```

Use `.mdx` only when the post needs an Astro component, a JavaScript expression or another MDX feature. This keeps plain writing portable and makes the extra compilation layer an explicit choice rather than the default.

### Drafts

The directory controls publication status. There is no `draft` frontmatter flag.

| Location | Production build | Development server |
| --- | --- | --- |
| `src/content/blog/` | Published | Shown |
| `src/content/blog/_drafts/` | Excluded | Shown with a preview banner |

The production loader excludes `_drafts`, so a draft does not get a page, sitemap entry, RSS entry or listing entry. Preview drafts keep the URL they will have when published and are marked `noindex, nofollow`.

To publish a draft, move it into `src/content/blog/`. In an MDX post, use the `@components/*` alias for component imports:

```mdx
import Callout from '@components/content/Callout.astro';
```

## Commands

```bash
npm run dev          # Start the development server
npm run build        # Type-check and build for production
npm run preview      # Serve the production build locally
npm run astro        # Run Astro CLI commands
npm run audit:drafts # Check posts in _drafts/
npm run audit:posts  # Check every post
npm run screenshots   # Capture key-page screenshots
```

The screenshot command expects the development server to be running first.

## Checks on pull requests

GitHub Actions runs three checks:

- **Editorial audit** checks frontmatter, word counts, links and readability for changed posts. It also requests a qualitative Claude Code review. This needs the `CLAUDE_CODE_OAUTH_TOKEN` repository secret.
- **Build check** runs `npm run build` under the same production conditions used by Netlify.
- **Lighthouse check** checks the homepage, blog index and changed posts. Accessibility, Best Practices and SEO must score at least 90. Performance is reported but does not block the pull request.

## Configuration

Set the canonical site URL in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://www.charlywebster.com',
});
```

Theme colours and typography are in `src/styles/global.css`. The main accent variables are:

```css
:root {
  --color-accent-green: #27b467;
  --color-accent-pink: #e8548f;
  --color-accent-yellow: #e6b93f;
}
```

Social links are defined on the homepage in `src/pages/index.astro`.

## Deployment

Netlify is configured in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 22

Pushes to `master` trigger the production deploy. Pull requests get deploy previews.

## Performance

The site is statically generated and keeps client-side JavaScript small. The remaining scripts handle things such as theme switching, the shared per-load accent colour and comments.

The current local Lighthouse snapshot is recorded here as a useful baseline, not a permanent promise:

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Homepage | 100 | 100 | 96 | 100 |
| Blog post | 100 | 96 | 100 | 100 |

Netlify also runs `@netlify/plugin-lighthouse` after deployment.

## License

MIT. Use it as a starting point if it is useful.

## Contact

- [Website](https://www.charlywebster.com)
- [LinkedIn](https://www.linkedin.com/in/charlywebster)
- [GitHub](https://github.com/webstercharly)
