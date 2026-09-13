#!/usr/bin/env node
import { lstat, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SITE = 'https://www.charlywebster.com';

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return result;
}

function metadata(html) {
  const values = new Map();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    const key = (attrs.name ?? attrs.property)?.toLowerCase();
    if (key && !values.has(key)) values.set(key, attrs.content ?? '');
  }
  return values;
}

function publicPath(root, file) {
  const path = relative(root, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  if (path === '404.html') return '/404/';
  if (path.endsWith('/index.html')) return `/${path.slice(0, -10)}`;
  if (path.endsWith('.html')) return `/${path.slice(0, -5)}`;
  return `/${path}`;
}

async function isFile(path) {
  try {
    return (await lstat(path)).isFile();
  } catch {
    return false;
  }
}

async function targetFile(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const clean = decoded.replace(/^\/+/, '');
  const absolute = resolve(root, clean);
  if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) return null;

  const candidates = pathname.endsWith('/')
    ? [join(absolute, 'index.html'), `${absolute}.html`]
    : extname(pathname)
      ? [absolute]
      : [absolute, `${absolute}.html`, join(absolute, 'index.html')];
  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

function pageTags(html) {
  return html.match(/<(?:a|img|source|script|link)\b[^>]*>/gi) ?? [];
}

function pageAnchors(html) {
  const anchors = new Set();
  for (const tag of html.match(/<[^>]+>/g) ?? []) {
    const attrs = attributes(tag);
    const tagName = tag.match(/^<(\w+)/)?.[1].toLowerCase();
    if (attrs.id) anchors.add(attrs.id);
    if (tagName === 'a' && attrs.name) anchors.add(attrs.name);
  }
  return anchors;
}

export async function validateSite(directory, site = DEFAULT_SITE) {
  const root = resolve(directory);
  const origin = new URL(site).origin;
  const htmlFiles = (await walk(root)).filter((file) => file.endsWith('.html'));
  const errors = [];
  if (htmlFiles.length === 0) return ['no HTML pages found'];
  const canonicalOwners = new Map();
  const htmlCache = new Map();

  const report = (file, message) => errors.push(`${relative(root, file)}: ${message}`);

  async function validateReference(file, pageUrl, value, kind) {
    if (!value || /^(?:mailto:|tel:|data:|javascript:)/i.test(value)) return;
    let url;
    try {
      url = new URL(value, pageUrl);
    } catch {
      report(file, `invalid ${kind}: ${value}`);
      return;
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) return;

    const target = await targetFile(root, url.pathname);
    if (!target) {
      report(file, `broken internal ${kind}: ${value}`);
      return;
    }

    if (kind === 'link' && url.hash) {
      const targetHtml = target.endsWith('.html')
        ? (htmlCache.get(target) ?? await readFile(target, 'utf8'))
        : '';
      htmlCache.set(target, targetHtml);
      let anchor;
      try {
        anchor = decodeURIComponent(url.hash.slice(1));
      } catch {
        report(file, `invalid fragment: ${url.hash}`);
        return;
      }
      if (targetHtml && !pageAnchors(targetHtml).has(anchor)) {
        report(file, `missing fragment #${anchor} in ${value}`);
      }
    }
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    htmlCache.set(file, html);
    const path = publicPath(root, file);
    const pageUrl = new URL(path, origin);
    const meta = metadata(html);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() ?? '';
    const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? [])
      .map(attributes)
      .find((attrs) => attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
    const canonical = canonicalTag?.href ?? '';

    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) report(file, 'missing html lang attribute');
    if (!title) report(file, 'missing title');
    if (!meta.get('description')) report(file, 'missing meta description');
    if (!canonical) report(file, 'missing canonical URL');

    const expectedCanonical = new URL(path, origin).toString();
    if (canonical && canonical !== expectedCanonical) {
      report(file, `canonical URL must be ${expectedCanonical}`);
    }
    if (canonical) {
      if (canonicalOwners.has(canonical)) report(file, `duplicate canonical URL also used by ${canonicalOwners.get(canonical)}`);
      else canonicalOwners.set(canonical, relative(root, file));
    }

    for (const key of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image',
      'twitter:card', 'twitter:url', 'twitter:title', 'twitter:description', 'twitter:image']) {
      if (!meta.get(key)) report(file, `missing ${key}`);
    }
    if (canonical && meta.get('og:url') && meta.get('og:url') !== canonical) report(file, 'og:url must match canonical URL');
    if (canonical && meta.get('twitter:url') && meta.get('twitter:url') !== canonical) report(file, 'twitter:url must match canonical URL');
    if (title && meta.get('og:title') && meta.get('og:title') !== title) report(file, 'og:title must match title');
    if (title && meta.get('twitter:title') && meta.get('twitter:title') !== title) report(file, 'twitter:title must match title');
    if (meta.get('description') && meta.get('og:description') !== meta.get('description')) report(file, 'og:description must match meta description');
    if (meta.get('description') && meta.get('twitter:description') !== meta.get('description')) report(file, 'twitter:description must match meta description');

    for (const key of ['og:image', 'twitter:image']) {
      if (meta.get(key)) await validateReference(file, pageUrl, meta.get(key), 'asset');
    }

    for (const tag of pageTags(html)) {
      const attrs = attributes(tag);
      const tagName = tag.match(/^<(\w+)/)?.[1].toLowerCase();
      if (tagName === 'a' && attrs.href) await validateReference(file, pageUrl, attrs.href, 'link');
      if ((tagName === 'img' || tagName === 'script') && attrs.src) await validateReference(file, pageUrl, attrs.src, 'asset');
      if ((tagName === 'img' || tagName === 'source') && attrs.srcset && !attrs.srcset.startsWith('data:')) {
        for (const candidate of attrs.srcset.split(',')) {
          const url = candidate.trim().split(/\s+/)[0];
          if (url) await validateReference(file, pageUrl, url, 'asset');
        }
      }
      if (tagName === 'link' && attrs.href && attrs.rel !== 'canonical') await validateReference(file, pageUrl, attrs.href, 'asset');
    }
  }

  return [...new Set(errors)].sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = resolve(process.argv[2] ?? 'dist');
  const errors = await validateSite(directory, process.env.SITE_URL ?? DEFAULT_SITE);
  if (errors.length) {
    console.error(`Site validation failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    const pageCount = (await walk(directory)).filter((file) => file.endsWith('.html')).length;
    console.log(`Site validation passed for ${pageCount} HTML page(s).`);
  }
}
