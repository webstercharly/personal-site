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

- **Framework**: Astro 4.x
- **Language**: TypeScript (strict mode)
- **Styling**: Custom CSS with CSS variables for theming
- **Content**: Markdown/MDX for blog posts
- **Comments**: giscus (GitHub Discussions)
- **Deployment**: Ready for Vercel, Netlify, or Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

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
│   │   └── Navigation.astro
│   ├── content/
│   │   ├── blog/         # Blog posts (Markdown/MDX)
│   │   └── config.ts     # Content collection schemas
│   ├── layouts/
│   │   └── BaseLayout.astro  # Base HTML layout
│   ├── pages/
│   │   ├── index.astro       # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro   # Blog listing
│   │   │   └── [...slug].astro  # Blog post template
│   │   └── rss.xml.ts        # RSS feed
│   └── styles/
│       └── global.css        # Global styles and theme
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
draft: false  # Set to true to hide from production
---

Your content goes here...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands

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

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Deploy (zero configuration needed)

### Netlify

1. Push to GitHub
2. Connect repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Cloudflare Pages

1. Push to GitHub
2. Create new Pages project
3. Build command: `npm run build`
4. Build output directory: `dist`

## Performance

This site is optimized for performance:

- Minimal JavaScript (only what's needed for dark mode and comments)
- Static site generation for fast page loads
- Optimized asset loading
- SEO-friendly markup

Expected Lighthouse scores: 95+ across all metrics

## License

MIT License - feel free to use this as a template for your own site!

## Contact

- Website: [charlywebster.com](https://charlywebster.com)
- Twitter: [@webstercharly](https://twitter.com/webstercharly)
- LinkedIn: [charly-webster](https://www.linkedin.com/in/charly-webster)
- Email: webstercharly@gmail.com
