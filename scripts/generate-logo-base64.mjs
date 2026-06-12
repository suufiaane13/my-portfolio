import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = path.join(root, 'public/favicon.svg')
const pngPath = path.join(root, 'public/logo.png')
const outPath = path.join(root, 'supabase/functions/contact/logo-base64.ts')

const svg = fs.readFileSync(svgPath)
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 128 } })
fs.writeFileSync(pngPath, resvg.render().asPng())

const base64 = fs.readFileSync(pngPath).toString('base64')
fs.writeFileSync(outPath, `export const LOGO_PNG_BASE64 = \`${base64}\`\n`)

console.log(`Wrote ${pngPath} (${fs.statSync(pngPath).size} bytes)`)
console.log(`Wrote ${outPath}`)
