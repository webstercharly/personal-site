import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://charlywebster.com', // Update with your actual domain
  integrations: [
    mdx(),
    sitemap(),
    tailwind({ applyBaseStyles: false }), // Don't apply base styles, we have our own
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
