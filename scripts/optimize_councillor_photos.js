// Resizes committed councillor headshots in place. Largest on-screen use is
// w-16 (64px); 200px covers that at up to ~3x pixel density with headroom.
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.join(process.cwd(), 'public/images/councillors');
const MAX_WIDTH = 200;

const files = (await readdir(DIR)).filter(f => /\.jpe?g$/i.test(f));

let before = 0;
let after = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  const original = await sharp(filePath).toBuffer();
  const meta = await sharp(original).metadata();

  if (meta.width <= MAX_WIDTH) continue;

  const resized = await sharp(original)
    .resize({ width: MAX_WIDTH })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  before += original.length;
  after += resized.length;
  await writeFile(filePath, resized);
  console.log(`${file}: ${(original.length / 1024).toFixed(0)}KB -> ${(resized.length / 1024).toFixed(0)}KB`);
}

console.log(`\nTotal: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB`);
