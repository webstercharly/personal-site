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

function createPixelDither(): string {
  const pixels: string[] = [];
  const size = 12;

  for (let y = 18; y < CARD_HEIGHT; y += 30) {
    for (let x = 18; x < CARD_WIDTH; x += 30) {
      const progress = x / CARD_WIDTH;
      const pattern = (x * 7 + y * 11) % 101;
      if (pattern > 8 + progress * 22) continue;

      const colour =
        (x + y) % 90 === 0
          ? '#e8548f'
          : (x + y) % 60 === 0
            ? '#e6b93f'
            : '#77d68f';
      pixels.push(
        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${colour}" opacity="${(0.05 + progress * 0.13).toFixed(2)}" />`,
      );
    }
  }

  return pixels.join('');
}

export async function generateSocialCard({ title, label }: SocialCardData): Promise<Buffer> {
  const titleLines = wrapText(title, 24, 4);
  const titleStartY = titleLines.length > 3 ? 190 : 220;
  const pixelDither = createPixelDither();
  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<tspan x="76" dy="${index === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#121914" />
      <g shape-rendering="crispEdges">${pixelDither}</g>

      <g shape-rendering="crispEdges">
        <path d="M1044 54h12v24h24v12h-24v24h-12V90h-24V78h24z" fill="#e8548f" />
        <path d="M1128 152h8v16h16v8h-16v16h-8v-16h-16v-8h16z" fill="#e6b93f" />
        <path d="M946 106h6v12h12v6h-12v12h-6v-12h-12v-6h12z" fill="#77d68f" />
        <rect x="1092" y="82" width="12" height="12" fill="#77d68f" />
        <rect x="1164" y="118" width="12" height="12" fill="#fff4e8" opacity="0.7" />
      </g>

      <text x="76" y="78" fill="#d9d2c9" font-family="DejaVu Sans Mono, monospace" font-size="23" font-weight="700" letter-spacing="0.8">${escapeXml(label)}</text>
      <g shape-rendering="crispEdges">
        <rect x="76" y="103" width="20" height="6" fill="#27b467" />
        <rect x="100" y="103" width="20" height="6" fill="#e6b93f" />
        <rect x="124" y="103" width="20" height="6" fill="#e8548f" />
      </g>
      <text x="76" y="${titleStartY}" fill="#fff4e8" font-family="DejaVu Sans Mono, monospace" font-size="56" font-weight="700" letter-spacing="-2">${titleMarkup}</text>

      <text x="76" y="548" fill="#fff4e8" font-family="DejaVu Sans Mono, monospace" font-size="23" font-weight="700">Head of AI Engineering</text>
      <text x="76" y="586" fill="#d9d2c9" font-family="DejaVu Sans Mono, monospace" font-size="20">www.charlywebster.com</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
