import sharp from 'sharp';

export interface SocialCardData {
  title: string;
  label: string;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function truncate(value: string, maxCharacters: number): string {
  if (value.length <= maxCharacters) return value;
  return `${value.slice(0, maxCharacters - 1).trimEnd()}…`;
}

function wrapText(value: string, maxCharacters: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index] ?? '';
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharacters || current.length === 0) {
      current = candidate;
      continue;
    }

    lines.push(current);

    if (lines.length === maxLines - 1) {
      lines.push(truncate(words.slice(index).join(' '), maxCharacters + 4));
      return lines;
    }

    current = word;
  }

  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

export async function generateSocialCard({ title, label }: SocialCardData): Promise<Buffer> {
  const titleLines = wrapText(title, 24, 4);
  const titleStartY = titleLines.length > 3 ? 190 : 220;
  const titleMarkup = titleLines
    .map((line, index) => `<tspan x="76" dy="${index === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`)
    .join('');

  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M44 0H0V44" fill="none" stroke="#2d3531" stroke-width="1" />
        </pattern>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#27b467" stop-opacity="0.18" />
          <stop offset="1" stop-color="#27b467" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="630" fill="#171c1a" />
      <rect width="1200" height="630" fill="url(#grid)" opacity="0.55" />
      <circle cx="1030" cy="315" r="290" fill="url(#glow)" />
      <rect x="0" y="0" width="830" height="630" fill="#171c1a" opacity="0.91" />

      <g fill="none" stroke="#46534c" stroke-width="3">
        <path d="M875 178 1008 112 1125 220 1060 350 1160 454" />
        <path d="M875 178 915 327 1060 350 986 504" />
        <path d="M1008 112 1060 350" />
        <path d="M915 327 986 504" />
      </g>
      <g stroke="#171c1a" stroke-width="6">
        <circle cx="875" cy="178" r="17" fill="#27b467" />
        <circle cx="1008" cy="112" r="12" fill="#e8548f" />
        <circle cx="1125" cy="220" r="20" fill="#e6b93f" />
        <circle cx="915" cy="327" r="13" fill="#e8548f" />
        <circle cx="1060" cy="350" r="23" fill="#27b467" />
        <circle cx="1160" cy="454" r="12" fill="#e8548f" />
        <circle cx="986" cy="504" r="18" fill="#e6b93f" />
      </g>

      <text x="76" y="78" fill="#c4bbb5" font-family="DejaVu Sans Mono, monospace" font-size="24" font-weight="700" letter-spacing="0.8">${escapeXml(label)}</text>
      <rect x="76" y="105" width="88" height="5" rx="2.5" fill="#27b467" />
      <text x="76" y="${titleStartY}" fill="#fffaf5" font-family="DejaVu Sans, Arial, sans-serif" font-size="62" font-weight="700" letter-spacing="-1.5">${titleMarkup}</text>

      <text x="76" y="548" fill="#fffaf5" font-family="DejaVu Sans Mono, monospace" font-size="24" font-weight="700">Head of AI Engineering</text>
      <text x="76" y="586" fill="#c4bbb5" font-family="DejaVu Sans Mono, monospace" font-size="21">charlywebster.com</text>
      <rect x="0" y="622" width="1200" height="8" fill="#27b467" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
