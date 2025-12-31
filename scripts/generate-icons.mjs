/**
 * Generate PWA Icons from source image (SVG or PNG)
 * ISO/IEC 25010 - Script de generation des icones PWA
 * Usage: node scripts/generate-icons.mjs [--download]
 *
 * Options:
 *   --download  Download Noto Emoji unicorn from Google (Apache 2.0)
 *
 * Source: icon-source.png (512x512) or icon.svg
 */

import sharp from 'sharp';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'icons-v6');
const SOURCE_PNG = join(ICONS_DIR, 'icon-source.png');
const SOURCE_SVG = join(ICONS_DIR, 'icon.svg');

// Google Noto Emoji Unicorn (Apache 2.0 License)
// Available sizes: 32, 72, 128, 512 - using 512 for best quality
const NOTO_UNICORN_URL =
  'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/512/emoji_u1f984.png';

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

// Couleur de fond pour le padding (dégradé rose/violet du thème)
const BG_COLOR = { r: 186, g: 85, b: 211, alpha: 1 }; // #ba55d3

/**
 * Telecharge une image depuis une URL
 */
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading from ${url}...`);
    const file = [];

    const request = (targetUrl) => {
      https
        .get(targetUrl, (response) => {
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400) {
            const redirectUrl = response.headers.location;
            console.log(`   ↪ Redirecting to ${redirectUrl}`);
            request(redirectUrl);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          response.on('data', (chunk) => file.push(chunk));
          response.on('end', () => {
            const buffer = Buffer.concat(file);
            writeFileSync(dest, buffer);
            console.log(`   ✓ Saved to ${dest}`);
            resolve(buffer);
          });
        })
        .on('error', reject);
    };

    request(url);
  });
}

/**
 * Cree une icone avec fond colore et emoji centre
 */
async function createIconWithBackground(sourceBuffer, size, outputPath) {
  // Calculer la taille de l'emoji (80% de l'icone)
  const emojiSize = Math.round(size * 0.75);
  const padding = Math.round((size - emojiSize) / 2);

  // Redimensionner l'emoji source
  const resizedEmoji = await sharp(sourceBuffer)
    .resize(emojiSize, emojiSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Creer le fond avec degrades (simplifie en couleur unie pour compatibilite)
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([
      {
        input: resizedEmoji,
        top: padding,
        left: padding,
      },
    ])
    .png()
    .toFile(outputPath);
}

async function generateIcons() {
  const shouldDownload = process.argv.includes('--download');

  // Determiner la source
  let sourceBuffer;
  let sourceType;

  if (shouldDownload) {
    console.log('🦄 Downloading Google Noto Emoji Unicorn (Apache 2.0)...\n');
    sourceBuffer = await downloadImage(NOTO_UNICORN_URL, SOURCE_PNG);
    sourceType = 'png';
  } else if (existsSync(SOURCE_PNG)) {
    console.log('📦 Using existing icon-source.png...\n');
    sourceBuffer = readFileSync(SOURCE_PNG);
    sourceType = 'png';
  } else if (existsSync(SOURCE_SVG)) {
    console.log('📦 Using existing icon.svg...\n');
    sourceBuffer = readFileSync(SOURCE_SVG);
    sourceType = 'svg';
  } else {
    console.error('❌ No source image found!');
    console.error('   Run with --download to fetch Google Noto Emoji unicorn');
    console.error('   Or provide icon-source.png or icon.svg in public/icons/');
    process.exit(1);
  }

  console.log('📱 PWA Icons (Android):');
  for (const size of PWA_SIZES) {
    const outputPath = join(ICONS_DIR, `icon-${size}.png`);
    if (sourceType === 'png') {
      await createIconWithBackground(sourceBuffer, size, outputPath);
    } else {
      await sharp(sourceBuffer).resize(size, size).png().toFile(outputPath);
    }
    console.log(`  ✓ icon-${size}.png (${size}x${size})`);
  }

  console.log('\n🍎 iOS Icons:');
  for (const { size, name } of IOS_SIZES) {
    const outputPath = join(ICONS_DIR, `${name}.png`);
    if (sourceType === 'png') {
      await createIconWithBackground(sourceBuffer, size, outputPath);
    } else {
      await sharp(sourceBuffer).resize(size, size).png().toFile(outputPath);
    }
    console.log(`  ✓ ${name}.png (${size}x${size})`);
  }

  console.log('\n🌐 Favicon:');
  const faviconSizes = [32, 16];
  for (const size of faviconSizes) {
    const outputPath = join(ICONS_DIR, `favicon-${size}.png`);
    if (sourceType === 'png') {
      await createIconWithBackground(sourceBuffer, size, outputPath);
    } else {
      await sharp(sourceBuffer).resize(size, size).png().toFile(outputPath);
    }
    console.log(`  ✓ favicon-${size}.png (${size}x${size})`);
  }

  console.log('\n✅ All PWA icons generated successfully!');
  console.log(`   Total: ${PWA_SIZES.length + IOS_SIZES.length + faviconSizes.length} icons`);
  console.log(`   Source: ${sourceType === 'png' ? 'icon-source.png' : 'icon.svg'}`);

  if (sourceType === 'png') {
    console.log('\n📜 License: Google Noto Emoji - Apache 2.0');
    console.log('   https://github.com/googlefonts/noto-emoji');
  }
}

generateIcons().catch((error) => {
  console.error('Failed to generate icons:', error);
  process.exit(1);
});
