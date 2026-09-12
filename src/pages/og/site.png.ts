import type { APIRoute } from 'astro';
import { generateSocialCard } from '../../lib/social-image';

export const GET: APIRoute = async () => {
  const image = await generateSocialCard({
    title: 'Behind better experiences.',
    label: 'CHARLY WEBSTER / PERSONAL SITE',
  });

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
