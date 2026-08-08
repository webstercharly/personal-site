import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * True for a post that still lives in `src/content/blog/_drafts/`.
 *
 * Only ever true on the dev server: the loader drops drafts from production
 * builds, so nothing needs to filter on this to keep a draft off the live site.
 * Use it to mark a draft as such while you preview it.
 */
export function isDraft(post: Post): boolean {
  return post.filePath?.includes(`/_drafts/`) ?? false;
}

/** Every post the current build can see, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
