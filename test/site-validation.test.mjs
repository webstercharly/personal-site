import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { validateSite } from '../scripts/validate-site.mjs';

const SITE = 'https://www.charlywebster.com';

function html(path, body = '') {
  const url = `${SITE}${path}`;
  const title = path === '/' ? 'Home' : 'About';
  return `<!doctype html><html lang="en"><head>
    <title>${title}</title>
    <meta name="description" content="A useful page description">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="A useful page description">
    <meta property="og:image" content="${SITE}/og/site.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="A useful page description">
    <meta name="twitter:image" content="${SITE}/og/site.png">
  </head><body>${body}</body></html>`;
}

async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), 'site-validation-'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

test('accepts valid metadata and internal links', async (t) => {
  const root = await fixture({
    'index.html': html('/', '<a href="/about/">About</a><img src="/images/photo.webp">'),
    'about/index.html': html('/about/'),
    '404.html': html('/404/'),
    'images/photo.webp': 'image',
    'og/site.png': 'image',
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  assert.deepEqual(await validateSite(root, SITE), []);
});

test('reports broken internal links and assets', async (t) => {
  const root = await fixture({
    'index.html': html('/', '<a href="/missing/">Missing</a><a href="/empty">Empty directory</a><img src="/images/missing.webp"><source srcset="/images/missing-2.webp 2x">'),
    'og/site.png': 'image',
  });
  await mkdir(join(root, 'empty'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const errors = await validateSite(root, SITE);
  assert.ok(errors.some((error) => error.includes('broken internal link: /missing/')));
  assert.ok(errors.some((error) => error.includes('broken internal link: /empty')));
  assert.ok(errors.some((error) => error.includes('broken internal asset: /images/missing.webp')));
  assert.ok(errors.some((error) => error.includes('broken internal asset: /images/missing-2.webp')));
});

test('reports missing and inconsistent metadata', async (t) => {
  const root = await fixture({
    'index.html': `<!doctype html><html><head>
      <title>Home</title>
      <link rel="canonical" href="${SITE}/wrong/">
      <meta property="og:url" content="${SITE}/different/">
    </head><body></body></html>`,
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const errors = await validateSite(root, SITE);
  assert.ok(errors.some((error) => error.includes('missing meta description')));
  assert.ok(errors.some((error) => error.includes(`canonical URL must be ${SITE}/`)));
  assert.ok(errors.some((error) => error.includes('og:url must match canonical URL')));
  assert.ok(errors.some((error) => error.includes('missing twitter:card')));
});

test('reports malformed fragments without crashing', async (t) => {
  const root = await fixture({
    'index.html': html('/', '<a href="#bad%ZZ">Broken fragment</a>'),
    'og/site.png': 'image',
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const errors = await validateSite(root, SITE);
  assert.ok(errors.some((error) => error.includes('invalid fragment: #bad%ZZ')));
});

test('does not treat metadata names as fragment anchors', async (t) => {
  const root = await fixture({
    'index.html': html('/', '<a href="#description">Broken fragment</a>'),
    'og/site.png': 'image',
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const errors = await validateSite(root, SITE);
  assert.ok(errors.some((error) => error.includes('missing fragment #description')));
});

test('rejects an empty build output', async (t) => {
  const root = await fixture({});
  t.after(() => rm(root, { recursive: true, force: true }));

  assert.deepEqual(await validateSite(root, SITE), ['no HTML pages found']);
});
