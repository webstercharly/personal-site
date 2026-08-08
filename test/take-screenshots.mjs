import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'http://localhost:4321';
const OUTPUT_DIR = './screenshots';

const pages = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
];

const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

const themes = ['light', 'dark'];

async function takeScreenshots() {
  // Create screenshots directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    for (const viewport of viewports) {
      console.log(`\nSetting viewport to ${viewport.name} (${viewport.width}x${viewport.height})`);
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 2, // Retina display
      });

      for (const theme of themes) {
        console.log(`  Theme: ${theme}`);

        // Set color scheme preference
        await page.emulateMediaFeatures([
          {
            name: 'prefers-color-scheme',
            value: theme,
          },
        ]);

        // The site persists its resolved theme to localStorage and prefers
        // that over prefers-color-scheme on load, so clear it here or the
        // previous iteration's theme sticks regardless of emulation.
        await page.evaluateOnNewDocument(() => {
          window.localStorage.removeItem('theme');
        });

        for (const pageConfig of pages) {
          const url = `${BASE_URL}${pageConfig.path}`;
          console.log(`    Capturing: ${pageConfig.name}`);

          try {
            await page.goto(url, {
              waitUntil: 'networkidle2',
              timeout: 30000,
            });

            // Wait a bit for animations/transitions
            await new Promise(resolve => setTimeout(resolve, 1000));

            const filename = `${pageConfig.name}-${viewport.name}-${theme}.png`;
            const filepath = join(OUTPUT_DIR, filename);

            await page.screenshot({
              path: filepath,
              fullPage: true,
            });

            console.log(`      ✓ Saved: ${filename}`);
          } catch (error) {
            console.error(`      ✗ Failed to capture ${pageConfig.name}:`, error.message);
          }
        }
      }
    }

    console.log(`\n✓ All screenshots saved to ${OUTPUT_DIR}/`);
  } finally {
    await browser.close();
  }
}

// Run the script
console.log('Starting screenshot capture...');
console.log(`Target URL: ${BASE_URL}`);
console.log(`Make sure your dev server is running at ${BASE_URL}\n`);

takeScreenshots().catch((error) => {
  console.error('Failed to take screenshots:', error);
  process.exit(1);
});
