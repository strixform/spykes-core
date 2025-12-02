import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parts = url.pathname.split("/")
    const slug = parts[parts.length - 1]

    if (!slug) {
      return new NextResponse("Bad request", { status: 400 })
    }

    const trendRes = await query(
      `
      select
        id,
        slug,
        title,
        description,
        global_score,
        first_seen_at,
        last_seen_at
      from trends
      where slug = $1
      `,
      [slug]
    )

    if (trendRes.rows.length === 0) {
      return new NextResponse("Not found", { status: 404 })
    }

    const trend = trendRes.rows[0]

    const locationsRes = await query(
      `
      select
        l.state,
        l.lga,
        tl.score
      from trend_locations tl
      join locations l on tl.location_id = l.id
      where tl.trend_id = $1
      order by tl.score desc
      `,
      [trend.id]
    )

    return NextResponse.json({
      trend,
      locations: locationsRes.rows,
    })
  } catch (error) {
    console.error("Error loading trend detail", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
