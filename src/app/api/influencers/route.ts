import { NextResponse } from "next/server"
import { query } from "../../../../lib/db"

export async function GET() {
  try {
    const res = await query(
      `
      select
        i.id,
        i.handle,
        i.display_name,
        i.bio,
        i.primary_niche,
        coalesce(sum(ip.followers), 0) as total_followers
      from influencers i
      left join influencer_platforms ip
        on ip.influencer_id = i.id
      group by i.id
      order by total_followers desc, i.handle asc
      `
    )

    return NextResponse.json(res.rows)
  } catch (err) {
    console.error("Error loading influencers list", err)
    return new NextResponse("Server error", { status: 500 })
  }
}
