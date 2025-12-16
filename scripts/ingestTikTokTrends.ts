import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import fetch from "node-fetch"
import {
  upsertTrends,
  upsertTrendLocations,
} from "../src/lib/ingestHelpers"

function slugify(text: string) {
  return String(text).toLowerCase().trim().split(" ").join("-")
}

async function fetchTikTokTrends() {
  const host = process.env.TIKTOK_TRENDS_HOST || ""
  const key = process.env.RAPIDAPI_KEY || ""

  if (!host || !key) {
    throw new Error("TIKTOK_TRENDS_HOST or RAPIDAPI_KEY is missing in .env.local")
  }

  // Correct path for this RapidAPI: /api/hashtags?country=NG
  const path = "/api/hashtags?country=NG"
  const url = "https://" + host + path

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
  })

  const data: any = await res.json()

  console.log("RAW TIKTOK DATA:")
  console.log(JSON.stringify(data, null, 2))

  // TikTok Trending Hashtags API: data.data is the array
  let items: any[] = []

  if (Array.isArray(data?.data)) {
    items = data.data
  }

  const trends: any[] = []
  const locations: any[] = []

  for (let i = 0; i < items.length && i < 20; i++) {
    const item = items[i]
    const tag =
      typeof item.hashtag_name === "string" ? item.hashtag_name : ""
    if (!tag) continue

    const slug = "tiktok-" + slugify(tag.replace("#", ""))

    const rawViews = Number(item.video_views)
    const score =
      Number.isFinite(rawViews) && rawViews > 0 ? rawViews : 75

    trends.push({
      slug,
      title: tag + " (TikTok)",
      description: "Trending TikTok hashtag: " + tag,
      global_score: score,
      source: "tiktok",
      kind: "hashtag",
    })

    locations.push({
      trendSlug: slug,
      state: "Lagos",
      lga: null,
      score: score,
    })
  }

  return { trends, locations }
}

async function main() {
  console.log("Ingesting TikTok trends…")

  const result = await fetchTikTokTrends()

  console.log("TikTok topics fetched:", result.trends.length)

  if (result.trends.length > 0) {
    await upsertTrends(result.trends)
    await upsertTrendLocations(result.locations)
  }

  console.log("TikTok trends ingestion completed")
}

main()
  .then(() => console.log("TikTok script finished"))
  .catch((err) => {
    console.error("TikTok trends FAILED")
    console.error(err)
    process.exit(1)
  })
