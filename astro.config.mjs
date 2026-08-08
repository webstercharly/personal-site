import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://charlywebster.com',
  devToolbar: {
    enabled: false
  },
  integrations: [
    // Must come before mdx() so it can process code blocks in .mdx files.
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      themeCssSelector: (theme) => (theme.name === 'github-dark' ? '.dark' : ':root'),
      defaultProps: {
        wrap: true,
      },
      styleOverrides: {
        borderRadius: '0.75rem',
        borderColor: 'var(--color-border)',
        codeFontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', 'Courier New', monospace",
        codeFontSize: '0.875rem',
        codeLineHeight: '1.7',
        codePaddingBlock: '1.25rem',
        codePaddingInline: '1.5rem',
      },
    }),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
