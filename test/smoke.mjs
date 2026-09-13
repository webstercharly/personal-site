import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4321';
const accentColours = new Set([
  'rgb(39, 180, 103)',
  'rgb(232, 84, 143)',
  'rgb(230, 185, 63)',
  'rgb(69, 213, 130)',
  'rgb(250, 114, 168)',
  'rgb(242, 202, 91)',
]);

async function openWithRetry(page, path, attempts = 20) {
  const url = new URL(path, baseUrl).toString();
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10_000 });
      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw lastError;
}

function findArmBrowser() {
  for (const command of ['chromium', 'google-chrome', 'chromium-browser']) {
    try {
      return execFileSync('which', [command], { encoding: 'utf8' }).trim();
    } catch {
      // Try the next browser name.
    }
  }
  return undefined;
}

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  ?? (process.arch === 'arm64' ? findArmBrowser() : undefined);

const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();

  for (const path of ['/', '/blog/', '/blog/astro-5-to-7-upgrade/', '/rss.xml']) {
    const response = await openWithRetry(page, path);
    assert.equal(response?.status(), 200, `${path} should return 200`);
    console.log(`✓ ${path} returned 200`);
  }

  const draftResponse = await openWithRetry(page, '/blog/mdx-components-showcase/');
  assert.equal(draftResponse?.status(), 404, 'Draft posts should not exist in production');
  console.log('✓ draft post returned 404');

  await openWithRetry(page, '/');
  const accents = await page.evaluate(() => {
    const dot = document.querySelector('.wordmark span');
    const portrait = document.querySelector('.portrait-accent');
    return {
      dot: dot ? getComputedStyle(dot).color : null,
      portrait: portrait ? getComputedStyle(portrait).backgroundColor : null,
    };
  });
  assert.ok(accents.dot, 'Logo dot should exist');
  assert.equal(accents.dot, accents.portrait, 'Logo dot and portrait accent should match');
  assert.ok(accentColours.has(accents.dot), `Unexpected accent colour: ${accents.dot}`);
  console.log(`✓ shared accent colour is ${accents.dot}`);

  const initialDarkMode = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.click('#theme-toggle');
  const toggledDarkMode = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  assert.notEqual(toggledDarkMode, initialDarkMode, 'Theme toggle should change the active theme');
  console.log('✓ theme toggle changed the active theme');
} finally {
  await browser.close();
}
