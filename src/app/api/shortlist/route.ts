import { NextResponse } from "next/server"
import { query } from "@/lib/db"

type Body = {
  handle?: string
}

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
      from shortlist_items si
      join influencers i on i.id = si.influencer_id
      left join influencer_platforms ip on ip.influencer_id = i.id
      group by i.id
      order by total_followers desc, i.handle asc
      `
    )

    return NextResponse.json(res.rows)
  } catch (err) {
    console.error("Error loading shortlist", err)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const handle = body.handle

    if (!handle) {
      return new NextResponse("Missing handle", { status: 400 })
    }

    const infRes = await query(
      `
      select id
      from influencers
      where handle = $1
      `,
      [handle]
    )

    if (infRes.rows.length === 0) {
      return new NextResponse("Influencer not found", { status: 404 })
    }

    const influencerId = infRes.rows[0].id

    await query(
      `
      insert into shortlist_items (influencer_id)
      values ($1)
      on conflict (influencer_id) do nothing
      `,
      [influencerId]
    )

    return new NextResponse("OK", { status: 200 })
  } catch (err) {
    console.error("Error adding to shortlist", err)
    return new NextResponse("Server error", { status: 500 })
  }
}
