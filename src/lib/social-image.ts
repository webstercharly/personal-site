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
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#111714" />
          <stop offset="0.5" stop-color="#183025" />
          <stop offset="1" stop-color="#30252d" />
        </linearGradient>
        <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#38d982" stop-opacity="0.64" />
          <stop offset="1" stop-color="#38d982" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="pinkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#e8548f" stop-opacity="0.34" />
          <stop offset="1" stop-color="#e8548f" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#e6b93f" stop-opacity="0.38" />
          <stop offset="1" stop-color="#e6b93f" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#27b467" stop-opacity="0" />
          <stop offset="0.42" stop-color="#27b467" />
          <stop offset="0.72" stop-color="#e6b93f" />
          <stop offset="1" stop-color="#e8548f" stop-opacity="0.32" />
        </linearGradient>
        <linearGradient id="quiet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#101512" stop-opacity="0.86" />
          <stop offset="0.44" stop-color="#101512" stop-opacity="0.5" />
          <stop offset="0.72" stop-color="#101512" stop-opacity="0" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="38" />
        </filter>
      </defs>

      <rect width="1200" height="630" fill="url(#background)" />

      <g filter="url(#blur)">
        <ellipse cx="950" cy="300" rx="390" ry="330" fill="url(#greenGlow)" />
        <ellipse cx="1080" cy="110" rx="460" ry="330" fill="url(#pinkGlow)" />
        <ellipse cx="925" cy="655" rx="390" ry="255" fill="url(#amberGlow)" />
        <path d="M-90 565 C235 385 460 650 745 460 S1060 160 1450 330" fill="none" stroke="url(#flow)" stroke-width="118" stroke-linecap="round" opacity="0.23" />
      </g>

      <path d="M-80 560 C230 390 470 642 748 454 S1065 165 1450 330" fill="none" stroke="url(#flow)" stroke-width="3" stroke-linecap="round" opacity="0.75" />
      <path d="M-120 610 C230 445 478 700 790 492 S1090 225 1470 390" fill="none" stroke="#fffaf5" stroke-width="1.5" stroke-linecap="round" opacity="0.16" />
      <path d="M545 -60 C720 120 756 258 905 302 S1120 245 1420 60" fill="none" stroke="#fffaf5" stroke-width="1.5" stroke-linecap="round" opacity="0.12" />

      <rect width="1200" height="630" fill="url(#quiet)" />

      <text x="76" y="78" fill="#ddd5cf" font-family="DejaVu Sans Mono, monospace" font-size="24" font-weight="700" letter-spacing="0.8">${escapeXml(label)}</text>
      <rect x="76" y="105" width="88" height="5" rx="2.5" fill="#27b467" />
      <text x="76" y="${titleStartY}" fill="#fffaf5" font-family="DejaVu Sans, Arial, sans-serif" font-size="62" font-weight="700" letter-spacing="-1.5">${titleMarkup}</text>

      <text x="76" y="548" fill="#fffaf5" font-family="DejaVu Sans Mono, monospace" font-size="24" font-weight="700">Head of AI Engineering</text>
      <text x="76" y="586" fill="#d4ccc6" font-family="DejaVu Sans Mono, monospace" font-size="21">charlywebster.com</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
