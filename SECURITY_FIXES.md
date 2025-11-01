# Security Fixes Checklist

This document provides **ready-to-implement** fixes for the security issues identified in the code review.

---

## 🔴 CRITICAL - Fix Before Deployment

### 1. Add Content Security Policy

**File to modify:** `src/layouts/BaseLayout.astro`

Add after line 32 (after viewport meta tag):

```astro
<!-- Security Headers -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://giscus.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://giscus.app; connect-src 'self' https://giscus.app;" />
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

---

### 2. Validate localStorage Theme

**File to modify:** `src/layouts/BaseLayout.astro`

Replace lines 63-66 with:

```javascript
const theme = (() => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('theme');
    // Validate that stored value is one of our expected values
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
})();
```

---

### 3. Move Giscus Config to Environment Variables

**Step 1:** Create `.env` file:

```bash
PUBLIC_GISCUS_REPO=webstercharly/personal-site
PUBLIC_GISCUS_REPO_ID=your_repo_id_here
PUBLIC_GISCUS_CATEGORY=Blog Comments
PUBLIC_GISCUS_CATEGORY_ID=your_category_id_here
```

**Step 2:** Update `src/pages/blog/[...slug].astro` lines 122-127:

```javascript
const giscusAttributes = {
  src: 'https://giscus.app/client.js',
  'data-repo': import.meta.env.PUBLIC_GISCUS_REPO || '',
  'data-repo-id': import.meta.env.PUBLIC_GISCUS_REPO_ID || '',
  'data-category': import.meta.env.PUBLIC_GISCUS_CATEGORY || 'Comments',
  'data-category-id': import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || '',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'top',
  'data-theme': giscusTheme,
  'data-lang': 'en',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
  async: '',
};

// Validate configuration before loading
if (!import.meta.env.PUBLIC_GISCUS_REPO_ID || !import.meta.env.PUBLIC_GISCUS_CATEGORY_ID) {
  console.warn('Giscus not configured. Comments will not load.');
} else {
  const giscusScript = document.createElement('script');
  Object.entries(giscusAttributes).forEach(([key, value]) => {
    giscusScript.setAttribute(key, value);
  });
  document.getElementById('giscus-container')?.appendChild(giscusScript);
}
```

**Step 3:** Update `.env.example`:

Already done! Just add your actual values to `.env` (which is gitignored).

---

### 4. Add Message Validation for postMessage

**File to modify:** `src/pages/blog/[...slug].astro`

Add after line 164:

```javascript
// Validate incoming messages from giscus iframe
window.addEventListener('message', (event) => {
  // Only accept messages from giscus
  if (event.origin !== 'https://giscus.app') {
    return;
  }
  // Log for debugging (remove in production)
  console.debug('Received message from giscus:', event.data);
});
```

---

### 5. Delete Large Background Image

```bash
git rm public/images/background.jpg
```

If you need a background, optimize it first:

```bash
# Using ImageMagick (if available)
convert background.jpg -quality 75 -resize 1920x1080 background-optimized.jpg

# Or use online tools like TinyPNG, Squoosh
```

---

## 🟡 HIGH PRIORITY - Should Fix Soon

### 6. Add Subresource Integrity

**Option A: Self-host fonts (Recommended)**

```bash
npm install @fontsource/inter @fontsource/jetbrains-mono
```

Then in `BaseLayout.astro`, remove Google Fonts link and add to global.css:

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';
```

**Option B: Keep Google Fonts but add font-display**

Update line 84 in `BaseLayout.astro`:

```astro
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

---

### 7. Obfuscate Email Address

**File to modify:** `src/pages/index.astro`

Replace line 83 and 100 with a contact form component or obfuscated mailto:

```astro
<a
  href="#"
  onclick="location.href='mailto:' + 'webstercharly' + '@' + 'gmail.com'; return false;"
  class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  aria-label="Email"
>
  <img src="/images/email.png" alt="Email" class="w-6 h-6" />
</a>
```

---

### 8. Add Security Headers (Hosting Platform)

**For Netlify** - Create `public/_headers`:

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-XSS-Protection: 1; mode=block
```

**For Vercel** - Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 🟢 MEDIUM PRIORITY - Improve Quality

### 9. Add Skip-to-Content Link

**File to modify:** `src/components/Navigation.astro`

Add before the `<nav>` tag:

```astro
<!-- Accessibility: Skip to main content -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
>
  Skip to main content
</a>
```

Add to `global.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

Then add `id="main-content"` to the `<main>` tag in each page.

---

### 10. Add Focus Indicators

**File to modify:** `src/styles/global.css`

Add after line 145:

```css
/* Focus indicators for keyboard navigation */
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

button:focus-visible,
a:focus-visible {
  outline-offset: 4px;
}
```

---

### 11. Add Image Lazy Loading

**File to modify:** `src/pages/index.astro`

Update line 24-28:

```astro
<img
  src="/images/author.jpg"
  alt="Charly Webster"
  loading="eager"
  decoding="async"
  class="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
/>
```

For all other images, use `loading="lazy"`.

---

### 12. Create 404 Page

**Create file:** `src/pages/404.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Navigation from '../components/Navigation.astro';
---

<BaseLayout
  title="Page Not Found - Charly Webster"
  description="The page you're looking for doesn't exist."
>
  <Navigation />

  <main id="main-content" class="container py-20">
    <div class="max-w-2xl mx-auto text-center">
      <h1 class="text-6xl font-bold mb-6 text-gray-900 dark:text-white">404</h1>
      <p class="text-2xl mb-8 text-gray-700 dark:text-gray-300">
        Page Not Found
      </p>
      <p class="text-lg mb-12 text-gray-600 dark:text-gray-400">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <div class="flex gap-4 justify-center">
        <a
          href="/"
          class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Go Home
        </a>
        <a
          href="/blog"
          class="px-8 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          Read Blog
        </a>
      </div>
    </div>
  </main>
</BaseLayout>
```

---

### 13. Create robots.txt

**Create file:** `public/robots.txt`

```
User-agent: *
Allow: /

# Sitemap
Sitemap: https://charlywebster.com/sitemap-index.xml

# Don't index drafts or test pages
Disallow: /drafts/
Disallow: /test/
```

---

## 🔵 LOW PRIORITY - Nice to Have

### 14. Extract Magic Numbers

**Create file:** `src/lib/constants.ts`

```typescript
export const READING_SPEED_WPM = 200;
export const RECENT_POSTS_COUNT = 3;

export const BREAKPOINTS = {
  mobile: 515,
  tablet: 768,
  desktop: 1200,
} as const;
```

Then use in `src/pages/blog/[...slug].astro`:

```typescript
import { READING_SPEED_WPM } from '../../lib/constants';

const readingTime = Math.ceil(entry.body.split(/\s+/).length / READING_SPEED_WPM);
```

---

### 15. Extract Theme Logic

**Create file:** `src/lib/theme.ts`

```typescript
export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

export function initTheme(): void {
  const theme = getStoredTheme() ?? getSystemTheme();
  setTheme(theme);
}

export function toggleTheme(): void {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}
```

---

## Testing Checklist

After implementing fixes:

- [ ] Run `npm run build` successfully
- [ ] Test dark mode toggle
- [ ] Test keyboard navigation (Tab through all interactive elements)
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Test on mobile device
- [ ] Verify CSP doesn't break functionality (check browser console)
- [ ] Verify giscus comments load correctly
- [ ] Test 404 page
- [ ] Run Lighthouse audit (aim for 90+ in all categories)
- [ ] Check accessibility with axe DevTools
- [ ] Verify all external links open in new tab
- [ ] Test with JavaScript disabled (graceful degradation)

---

## Deployment Checklist

Before deploying to production:

- [ ] All CRITICAL fixes applied
- [ ] Environment variables set on hosting platform
- [ ] Security headers configured
- [ ] HTTPS enabled and forced
- [ ] Custom domain configured
- [ ] DNS records set up
- [ ] Sitemap submitted to search engines
- [ ] Analytics configured (if desired)
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring set up (optional)

---

## Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [web.dev Accessibility](https://web.dev/accessible/)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
