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

async function fetchXTrends() {
  const host = process.env.X_TRENDS_HOST || ""
  const xPath = process.env.X_TRENDS_PATH || ""
  const key = process.env.RAPIDAPI_KEY || ""

  // ✅ note the OR operators (||) — do NOT change this line
  if (!host || !xPath || !key) {
    throw new Error(
      "X_TRENDS_HOST, X_TRENDS_PATH or RAPIDAPI_KEY is missing in .env.local"
    )
  }

  const url = "https://" + host + xPath

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
  })

  const data: any = await res.json()

  console.log("RAW X DATA:")
  console.log(JSON.stringify(data, null, 2))

  // Expect: { trends: [ { name, tweet_volume? }, ... ] } or [ { trends: [...] } ]
  let items: any[] = []

  if (Array.isArray(data.trends)) {
    items = data.trends
  } else if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].trends)) {
    items = data[0].trends
  }

  const trends: any[] = []
  const locations: any[] = []

  for (let i = 0; i < items.length && i < 20; i++) {
    const item = items[i]
    const name = typeof item.name === "string" ? item.name : ""

    if (!name) continue

    const slug = "x-" + slugify(name)

    const rawVolume =
      typeof item.tweet_volume === "number" ? item.tweet_volume : 0
    const score = rawVolume > 0 ? rawVolume : 75

    trends.push({
  slug,
  title: name + " (X)",
  description: "Trending topic on X: " + name,
  global_score: score,
  source: "x",
  kind: "topic",
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
  console.log("Ingesting X (Twitter) trends…")

  const result = await fetchXTrends()

  console.log("X topics fetched:", result.trends.length)

  if (result.trends.length > 0) {
    await upsertTrends(result.trends)
    await upsertTrendLocations(result.locations)
  }

  console.log("X trends ingestion completed")
}

main()
  .then(() => console.log("X script finished"))
  .catch((err) => {
    console.error("X trends FAILED")
    console.error(err)
    process.exit(1)
  })