import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');
const svg   = readFileSync(join(root, 'public/icons/icon.svg'));

const SIZES = [16, 32, 48, 128];

for (const size of SIZES) {
  const out = join(root, `public/icons/icon${size}.png`);
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓  icon${size}.png`);
}
console.log('Done.');
