import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog');
  const posts = blog
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: "Charly Webster's Blog",
    description: 'Insights on engineering leadership, software architecture, and building high-performing teams.',
    site: context.site ?? 'https://charlywebster.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: '<language>en-us</language>',
  });
}
