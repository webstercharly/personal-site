// Lighthouse CI config for the "Lighthouse check" GitHub Action.
//
// The URL list below is the always-checked baseline (homepage, blog index).
// The workflow appends whichever blog post(s) a PR actually touches via
// repeated --collect.url flags, which override this array rather than
// merging with it, so the baseline is duplicated there intentionally.
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4321/', 'http://localhost:4321/blog/'],
      // Force the port explicitly rather than trusting Astro's default: if
      // something else is already on 4321, Astro silently falls back to the
      // next free port instead of failing, which would desync the server's
      // real address from the URLs above with no error to catch it.
      startServerCommand: 'npm run preview -- --port 4321',
      startServerReadyPattern: 'Preview server running',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless=new --no-sandbox --disable-gpu',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Performance is reported, not gated: shared CI runners are noisy
        // enough that a real regression and a bad run are hard to tell
        // apart from a single number.
        'categories:performance': ['warn', { minScore: 0.5 }],
      },
    },
    upload: {
      // Keep reports local rather than pushing site content to a
      // third-party host. The workflow reads .lighthouseci/manifest.json
      // directly to build the PR comment.
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
