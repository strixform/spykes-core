import { NextResponse } from "next/server"
import { query } from "@/lib/db"

type Params = {
  slug: string
}

export async function GET(
  request: Request,
  context: { params: Params | Promise<Params> }
) {
  // unwrap params which may be a Promise in Next 16
  const p = context.params as Params | Promise<Params>
  let slug: string

  if (typeof (p as any).then === "function") {
    const resolved = (await p) as Params
    slug = resolved.slug
  } else {
    slug = (p as Params).slug
  }

  try {
    // find trend id
    const trendRes = await query(
      `
      select id
      from trends
      where slug = $1
      `,
      [slug]
    )

    if (trendRes.rows.length === 0) {
      return new NextResponse("Not found", { status: 404 })
    }

    const trendId = trendRes.rows[0].id

    // fetch influencers linked to this trend
    const infRes = await query(
      `
      select
        i.handle,
        i.display_name,
        i.primary_niche,
        ita.estimated_reach,
        ita.engagement_score,
        l.state as primary_state
      from influencer_trend_activity ita
      join influencers i on i.id = ita.influencer_id
      left join locations l on l.id = ita.primary_location_id
      where ita.trend_id = $1
      order by ita.estimated_reach desc, ita.engagement_score desc
      `,
      [trendId]
    )

    return NextResponse.json(infRes.rows)
  } catch (err) {
    console.error("Error loading trend influencers", err)
    return new NextResponse("Server error", { status: 500 })
  }
}
