import { NextResponse } from "next/server"
import { query } from "../../lib/db"

export async function GET() {
  try {
    const result = await query(
      `
      select
        id,
        slug,
        title,
        description,
        global_score
      from trends
      order by global_score desc
      limit 20
      `
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error loading trends", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
