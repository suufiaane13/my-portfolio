/**
 * Download open-source Lichess chess piece sets + board textures.
 *
 * Why not Chess.com?
 * Chess.com piece/board designs are proprietary — scraping them for reuse
 * would infringe copyright. Lichess assets are open and attributed in NOTICE.md.
 *
 * Usage:
 *   npm run chess:themes
 *   npm run chess:themes -- --force
 */
import { mkdir, writeFile, access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_ROOT = path.join(ROOT, 'public', 'chess', 'themes')
const PIECES_DIR = path.join(OUT_ROOT, 'pieces')
const BOARDS_DIR = path.join(OUT_ROOT, 'boards')

const GITHUB_API = 'https://api.github.com/repos/lichess-org/lila/contents'
const RAW_BASE = 'https://raw.githubusercontent.com/lichess-org/lila/master'
const FORCE = process.argv.includes('--force')

/** Piece sets to skip (user preference / unsuitable). */
const EXCLUDED_PIECE_SETS = new Set(['monarchy', 'disguised'])

/**
 * Extra open-source piece sets (not in lila/public/piece), remapped to wK.svg naming.
 * Sources are attributed in NOTICE.md.
 */
const EXTRA_PIECE_SETS = [
  {
    id: 'ansuz',
    baseUrl: 'https://raw.githubusercontent.com/quotepilgrim/ansuz/main/pieces',
    files: {
      'wK.svg': 'WhiteKing.svg',
      'wQ.svg': 'WhiteQueen.svg',
      'wR.svg': 'WhiteRook.svg',
      'wB.svg': 'WhiteBishop.svg',
      'wN.svg': 'WhiteKnight.svg',
      'wP.svg': 'WhitePawn.svg',
      'bK.svg': 'BlackKing.svg',
      'bQ.svg': 'BlackQueen.svg',
      'bR.svg': 'BlackRook.svg',
      'bB.svg': 'BlackBishop.svg',
      'bN.svg': 'BlackKnight.svg',
      'bP.svg': 'BlackPawn.svg',
    },
  },
  {
    id: 'skak',
    baseUrl: 'https://raw.githubusercontent.com/MuTsunTsai/skak-svg/main/svg',
    files: {
      'wK.svg': 'wk.svg',
      'wQ.svg': 'wq.svg',
      'wR.svg': 'wr.svg',
      'wB.svg': 'wb.svg',
      'wN.svg': 'wn.svg',
      'wP.svg': 'wp.svg',
      'bK.svg': 'bk.svg',
      'bQ.svg': 'bq.svg',
      'bR.svg': 'br.svg',
      'bB.svg': 'bb.svg',
      'bN.svg': 'bn.svg',
      'bP.svg': 'bp.svg',
    },
  },
  {
    id: 'echecs',
    baseUrl: 'https://raw.githubusercontent.com/MuTsunTsai/1echecs-svg/main/svg',
    files: {
      'wK.svg': 'wk.svg',
      'wQ.svg': 'wq.svg',
      'wR.svg': 'wr.svg',
      'wB.svg': 'wb.svg',
      'wN.svg': 'wn.svg',
      'wP.svg': 'wp.svg',
      'bK.svg': 'bk.svg',
      'bQ.svg': 'bq.svg',
      'bR.svg': 'br.svg',
      'bB.svg': 'bb.svg',
      'bN.svg': 'bn.svg',
      'bP.svg': 'bp.svg',
    },
  },
]

const PIECE_FILES = [
  'wK.svg',
  'wQ.svg',
  'wR.svg',
  'wB.svg',
  'wN.svg',
  'wP.svg',
  'bK.svg',
  'bQ.svg',
  'bR.svg',
  'bB.svg',
  'bN.svg',
  'bP.svg',
]

/** Board textures to skip (thumbnails, sources, overlay sprites). */
function isMainBoardFile(name) {
  if (name.endsWith('.thumbnail.jpg') || name.endsWith('.thumbnail.png')) return false
  if (name.includes('.orig.')) return false
  if (name.includes('.selected.') || name.includes('.last-move.')) return false
  if (name.includes('.move-dest.') || name.includes('.current-premove.')) return false
  return /\.(jpg|jpeg|png|svg)$/i.test(name)
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'susu-portfolio-chess-themes',
    },
  })
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${url}`)
  }
  return response.json()
}

async function downloadFile(url, dest) {
  if (!FORCE && (await exists(dest))) return { skipped: true }

  const response = await fetch(url, {
    headers: { 'User-Agent': 'susu-portfolio-chess-themes' },
  })
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, buffer)
  return { skipped: false, bytes: buffer.length }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function listPieceSets() {
  const entries = await fetchJson(`${GITHUB_API}/public/piece`)
  return entries.filter((entry) => entry.type === 'dir').map((entry) => entry.name)
}

async function listBoardFiles() {
  const entries = await fetchJson(`${GITHUB_API}/public/images/board`)
  const files = entries
    .filter((entry) => entry.type === 'file' && isMainBoardFile(entry.name))
    .map((entry) => entry.name)

  // Nested SVG boards (e.g. newspaper)
  const svgDir = entries.find((entry) => entry.type === 'dir' && entry.name === 'svg')
  if (svgDir) {
    const svgEntries = await fetchJson(`${GITHUB_API}/public/images/board/svg`)
    for (const entry of svgEntries) {
      if (entry.type === 'file' && isMainBoardFile(entry.name)) {
        files.push(`svg/${entry.name}`)
      }
    }
  }

  return files
}

async function downloadPieceSet(setId) {
  const setDir = path.join(PIECES_DIR, setId)
  await mkdir(setDir, { recursive: true })

  let downloaded = 0
  let skipped = 0
  let missing = 0

  // Prefer known filenames; fall back to directory listing if a set uses variants.
  let files = PIECE_FILES
  try {
    const listing = await fetchJson(`${GITHUB_API}/public/piece/${encodeURIComponent(setId)}`)
    const available = new Set(listing.filter((f) => f.type === 'file').map((f) => f.name))
    files = PIECE_FILES.filter((name) => available.has(name))
    if (files.length === 0) {
      files = [...available].filter((name) => /\.(svg|png|webp)$/i.test(name))
    }
  } catch {
    // keep defaults
  }

  for (const fileName of files) {
    const url = `${RAW_BASE}/public/piece/${encodeURIComponent(setId)}/${fileName}`
    const dest = path.join(setDir, fileName)
    try {
      const result = await downloadFile(url, dest)
      if (result.skipped) skipped += 1
      else downloaded += 1
    } catch (error) {
      missing += 1
      console.warn(`  ! ${setId}/${fileName}: ${error.message}`)
    }
    await sleep(40)
  }

  return { setId, downloaded, skipped, missing, files }
}

async function downloadExtraPieceSet(extra) {
  const setDir = path.join(PIECES_DIR, extra.id)
  await mkdir(setDir, { recursive: true })

  let downloaded = 0
  let skipped = 0
  let missing = 0
  const files = Object.keys(extra.files)

  for (const [destName, sourceName] of Object.entries(extra.files)) {
    const url = `${extra.baseUrl}/${encodeURIComponent(sourceName)}`
    const dest = path.join(setDir, destName)
    try {
      const result = await downloadFile(url, dest)
      if (result.skipped) skipped += 1
      else downloaded += 1
    } catch (error) {
      missing += 1
      console.warn(`  ! ${extra.id}/${destName}: ${error.message}`)
    }
    await sleep(40)
  }

  return { setId: extra.id, downloaded, skipped, missing, files }
}

async function downloadBoards(boardFiles) {
  const boards = []
  let downloaded = 0
  let skipped = 0

  for (const relative of boardFiles) {
    const fileName = path.basename(relative)
    const id = fileName.replace(/\.(jpg|jpeg|png|svg)$/i, '')
    const url = `${RAW_BASE}/public/images/board/${relative.split('/').map(encodeURIComponent).join('/')}`
    const ext = path.extname(fileName).toLowerCase()
    const destName = `${id}${ext}`
    const dest = path.join(BOARDS_DIR, destName)

    try {
      const result = await downloadFile(url, dest)
      if (result.skipped) skipped += 1
      else downloaded += 1
      boards.push({
        id,
        file: destName,
        source: `public/images/board/${relative}`,
      })
    } catch (error) {
      console.warn(`  ! board ${relative}: ${error.message}`)
    }
    await sleep(40)
  }

  return { boards, downloaded, skipped }
}

async function main() {
  console.log('Chess themes downloader (Lichess open-source assets)')
  console.log('Chess.com designs are NOT downloaded (copyright).\n')

  await mkdir(PIECES_DIR, { recursive: true })
  await mkdir(BOARDS_DIR, { recursive: true })

  console.log('Listing piece sets…')
  const pieceSets = (await listPieceSets()).filter((id) => !EXCLUDED_PIECE_SETS.has(id))
  console.log(`Found ${pieceSets.length} piece sets (excluded: ${[...EXCLUDED_PIECE_SETS].join(', ')})\n`)

  const pieceResults = []
  for (const setId of pieceSets) {
    process.stdout.write(`Pieces: ${setId}… `)
    const result = await downloadPieceSet(setId)
    pieceResults.push(result)
    console.log(
      `dl=${result.downloaded} skip=${result.skipped} missing=${result.missing}`,
    )
  }

  console.log('\nExtra open-source piece sets…')
  for (const extra of EXTRA_PIECE_SETS) {
    process.stdout.write(`Pieces: ${extra.id}… `)
    const result = await downloadExtraPieceSet(extra)
    pieceResults.push(result)
    console.log(
      `dl=${result.downloaded} skip=${result.skipped} missing=${result.missing}`,
    )
  }

  console.log('\nListing board textures…')
  const boardFiles = await listBoardFiles()
  console.log(`Found ${boardFiles.length} board files\n`)
  const boardResult = await downloadBoards(boardFiles)
  console.log(
    `Boards: dl=${boardResult.downloaded} skip=${boardResult.skipped} total=${boardResult.boards.length}`,
  )

  const solidBoards = [
    {
      id: 'portfolio-blue',
      light: '#dbeafe',
      dark: '#2563eb',
      label: 'Portfolio Blue',
    },
    { id: 'brown-solid', light: '#f0d9b5', dark: '#b58863', label: 'Brown' },
    { id: 'green-solid', light: '#eeeed2', dark: '#769656', label: 'Green' },
    { id: 'blue-solid', light: '#dee3e6', dark: '#8ca2ad', label: 'Blue' },
    { id: 'purple-solid', light: '#e8d5e8', dark: '#8f6b8f', label: 'Purple' },
    { id: 'ic-solid', light: '#ececec', dark: '#c1c18e', label: 'IC' },
    { id: 'red-solid', light: '#f5d5d5', dark: '#b04545', label: 'Red' },
    { id: 'teal-solid', light: '#d7ece8', dark: '#3d8b7a', label: 'Teal' },
    { id: 'grey-solid', light: '#e8e8e8', dark: '#7a7a7a', label: 'Grey' },
    { id: 'orange-solid', light: '#f5e0c8', dark: '#c47a3a', label: 'Orange' },
    { id: 'navy-solid', light: '#d9e2f0', dark: '#3a4f6f', label: 'Navy' },
    { id: 'rose-solid', light: '#f3d6e2', dark: '#a85575', label: 'Rose' },
    { id: 'walnut-solid', light: '#e8d5b5', dark: '#6b4423', label: 'Walnut' },
    { id: 'slate-solid', light: '#e2e8f0', dark: '#475569', label: 'Slate' },
  ]

  // Stable piece order: Lichess sets alphabetically, then extras
  const extraIds = new Set(EXTRA_PIECE_SETS.map((item) => item.id))
  const sortedPieceResults = [
    ...pieceResults
      .filter((item) => !extraIds.has(item.setId))
      .sort((a, b) => a.setId.localeCompare(b.setId)),
    ...pieceResults.filter((item) => extraIds.has(item.setId)),
  ]

  const manifest = {
    source: 'https://github.com/lichess-org/lila',
    licenseNote:
      'Piece/board assets from Lichess (lila) plus extra open-source sets (ansuz, skak, echecs). See NOTICE.md.',
    generatedAt: new Date().toISOString(),
    pieceSets: sortedPieceResults
      .filter((item) => item.downloaded + item.skipped > 0)
      .map((item) => ({
        id: item.setId,
        files: item.files,
        path: `pieces/${item.setId}`,
      })),
    boards: [
      ...solidBoards.map((board) => ({
        id: board.id,
        type: 'solid',
        light: board.light,
        dark: board.dark,
        label: board.label,
      })),
      ...boardResult.boards.map((board) => ({
        id: board.id,
        type: 'image',
        file: board.file,
        path: `boards/${board.file}`,
        label: board.id,
      })),
    ],
  }

  await writeFile(
    path.join(OUT_ROOT, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  const notice = `# Chess themes attribution

Assets in this folder were downloaded from open-source sources:

## Lichess
- Upstream: https://github.com/lichess-org/lila
- Piece sets: \`public/piece/*\`
- Board textures: \`public/images/board/*\`
- License details vary by asset — see upstream [COPYING.md](https://github.com/lichess-org/lila/blob/master/COPYING.md)

## Extra piece sets
- **ansuz** — https://github.com/quotepilgrim/ansuz (CC BY-SA 4.0)
- **skak** — https://github.com/MuTsunTsai/skak-svg (skak / Piet Tutelaers lineage)
- **echecs** — https://github.com/MuTsunTsai/1echecs-svg (1echecs font lineage)

**Not included:** Chess.com piece sets, boards, or branding (proprietary; do not scrape). Excluded: monarchy.

Generated: ${manifest.generatedAt}
`

  await writeFile(path.join(OUT_ROOT, 'NOTICE.md'), notice, 'utf8')

  // Keep a small TypeScript catalog for the app (IDs only).
  const catalogTs = `/* Auto-generated by scripts/download-chess-themes.mjs — do not edit by hand */
export const CHESS_PIECE_SET_IDS = ${JSON.stringify(
    manifest.pieceSets.map((s) => s.id),
    null,
    2,
  )} as const

export type ChessPieceSetId = (typeof CHESS_PIECE_SET_IDS)[number]

export const CHESS_BOARD_THEME_IDS = ${JSON.stringify(
    manifest.boards.map((b) => b.id),
    null,
    2,
  )} as const

export type ChessBoardThemeId = (typeof CHESS_BOARD_THEME_IDS)[number]

export const DEFAULT_CHESS_PIECE_SET: ChessPieceSetId = ${
    manifest.pieceSets.some((s) => s.id === 'alpha')
      ? "'alpha'"
      : JSON.stringify(manifest.pieceSets[0]?.id ?? 'alpha')
  }

export const DEFAULT_CHESS_BOARD_THEME: ChessBoardThemeId = ${
    manifest.boards.some((b) => b.id === 'portfolio-blue')
      ? "'portfolio-blue'"
      : manifest.boards.some((b) => b.id === 'brown-solid')
        ? "'brown-solid'"
        : JSON.stringify(manifest.boards[0]?.id ?? 'portfolio-blue')
  }
`

  await writeFile(
    path.join(ROOT, 'src', 'lib', 'chess', 'themeCatalog.generated.ts'),
    catalogTs,
    'utf8',
  )

  console.log(`\nWrote ${path.relative(ROOT, path.join(OUT_ROOT, 'manifest.json'))}`)
  console.log(`Wrote ${path.relative(ROOT, path.join(OUT_ROOT, 'NOTICE.md'))}`)
  console.log(`Wrote src/lib/chess/themeCatalog.generated.ts`)
  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
