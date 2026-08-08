# Icons

Vendored [Lucide](https://lucide.dev) icons, ISC licensed (see `LICENSE`).

These are imported directly as Astro components — no icon integration needed:

```astro
---
import Info from '../icons/info.svg';
---
<Info class="w-5 h-5" aria-hidden="true" />
```

Icons referenced by name at runtime (the `icon` prop on `Timeline` and
`Metric`) go through `src/components/Icon.astro`, which resolves names against
the registry in `src/components/icons.ts`.

## Adding an icon

1. Download the SVG from https://lucide.dev and drop it in this directory.
2. If it needs to be addressable by name, register it in
   `src/components/icons.ts`. The `IconName` type updates automatically, so a
   typo at a call site becomes a type error.

Keep the icons unmodified so they stay easy to re-sync with upstream. They use
`stroke="currentColor"`, so colour comes from the surrounding text colour.
