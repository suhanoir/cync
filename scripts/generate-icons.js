const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Sleek, high-res Cync Brand Icon (512x512)
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16161a" />
      <stop offset="100%" stop-color="#0a0a0c" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="emeraldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="116" fill="url(#bgGrad)" />
  <rect width="506" height="506" x="3" y="3" rx="113" fill="none" stroke="#2a2a32" stroke-width="4" stroke-opacity="0.9" />

  <!-- Dynamic Cync 'C' Sync Arc -->
  <path
    d="M 345 160 C 295 110 215 105 160 160 C 105 215 105 301 160 356 C 215 411 295 406 345 356"
    fill="none"
    stroke="url(#emeraldGrad)"
    stroke-width="50"
    stroke-linecap="round"
  />

  <!-- Active Consistency Node -->
  <circle cx="345" cy="160" r="28" fill="#34d399" filter="url(#emeraldGlow)" />
  <circle cx="345" cy="160" r="14" fill="#ffffff" />

  <!-- Lower Connected Point -->
  <circle cx="345" cy="356" r="16" fill="#10b981" />
</svg>`;

// 2. Android Maskable Icon (Full-bleed with inner safe area margin)
const maskableIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141418" />
      <stop offset="100%" stop-color="#08080a" />
    </linearGradient>
    <linearGradient id="emeraldGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="emeraldGlowMask" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Full-bleed background for maskable adaptive clipping -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <g transform="translate(51, 51) scale(0.8)">
    <path
      d="M 345 160 C 295 110 215 105 160 160 C 105 215 105 301 160 356 C 215 411 295 406 345 356"
      fill="none"
      stroke="url(#emeraldGradMask)"
      stroke-width="50"
      stroke-linecap="round"
    />
    <circle cx="345" cy="160" r="28" fill="#34d399" filter="url(#emeraldGlowMask)" />
    <circle cx="345" cy="160" r="14" fill="#ffffff" />
    <circle cx="345" cy="356" r="16" fill="#10b981" />
  </g>
</svg>`;

// 3. Compact High-Contrast Favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#0c0c0e" />
  <path
    d="M 44 20 C 37 13 26 12 19 19 C 12 26 12 38 19 45 C 26 52 37 51 44 44"
    fill="none"
    stroke="#10b981"
    stroke-width="8"
    stroke-linecap="round"
  />
  <circle cx="44" cy="20" r="4.5" fill="#34d399" />
</svg>`;

async function generate() {
  const rootDir = path.resolve(__dirname, '..');
  const publicIconsDir = path.join(rootDir, 'public', 'icons');
  const publicDir = path.join(rootDir, 'public');
  const appDir = path.join(rootDir, 'src', 'app');

  // Save SVGs
  fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), appIconSvg);
  fs.writeFileSync(path.join(publicIconsDir, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), faviconSvg);

  console.log('✓ SVGs written');

  const appIconBuffer = Buffer.from(appIconSvg);
  const maskableBuffer = Buffer.from(maskableIconSvg);
  const faviconBuffer = Buffer.from(faviconSvg);

  // 1. Android PWA 192x192
  await sharp(appIconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-192.png'));
  console.log('✓ icon-192.png created');

  // 2. Android PWA 512x512
  await sharp(appIconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-512.png'));
  console.log('✓ icon-512.png created');

  // 3. Android PWA Maskable 512x512
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-512-maskable.png'));
  console.log('✓ icon-512-maskable.png created');

  // 4. Apple Touch Icon 180x180
  await sharp(appIconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicIconsDir, 'apple-touch-icon.png'));
  await sharp(appIconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));
  console.log('✓ apple-touch-icon.png created');

  // 5. Standard Favicons: 32x32, 16x16, 48x48
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicIconsDir, 'favicon-32x32.png'));

  // 6. ICO file generation (combines 16, 32, 48)
  const ico32 = await sharp(faviconBuffer).resize(32, 32).png().toBuffer();
  // Write 32x32 png as favicon.ico (modern browsers accept PNG format inside/as .ico)
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), ico32);
  console.log('✓ favicon.ico created');

  console.log('✨ All icons successfully generated!');
}

generate().catch(console.error);

