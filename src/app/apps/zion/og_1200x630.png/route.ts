import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'

/** PNG bytes for og:image (same asset as public SVG wrapper). */
export async function GET() {
  const svg = await readFile(
    join(process.cwd(), 'public/apps/zion/og_1200x630.svg'),
    'utf8',
  )
  const match = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)
  if (!match) {
    return new Response('OG image missing', { status: 500 })
  }
  const body = Buffer.from(match[1], 'base64')
  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })
}
