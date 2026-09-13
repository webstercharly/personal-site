import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SITE = 'https://www.charlywebster.com';

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

test('generated pages and feeds use the live www canonical host', async () => {
  const files = (await walk(DIST)).filter((file) => /\.(?:html|xml)$/.test(file));
  assert.ok(files.length > 0, 'expected a built site');

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    assert.doesNotMatch(
      contents,
      /https:\/\/charlywebster\.com/,
      `${file} contains the redirecting non-www host`,
    );
  }

  const homepage = await readFile(join(DIST, 'index.html'), 'utf8');
  assert.match(homepage, new RegExp(`<link rel="canonical" href="${SITE}/"`));
});

test('about page identifies Charly Webster and connects public profiles', async () => {
  const html = await readFile(join(DIST, 'about/index.html'), 'utf8');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  assert.match(text, /Charly Webster/);
  assert.match(text, /Head of AI Engineering/);
  assert.match(text, /M&amp;S|M&S/);
  assert.match(html, /https:\/\/www\.linkedin\.com\/in\/charlywebster/);
  assert.match(html, /https:\/\/github\.com\/webstercharly/);

  const schemas = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const profile = schemas.find((schema) => schema['@type'] === 'ProfilePage');

  assert.ok(profile, 'expected ProfilePage structured data');
  assert.equal(profile.url, `${SITE}/about/`);
  assert.equal(profile.mainEntity?.['@type'], 'Person');
  assert.equal(profile.mainEntity?.name, 'Charly Webster');
  assert.equal(profile.mainEntity?.jobTitle, 'Head of AI Engineering');
  assert.equal(profile.mainEntity?.worksFor?.name, 'M&S');
  assert.equal(profile.mainEntity?.worksFor?.url, 'https://www.marksandspencer.com/');
  assert.deepEqual(profile.mainEntity?.sameAs, [
    'https://www.linkedin.com/in/charlywebster',
    'https://github.com/webstercharly',
  ]);
});

test('blog posts reference the same public Person entity', async () => {
  const html = await readFile(join(DIST, 'blog/astro-5-to-7-upgrade/index.html'), 'utf8');
  const schemas = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const article = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  const personId = `${SITE}/about/#charly-webster`;

  assert.ok(article, 'expected BlogPosting structured data');
  assert.equal(article.author?.['@id'], personId);
  assert.equal(article.publisher?.['@id'], personId);
  assert.equal(article.mainEntityOfPage?.['@id'], `${SITE}/blog/astro-5-to-7-upgrade/`);
  assert.equal(article.image, `${SITE}/og/posts/astro-5-to-7-upgrade.png`);
});
