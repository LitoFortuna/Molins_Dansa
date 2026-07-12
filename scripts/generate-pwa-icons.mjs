// Generador d'icones PWA en PNG pur (sense dependències externes: només
// zlib, inclòs a Node). Dibuixa la mateixa marca del Navbar: quadrat
// arrodonit rose-600 amb una "M" blanca en negreta, centrada dins la "safe
// zone" del 80% que exigeixen les icones "maskable" d'Android.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const ROSE = [225, 29, 72]; // Tailwind rose-600 (#E11D48), mateix color que el Navbar
const WHITE = [255, 255, 255];

// Glif "M" com a 4 traços vectorials (coordenades 0..1 dins la caixa del glif,
// y=0 dalt). Dues verticals + dues diagonals que conflueixen al mig — un
// disseny de "M" geomètric net, llegible fins i tot a 48x48px real.
const M_STROKES = [
  [[0.08, 0.0], [0.08, 1.0]],   // vertical esquerra
  [[0.92, 0.0], [0.92, 1.0]],   // vertical dreta
  [[0.08, 0.0], [0.50, 0.58]],  // diagonal esquerra
  [[0.92, 0.0], [0.50, 0.58]],  // diagonal dreta
];
const M_STROKE_WIDTH = 0.17; // relatiu a l'amplada de la caixa del glif

// Distància d'un punt a un segment de línia.
function distToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// Cobertura (0..1) del glif "M" al punt (u,v) normalitzat 0..1, amb 1px
// d'antialiasing relatiu al gruix del traç.
function glyphCoverage(u, v) {
  let best = Infinity;
  for (const [a, b] of M_STROKES) best = Math.min(best, distToSegment(u, v, a, b));
  const half = M_STROKE_WIDTH / 2;
  if (best <= half - 0.01) return 1;
  if (best <= half + 0.01) return (half + 0.01 - best) / 0.02;
  return 0;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Distància (0..1) al rectangle arrodonit centrat, per antialiasing simple
// de la vora exterior de la icona (radi = 22% de la mida).
function roundedSquareAlpha(x, y, size, radius) {
  const cx = Math.min(x, size - 1 - x);
  const cy = Math.min(y, size - 1 - y);
  if (cx >= radius || cy >= radius) return 1;
  const dx = radius - cx;
  const dy = radius - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= radius) return 1;
  if (d <= radius + 1) return radius + 1 - d; // 1px d'antialiasing
  return 0;
}

function renderIcon(size, { maskable = false } = {}) {
  const radius = maskable ? 0 : Math.round(size * 0.22);
  // Safe zone del glif: maskable exigeix contingut dins del 80% central.
  const glyphBoxRatio = maskable ? 0.5 : 0.62;
  const glyphW = size * glyphBoxRatio;
  const glyphH = glyphW;
  const offsetX = (size - glyphW) / 2;
  const offsetY = (size - glyphH) / 2;

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filtre "None" per fila
    for (let x = 0; x < size; x++) {
      let [r, g, b] = ROSE;
      let a = maskable ? 255 : Math.round(255 * roundedSquareAlpha(x, y, size, radius));

      // Dibuixa el glif "M" blanc amb antialiasing via distància vectorial.
      const gx = x - offsetX, gy = y - offsetY;
      if (gx >= 0 && gy >= 0 && gx < glyphW && gy < glyphH) {
        const cov = glyphCoverage(gx / glyphW, gy / glyphH);
        if (cov > 0) {
          r = Math.round(r * (1 - cov) + WHITE[0] * cov);
          g = Math.round(g * (1 - cov) + WHITE[1] * cov);
          b = Math.round(b * (1 - cov) + WHITE[2] * cov);
        }
      }

      const px = rowStart + 1 + x * 4;
      raw[px] = r; raw[px + 1] = g; raw[px + 2] = b; raw[px + 3] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // profunditat de bit
  ihdrData[9] = 6;  // color type RGBA
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflateSync(raw, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

mkdirSync('public/icons', { recursive: true });
const targets = [
  { size: 192, file: 'public/icons/icon-192.png' },
  { size: 512, file: 'public/icons/icon-512.png' },
  { size: 512, file: 'public/icons/icon-maskable-512.png', maskable: true },
  { size: 180, file: 'public/icons/apple-touch-icon.png' },
];
for (const t of targets) {
  writeFileSync(t.file, renderIcon(t.size, { maskable: t.maskable }));
  console.log('Generat', t.file);
}
