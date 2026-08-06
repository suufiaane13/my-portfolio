import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outPath = path.join(root, 'public/og-card.png')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative dots pattern -->
  <g opacity="0.06">
    ${Array.from({ length: 20 }, (_, row) =>
      Array.from({ length: 35 }, (_, col) =>
        `<circle cx="${35 + col * 34}" cy="${35 + row * 34}" r="1.5" fill="white"/>`
      ).join('\n    ')
    ).join('\n    ')}
  </g>

  <!-- Accent line -->
  <rect x="80" y="230" width="120" height="4" rx="2" fill="url(#accent)"/>

  <!-- Name -->
  <text x="80" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="white" letter-spacing="-1">
    Soufiane HAJJI
  </text>

  <!-- Title -->
  <text x="80" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#94a3b8">
    Développeur Full-Stack &amp; UI/UX Designer
  </text>

  <!-- Tech tags -->
  <g transform="translate(80, 400)">
    <rect x="0" y="0" width="90" height="36" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="45" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#e2e8f0" text-anchor="middle">React</text>

    <rect x="102" y="0" width="110" height="36" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="157" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#e2e8f0" text-anchor="middle">TypeScript</text>

    <rect x="224" y="0" width="90" height="36" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="269" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#e2e8f0" text-anchor="middle">Node.js</text>

    <rect x="326" y="0" width="110" height="36" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="381" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#e2e8f0" text-anchor="middle">Tailwind CSS</text>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="590" width="1200" height="40" fill="url(#accent)" opacity="0.15"/>
  <text x="80" y="616" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#64748b">
    soufiane-hajji.netlify.app
  </text>
</svg>`

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  background: 'transparent',
})

fs.writeFileSync(outPath, resvg.render().asPng())
console.log(`Wrote ${outPath} (${fs.statSync(outPath).size} bytes)`)
