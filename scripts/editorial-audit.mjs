#!/usr/bin/env node
/**
 * Editorial audit over blog posts.
 *
 * Computes deterministic quality metrics for hand-written MDX posts — the
 * kind of thing a human editor checks before a draft is promoted out of
 * `src/content/blog/_drafts/`: required frontmatter, word-count bounds,
 * broken internal links/images, prose hygiene (leftover placeholders,
 * invisible characters, em dashes — house style disallows them), readability
 * scores, sentence-length and
 * passive-voice heuristics, and phrasing repeated across posts.
 *
 * This script makes no network or LLM calls — it is pure text analysis, so
 * it has no API key requirement and runs the same locally and in CI. A
 * separate, qualitative pass can run on top of this report via the Claude
 * Code GitHub Action (see .github/workflows/editorial-audit.yml); that path
 * lives entirely in the workflow, not here.
 *
 * Usage:
 *   node scripts/editorial-audit.mjs                    # audit _drafts/, report to stdout
 *   node scripts/editorial-audit.mjs --all               # audit every post, drafts included
 *   node scripts/editorial-audit.mjs --files a.mdx,b.mdx # audit an explicit file list
 *   node scripts/editorial-audit.mjs --output report.md  # write markdown report to a file
 *   node scripts/editorial-audit.mjs --strict            # exit 1 when hard checks fail
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const DRAFTS_DIR = join(BLOG_DIR, '_drafts');
const PUBLIC_DIR = join(ROOT, 'public');

// Advisory target range — outside this, the post is flagged but the audit
// still passes under --strict. Tune to taste.
const TARGET_MIN_WORDS = 400;
const TARGET_MAX_WORDS = 2500;

// Hard bounds — outside this, --strict fails the audit. A post this short
// is likely an unfinished stub; a post this long likely needs splitting.
const HARD_MIN_WORDS = 150;
const HARD_MAX_WORDS = 5000;

const MAX_SENTENCE_WORDS = 45; // run-on sentence threshold
const REPEATED_NGRAM_SIZE = 4;
const REPEATED_NGRAM_MIN_DOCS = 3;

const PLACEHOLDER_MARKERS = /\b(TODO|FIXME|XXX|IMAGE PLACEHOLDER|lorem ipsum)\b/gi;
// House style: no em dashes. Use a period, comma, colon, semicolon, or
// parentheses instead.
const EM_DASH = /—/g;
// Zero-width space/joiner/non-joiner, BOM, word joiner, non-breaking space.
const INVISIBLE_CHARS = /[​‌‍﻿⁠ ]/g;
const IRREGULAR_PAST_PARTICIPLES = new Set([
  'been', 'done', 'made', 'written', 'given', 'taken', 'seen', 'known',
  'shown', 'held', 'told', 'sent', 'kept', 'built', 'found', 'thought',
  'brought', 'bought', 'caught', 'taught', 'sold', 'spent', 'left', 'meant',
  'read', 'said', 'paid', 'lost', 'won', 'run', 'grown', 'drawn', 'chosen',
]);

function parseArgs(argv) {
  const args = { dir: DRAFTS_DIR, all: false, files: null, output: null, strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') args.all = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--dir') args.dir = resolve(argv[++i]);
    else if (a === '--output') args.output = argv[++i];
    else if (a === '--files') args.files = argv[++i].split(',').map((f) => f.trim()).filter(Boolean);
  }
  return args;
}

async function collectFiles(args) {
  if (args.files) {
    return args.files.map((f) => resolve(ROOT, f))
      .filter((f) => existsSync(f) && /\.(md|mdx)$/.test(f));
  }
  const dir = args.all ? BLOG_DIR : args.dir;
  const out = [];
  async function walk(d) {
    for (const entry of await readdir(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) await walk(p);
      else if (/\.(md|mdx)$/.test(entry.name)) out.push(p);
    }
  }
  if (existsSync(dir)) await walk(dir);
  return out.sort();
}

function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content, metaError: 'no frontmatter block found' };
  try {
    const meta = yaml.load(match[1]) ?? {};
    return { meta, body: match[2] };
  } catch (err) {
    return { meta: {}, body: match[2], metaError: err.message };
  }
}

/** Strip code fences, MDX imports/JSX tags, and markdown syntax down to prose. */
function extractProse(body) {
  let text = body.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/^import\s.+$/gm, '');
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/<\/?[A-Za-z][^>]*>/g, ' ');
  text = text.replace(/[#*_`>|-]/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g) || [];
  let count = groups.length;
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) count -= 1;
  return Math.max(count, 1);
}

function splitSentences(prose) {
  return prose.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean);
}

function analyzeProse(prose) {
  const words = prose.split(/\s+/).filter(Boolean);
  const sentences = splitSentences(prose);
  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const avgSentenceLen = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount ? syllables / wordCount : 0;
  const fleschReadingEase = 206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord;
  const fleschKincaidGrade = 0.39 * avgSentenceLen + 11.8 * avgSyllablesPerWord - 15.59;

  const runOnSentences = sentences.filter((s) => s.split(/\s+/).filter(Boolean).length > MAX_SENTENCE_WORDS).length;

  let passiveHits = 0;
  for (const sentence of sentences) {
    const tokens = sentence.toLowerCase().split(/\s+/);
    for (let i = 0; i < tokens.length - 1; i++) {
      if (/^(am|is|are|was|were|be|been|being)$/.test(tokens[i])) {
        const next = tokens[i + 1].replace(/[^a-z]/g, '');
        if (next.endsWith('ed') || IRREGULAR_PAST_PARTICIPLES.has(next)) {
          passiveHits += 1;
          break;
        }
      }
    }
  }

  return {
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLen,
    fleschReadingEase,
    fleschKincaidGrade,
    runOnSentences,
    passiveSentencePct: sentences.length ? (passiveHits / sentences.length) * 100 : 0,
  };
}

const LINK_RE = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(?:src|href)="([^"]+)"/g;

function findLinkTargets(body) {
  const targets = new Set();
  let m;
  while ((m = LINK_RE.exec(body))) {
    const target = m[1] || m[2];
    if (target) targets.add(target);
  }
  return [...targets];
}

function checkLinks(body, knownSlugs) {
  const broken = [];
  const draftLinks = [];
  for (const target of findLinkTargets(body)) {
    if (/^(https?:|mailto:|#|\{)/.test(target)) continue;
    if (target.startsWith('/blog/')) {
      const slug = target.replace(/^\/blog\//, '').replace(/\/$/, '');
      const known = knownSlugs.get(slug);
      if (!known) broken.push(target);
      else if (known.isDraft) draftLinks.push(target);
      continue;
    }
    if (target.startsWith('/')) {
      if (!existsSync(join(PUBLIC_DIR, target))) broken.push(target);
      continue;
    }
    // Relative paths (rare in this codebase — components use @-aliased
    // imports) aren't resolvable without knowing the importer's location;
    // skip rather than guess.
  }
  return { broken, draftLinks };
}

function checkFrontmatter(meta, metaError) {
  const missing = [];
  if (metaError) missing.push(`unparsable frontmatter (${metaError})`);
  if (!meta.title) missing.push('title');
  if (!meta.description) missing.push('description');
  if (!meta.pubDate) missing.push('pubDate');
  const advisories = [];
  if (meta.pubDate && Number.isNaN(Date.parse(meta.pubDate))) missing.push('pubDate (unparsable date)');
  if (meta.description && (meta.description.length < 50 || meta.description.length > 160)) {
    advisories.push(`description is ${meta.description.length} chars (SEO target: 50-160)`);
  }
  if (!meta.tags || meta.tags.length === 0) advisories.push('no tags set');
  return { missing, advisories };
}

function repeatedNgrams(bodies, n, minDocs) {
  const docFreq = new Map();
  for (const body of bodies) {
    const words = extractProse(body).toLowerCase().split(/\s+/).filter(Boolean);
    const seen = new Set();
    for (let i = 0; i + n <= words.length; i++) {
      const gram = words.slice(i, i + n).join(' ');
      if (gram.length < 20) continue; // skip short/common function-word grams
      seen.add(gram);
    }
    for (const gram of seen) docFreq.set(gram, (docFreq.get(gram) || 0) + 1);
  }
  return [...docFreq.entries()].filter(([, count]) => count >= minDocs).map(([gram]) => gram);
}

async function auditPost(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const { meta, body, metaError } = splitFrontmatter(content);
  const prose = extractProse(body);
  const stats = analyzeProse(prose);
  const frontmatter = checkFrontmatter(meta, metaError);
  const invisibleJunk = (content.match(INVISIBLE_CHARS) || []).length;
  const placeholders = [...body.matchAll(PLACEHOLDER_MARKERS)].map((m) => m[0]);
  const emDashes = (body.match(EM_DASH) || []).length;
  const relPath = relative(BLOG_DIR, filePath).replace(/\\/g, '/');

  return {
    filePath,
    slug: relPath.replace(/^_drafts\//, '').replace(/\.(md|mdx)$/, ''),
    isDraft: relPath.startsWith('_drafts/'),
    meta,
    body,
    ...stats,
    hardViolation: stats.wordCount < HARD_MIN_WORDS || stats.wordCount > HARD_MAX_WORDS,
    outsideTargetRange: stats.wordCount < TARGET_MIN_WORDS || stats.wordCount > TARGET_MAX_WORDS,
    frontmatterMissing: frontmatter.missing,
    frontmatterAdvisories: frontmatter.advisories,
    invisibleJunk,
    placeholders,
    emDashes,
  };
}

function buildReport(posts) {
  const lines = [`# Editorial audit`, '', `Posts audited: ${posts.length}`, ''];
  if (posts.length === 0) {
    lines.push('No posts found — nothing to audit.', '');
    return { report: lines.join('\n'), hardFailures: [] };
  }

  const knownSlugs = new Map(posts.map((p) => [p.slug, { isDraft: p.isDraft }]));
  for (const p of posts) {
    const { broken, draftLinks } = checkLinks(p.body, knownSlugs);
    p.brokenLinks = broken;
    p.draftLinks = draftLinks;
  }

  const hardFailures = [];
  for (const p of posts) {
    if (p.frontmatterMissing.length) hardFailures.push(`${p.slug}: missing frontmatter — ${p.frontmatterMissing.join(', ')}`);
    if (p.hardViolation) hardFailures.push(`${p.slug}: word count ${p.wordCount} outside hard bounds [${HARD_MIN_WORDS}, ${HARD_MAX_WORDS}]`);
    if (p.brokenLinks.length) hardFailures.push(`${p.slug}: broken link(s) — ${p.brokenLinks.join(', ')}`);
    if (p.placeholders.length) hardFailures.push(`${p.slug}: placeholder marker(s) — ${[...new Set(p.placeholders)].join(', ')}`);
    if (p.emDashes > 0) hardFailures.push(`${p.slug}: ${p.emDashes} em dash(es) — house style is no em dashes`);
  }

  lines.push(`**Status: ${hardFailures.length ? `FAIL — ${hardFailures.length} issue(s)` : 'OK'}**`, '');

  if (posts.length >= 2) {
    const repeated = repeatedNgrams(posts.map((p) => p.body), REPEATED_NGRAM_SIZE, REPEATED_NGRAM_MIN_DOCS);
    if (repeated.length) {
      lines.push(`Phrases repeated across ${REPEATED_NGRAM_MIN_DOCS}+ posts: ${repeated.map((r) => `"${r}"`).join(', ')}`, '');
    }
  }

  lines.push('## Per-post detail', '');
  for (const p of posts) {
    lines.push(`### ${p.slug}${p.isDraft ? ' (draft)' : ''}`, '');
    lines.push(`- Words: ${p.wordCount} (target ${TARGET_MIN_WORDS}-${TARGET_MAX_WORDS})${p.outsideTargetRange ? ' ⚠ outside target range' : ''}${p.hardViolation ? ' ❌ outside hard bounds' : ''}`);
    lines.push(`- Sentences: ${p.sentenceCount}, avg length ${p.avgSentenceLen.toFixed(1)} words, run-on (>${MAX_SENTENCE_WORDS}w): ${p.runOnSentences}`);
    lines.push(`- Readability: Flesch Reading Ease ${p.fleschReadingEase.toFixed(1)}, Flesch-Kincaid grade ${p.fleschKincaidGrade.toFixed(1)}`);
    lines.push(`- Passive-voice sentences (heuristic): ${p.passiveSentencePct.toFixed(0)}%`);
    if (p.frontmatterMissing.length) lines.push(`- ❌ Missing/invalid frontmatter: ${p.frontmatterMissing.join(', ')}`);
    if (p.frontmatterAdvisories.length) lines.push(`- ⚠ Frontmatter advisories: ${p.frontmatterAdvisories.join(', ')}`);
    if (p.brokenLinks.length) lines.push(`- ❌ Broken links/images: ${p.brokenLinks.join(', ')}`);
    if (p.draftLinks.length) lines.push(`- ⚠ Links to still-draft posts: ${p.draftLinks.join(', ')}`);
    if (p.placeholders.length) lines.push(`- ❌ Placeholder markers found: ${[...new Set(p.placeholders)].join(', ')}`);
    if (p.emDashes > 0) lines.push(`- ❌ Em dashes found: ${p.emDashes} (house style: no em dashes)`);
    if (p.invisibleJunk > 0) lines.push(`- ⚠ Invisible/control characters: ${p.invisibleJunk}`);
    lines.push('');
  }

  return { report: lines.join('\n'), hardFailures };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = await collectFiles(args);
  const posts = await Promise.all(files.map(auditPost));
  const { report, hardFailures } = buildReport(posts);

  if (args.output) {
    writeFileSync(args.output, report);
    console.log(`Report written to ${args.output}`);
  } else {
    console.log(report);
  }

  if (args.strict && hardFailures.length) {
    console.error(`\nSTRICT: ${hardFailures.length} hard failure(s):`);
    for (const f of hardFailures) console.error(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
