import { NextResponse } from "next/server"
import { query } from "../../../lib/db"

type Params = {
  handle: string
}

export async function GET(
  request: Request,
  context: { params: Params | Promise<Params> }
) {
  let handle: string

  const p = context.params as Params | Promise<Params>
  if (typeof (p as any).then === "function") {
    const resolved = (await p) as Params
    handle = resolved.handle
  } else {
    handle = (p as Params).handle
  }

  try {
    const inflRes = await query(
      `
      select
        id,
        handle,
        display_name,
        bio,
        primary_niche,
        avatar_url,
        created_at
      from influencers
      where handle = $1
      `,
      [handle]
    )

    if (inflRes.rows.length === 0) {
      return new NextResponse("Not found", { status: 404 })
    }

    const influencer = inflRes.rows[0]

    const platformsRes = await query(
      `
      select
        platform,
        platform_user_id,
        platform_url,
        followers
      from influencer_platforms
      where influencer_id = $1
      order by followers desc, platform asc
      `,
      [influencer.id]
    )

    const metricsRes = await query(
      `
      select
        date,
        platform,
        reach,
        mentions,
        trend_impressions,
        unique_trends
      from influencer_metrics
      where influencer_id = $1
      order by date desc, platform asc
      limit 7
      `,
      [influencer.id]
    )

    return NextResponse.json({
      influencer,
      platforms: platformsRes.rows,
      metrics: metricsRes.rows,
    })
  } catch (err) {
    console.error("Error loading influencer detail", err)
    return new NextResponse("Server error", { status: 500 })
  }
}
