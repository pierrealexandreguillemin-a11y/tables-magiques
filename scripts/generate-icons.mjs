/**
 * Generate PWA Icons from SVG
 * ISO/IEC 25010 - Script de generation des icones PWA
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'icons');
const SVG_PATH = join(ICONS_DIR, 'icon.svg');

// Tailles requises pour PWA (Android + iOS)
const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Tailles iOS obligatoires
const IOS_SIZES = [
  { size: 60, name: 'icon-60' }, // iPhone
  { size: 76, name: 'icon-76' }, // iPad
  { size: 120, name: 'icon-120' }, // iPhone @2x
  { size: 152, name: 'icon-152' }, // iPad @2x
  { size: 167, name: 'icon-167' }, // iPad Pro
  { size: 180, name: 'apple-touch-icon' }, // iPhone @3x
  { size: 1024, name: 'icon-1024' }, // App Store
];

async function generateIcons() {
  console.log('Generating PWA icons from icon.svg...\n');

  // Lire le SVG
  const svgBuffer = readFileSync(SVG_PATH);

  console.log('📱 PWA Icons (Android):');
  // Generer chaque taille PWA
  for (const size of PWA_SIZES) {
    const outputPath = join(ICONS_DIR, `icon-${size}.png`);
    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
    console.log(`  ✓ icon-${size}.png (${size}x${size})`);
  }

  console.log('\n🍎 iOS Icons:');
  // Generer chaque taille iOS
  for (const { size, name } of IOS_SIZES) {
    const outputPath = join(ICONS_DIR, `${name}.png`);
    await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
    console.log(`  ✓ ${name}.png (${size}x${size})`);
  }

  console.log('\n🌐 Favicon:');
  // Generer favicon-32 pour fallback
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(ICONS_DIR, 'favicon-32.png'));
  console.log('  ✓ favicon-32.png (32x32)');

  // Generer favicon-16
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(join(ICONS_DIR, 'favicon-16.png'));
  console.log('  ✓ favicon-16.png (16x16)');

  console.log('\n✅ All PWA icons generated successfully!');
  console.log(`   Total: ${PWA_SIZES.length + IOS_SIZES.length + 2} icons`);
}

generateIcons().catch((error) => {
  console.error('Failed to generate icons:', error);
  process.exit(1);
});
