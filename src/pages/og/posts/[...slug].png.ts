import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts } from '../../../lib/posts';
import { generateSocialCard } from '../../../lib/social-image';

interface SocialCardProps {
  title: string;
  label: string;
}

export const getStaticPaths = (async () => {
  const posts = await getPosts();

  return posts.map((post) => ({
      params: { slug: post.id },
      props: {
        title: post.data.title,
        label: 'CHARLY WEBSTER / LATEST WRITING',
      } satisfies SocialCardProps,
    }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { title, label } = props as SocialCardProps;
  const image = await generateSocialCard({ title, label });

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
