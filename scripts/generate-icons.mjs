/**
 * Script pour générer les icônes PWA à partir du SVG
 * Usage: node scripts/generate-icons.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer des icônes placeholder en base64 (violet/rose avec emoji licorne)
const createPlaceholderIcon = (size) => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff69b4"/>
          <stop offset="100%" style="stop-color:#ba55d3"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
      <text x="50%" y="55%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">🦄</text>
    </svg>
  `;
};

// Écrire les fichiers SVG (pour développement)
const sizes = [192, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

sizes.forEach(size => {
  const svgContent = createPlaceholderIcon(size);
  const filename = `icon-${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created ${filename}`);
});

console.log('\nPour la production, convertissez les SVG en PNG avec:');
console.log('npx svgexport public/icons/icon-192.svg public/icons/icon-192.png 192:192');
console.log('npx svgexport public/icons/icon-512.svg public/icons/icon-512.png 512:512');
