import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const DRAFT_DIR = '_drafts';

/**
 * Posts in `src/content/blog/_drafts/` are excluded from production builds, so
 * a draft cannot reach the sitemap, the feed, or a public URL. The dev server
 * still loads them, so you can preview a draft while you write it.
 *
 * To publish a post, move the file up one directory into `src/content/blog/`.
 * Its URL does not change: `generateId` strips the `_drafts/` prefix, so a
 * draft previews at the same path it will have once it is live.
 */
const blog = defineCollection({
  loader: glob({
    pattern: import.meta.env.DEV
      ? '**/*.{md,mdx}'
      : ['**/*.{md,mdx}', `!${DRAFT_DIR}/**`],
    base: './src/content/blog',
    generateId: ({ entry }) =>
      entry.replace(new RegExp(`^${DRAFT_DIR}/`), '').replace(/\.[^.]+$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Charly Webster'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
