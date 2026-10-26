import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const iconsDir = path.join(publicDir, 'icons');
const wellKnownDir = path.join(publicDir, '.well-known');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

// 1. High-fidelity standard SVG for ArabPrompt
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="50%" stop-color="#12110f"/>
      <stop offset="100%" stop-color="#0a0a08"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecd197"/>
      <stop offset="40%" stop-color="#c29b40"/>
      <stop offset="100%" stop-color="#8a611c"/>
    </linearGradient>
    <linearGradient id="sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#fdf4dc"/>
      <stop offset="100%" stop-color="#c29b40"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c29b40" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#c29b40" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="url(#gold)" stroke-width="6" stroke-opacity="0.3"/>

  <!-- Radial Glow Behind Logo -->
  <circle cx="256" cy="256" r="180" fill="url(#glow)"/>

  <!-- Central Symbol: Elegant Arabic Letter / Prompt Spark / Pen Nib -->
  <g filter="url(#shadow)">
    <!-- Dynamic Stylized Wand / Nib Structure -->
    <path d="M 256 90 
             C 275 145 320 190 375 209 
             C 320 228 275 273 256 328 
             C 237 273 192 228 137 209 
             C 192 190 237 145 256 90 Z" 
          fill="url(#sparkle)"/>

    <!-- Arabic 'أ' Calligraphic Flow / Futuristic Prompt Motif -->
    <path d="M 235 240 
             Q 280 270 310 320 
             Q 335 365 300 405 
             Q 265 440 215 415 
             Q 175 395 185 345 
             Q 195 295 245 270" 
          fill="none" 
          stroke="url(#gold)" 
          stroke-width="26" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>

    <!-- Sparkle accent 1 -->
    <path d="M 380 120 
             C 388 140 405 156 425 164 
             C 405 172 388 188 380 208 
             C 372 188 355 172 335 164 
             C 355 156 372 140 380 120 Z" 
          fill="url(#gold)"/>

    <!-- Sparkle accent 2 -->
    <path d="M 130 330 
             C 135 344 146 355 160 360 
             C 146 365 135 376 130 390 
             C 125 376 114 365 100 360 
             C 114 355 125 344 130 330 Z" 
          fill="url(#sparkle)"/>

    <!-- Center Gem Dot -->
    <circle cx="256" cy="385" r="14" fill="url(#sparkle)"/>
  </g>
</svg>`;

// 2. Maskable SVG icon with 15% safe margin around edges
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b18"/>
      <stop offset="50%" stop-color="#12110f"/>
      <stop offset="100%" stop-color="#080807"/>
    </linearGradient>
    <linearGradient id="mgold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecd197"/>
      <stop offset="40%" stop-color="#c29b40"/>
      <stop offset="100%" stop-color="#8a611c"/>
    </linearGradient>
    <linearGradient id="msparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#fdf4dc"/>
      <stop offset="100%" stop-color="#c29b40"/>
    </linearGradient>
    <radialGradient id="mglow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c29b40" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#c29b40" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Full-bleed background for maskable (no rounded corners, extends 100% to boundary) -->
  <rect width="512" height="512" fill="url(#mbg)"/>
  <circle cx="256" cy="256" r="160" fill="url(#mglow)"/>

  <!-- Scaled down to safe zone (0.75 scale around center 256, 256) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Primary Star -->
    <path d="M 256 90 
             C 275 145 320 190 375 209 
             C 320 228 275 273 256 328 
             C 237 273 192 228 137 209 
             C 192 190 237 145 256 90 Z" 
          fill="url(#msparkle)"/>

    <!-- Arabesque Loop -->
    <path d="M 235 240 
             Q 280 270 310 320 
             Q 335 365 300 405 
             Q 265 440 215 415 
             Q 175 395 185 345 
             Q 195 295 245 270" 
          fill="none" 
          stroke="url(#mgold)" 
          stroke-width="26" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>

    <!-- Accents -->
    <path d="M 380 120 
             C 388 140 405 156 425 164 
             C 405 172 388 188 380 208 
             C 372 188 355 172 335 164 
             C 355 156 372 140 380 120 Z" 
          fill="url(#mgold)"/>

    <circle cx="256" cy="385" r="14" fill="url(#msparkle)"/>
  </g>
</svg>`;

// Write SVGs
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), svgMaskable);

async function generateAll() {
  console.log('Generating PNG icons...');
  
  // 512x512
  const buf512 = await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toBuffer();
  await sharp(buf512).toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(buf512).toFile(path.join(iconsDir, 'icon-512x512.png'));

  // 192x192
  const buf192 = await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toBuffer();
  await sharp(buf192).toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(buf192).toFile(path.join(iconsDir, 'icon-192x192.png'));

  // 512x512 maskable (safe-zone padded)
  const bufMaskable = await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toBuffer();
  await sharp(bufMaskable).toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  await sharp(bufMaskable).toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));

  // 180x180 apple-touch-icon
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 64x64 favicon.png
  await sharp(Buffer.from(svgIcon))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // 32x32 favicon.ico
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('PNG Icons successfully generated!');

  // 3. Digital Asset Links statement for Trusted Web Activity (TWA) on Google Play
  const assetlinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.arabprompt.app",
        sha256_cert_fingerprints: [
          // Placeholder ready to be replaced with the developer's release key fingerprint from Play Console
          "14:6D:E9:7F:0E:52:91:7E:EA:E0:9F:BE:76:A6:E6:71:0B:0E:02:16:43:8E:18:04:15:49:A9:C7:CE:01:23:45"
        ]
      }
    }
  ];

  fs.writeFileSync(
    path.join(wellKnownDir, 'assetlinks.json'),
    JSON.stringify(assetlinks, null, 2)
  );

  console.log('.well-known/assetlinks.json generated successfully!');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
