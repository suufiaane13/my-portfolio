import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fontsDir = path.join(root, 'public/fonts')

const FONTS = [
  { family: 'Inter', weights: [400, 500, 600, 700] },
  { family: 'Space Grotesk', weights: [500, 600, 700] },
]

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function downloadFont(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  const css = await res.text()

  // Extract woff2 URL from CSS
  const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/)
  if (!match) {
    console.warn(`  ⚠ No WOFF2 found for ${family} ${weight}`)
    return null
  }

  const woff2Url = match[1]
  const fileName = `${family.replace(/ /g, '-').toLowerCase()}-${weight}.woff2`
  const filePath = path.join(fontsDir, fileName)

  const fontRes = await fetch(woff2Url)
  const buffer = Buffer.from(await fontRes.arrayBuffer())
  fs.writeFileSync(filePath, buffer)
  console.log(`  ✓ ${fileName} (${buffer.length} bytes)`)
  return { family, weight, fileName }
}

async function main() {
  console.log('Downloading WOFF2 fonts from Google Fonts...\n')
  const results = []

  for (const { family, weights } of FONTS) {
    for (const weight of weights) {
      const result = await downloadFont(family, weight)
      if (result) results.push(result)
    }
  }

  // Generate @font-face CSS
  const cssLines = results.map(({ family, weight, fileName }) => {
    const familyVar = weight === 400 ? `"${family}"` : `"${family}"`
    return `@font-face {
  font-family: ${familyVar};
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('/fonts/${fileName}') format('woff2');
}`
  })

  const css = cssLines.join('\n\n') + '\n'
  const cssPath = path.join(root, 'src/fonts.css')
  fs.writeFileSync(cssPath, css)
  console.log(`\nWrote ${cssPath}`)
  console.log(`Total: ${results.length} font files`)
}

main().catch(console.error)
