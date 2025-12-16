import { query } from "./db"

export type TrendInput = {
  slug: string
  title: string
  description: string
  global_score: number
  source?: string      // e.g. 'tiktok', 'x', 'demo'
  kind?: string        // e.g. 'hashtag', 'topic', 'video'
}

export type TrendLocationInput = {
  trendSlug: string
  state: string
  lga: string | null
  score: number
}

async function getTrendId(slug: string): Promise<string | null> {
  const res = await query(
    "select id from trends where slug = $1 limit 1",
    [slug]
  )
  if (!res.rows.length) return null
  return res.rows[0].id as string
}

async function getLocationId(
  state: string,
  lga: string | null
): Promise<string | null> {
  if (lga === null) {
    const res = await query(
      `
        select id
        from locations
        where state = $1
          and lga is null
        limit 1
      `,
      [state]
    )
    if (!res.rows.length) return null
    return res.rows[0].id as string
  } else {
    const res = await query(
      `
        select id
        from locations
        where state = $1
          and lga = $2
        limit 1
      `,
      [state, lga]
    )
    if (!res.rows.length) return null
    return res.rows[0].id as string
  }
}

import { query } from "./db"

// ...

export async function upsertTrend(input: TrendInput) {
  const now = new Date().toISOString()
  const normalized = input.slug.toLowerCase()

  const sql = `
    INSERT INTO trends (
      slug,
      title,
      description,
      global_score,
      first_seen_at,
      last_seen_at,
      normalized_keyword,
      source,
      kind
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (slug)
    DO UPDATE SET
      title             = EXCLUDED.title,
      description       = EXCLUDED.description,
      global_score      = EXCLUDED.global_score,
      last_seen_at      = EXCLUDED.last_seen_at,
      normalized_keyword = EXCLUDED.normalized_keyword,
      source            = EXCLUDED.source,
      kind              = EXCLUDED.kind;
  `

  const params = [
    input.slug,
    input.title,
    input.description,
    input.global_score,
    now,
    now,
    normalized,
    input.source || null,
    input.kind || null,
  ]

  await query(sql, params)
}

export async function upsertTrends(items: TrendInput[]) {
  for (const t of items) {
    await upsertTrend(t)
  }
}

export async function upsertTrendLocation(input: TrendLocationInput) {
  const trendId = await getTrendId(input.trendSlug)
  if (!trendId) {
    console.warn("No trend found for slug:", input.trendSlug)
    return
  }

  const locationId = await getLocationId(input.state, input.lga)
  if (!locationId) {
    console.warn("No location found:", input.state, input.lga)
    return
  }

  await query(
    "delete from trend_locations where trend_id = $1 and location_id = $2",
    [trendId, locationId]
  )

  await query(
    `
      insert into trend_locations (trend_id, location_id, score)
      values ($1, $2, $3)
    `,
    [trendId, locationId, input.score]
  )
}

export async function upsertTrendLocations(items: TrendLocationInput[]) {
  for (const row of items) {
    await upsertTrendLocation(row)
  }
}
