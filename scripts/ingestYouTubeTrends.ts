import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import fetch from "node-fetch"
import {
  upsertTrends,
  upsertTrendLocations,
  TrendInput,
  TrendLocationInput,
} from "../src/lib/ingestHelpers"

function slugify(text: string) {
  return text.toLowerCase().trim().split(" ").join("-")
}

async function fetchYouTubeTrends() {
  const url = process.env.YT_TRENDS_URL
  if (!url) {
    throw new Error("YT_TRENDS_URL is not set in .env.local")
  }

  const res = await fetch(url)
  const data = await res.json()

  // Example expected shape:
  // { items: [ { title: "Video title", channel: "Channel", views: 200000 }, ... ] }
  const items = data.items || data.trends || data.data || []

  const trends: TrendInput[] = []
  const locations: TrendLocationInput[] = []

  for (const item of items.slice(0, 10)) {
    const title = item.title || item.name
    if (!title) continue

    const slug = "youtube-" + slugify(title)
    const score =
      typeof item.views === "number"
        ? item.views
        : typeof item.score === "number"
        ? item.score
        : 75

    trends.push({
      slug,
      title: `${title} (YouTube)`,
      description:
        item.description ||
        `Trending YouTube video: ${title}`,
      global_score: score,
    })

    locations.push({
      trendSlug: slug,
      state: "Lagos",
      lga: null,
      score,
    })
  }

  return { trends, locations }
}

async function main() {
  console.log("Ingesting YouTube trends…")

  const { trends, locations } = await fetchYouTubeTrends()

  console.log("YouTube topics fetched:", trends.length)

  if (trends.length > 0) {
    await upsertTrends(trends)
    await upsertTrendLocations(locations)
  }

  console.log("YouTube trends ingestion completed")
}

main()
  .then(() => console.log("YouTube script finished"))
  .catch((err) => {
    console.error("YouTube trends ingestion failed")
    console.error(err)
    process.exit(1)
  })
