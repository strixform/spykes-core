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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// Format date as yyyy-mm-dd for the API
function getTodayDateString() {
  const d = new Date()
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

async function fetchGoogleTrendsNigeria() {
  const date = getTodayDateString()

  const url = `https://google-trends8.p.rapidapi.com/trendings?region_code=NG&date=${date}&hl=en-US`

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY as string,
      "X-RapidAPI-Host": "google-trends8.p.rapidapi.com",
    },
  })

 const data: any = await res.json()

  console.log("RAW GOOGLE TRENDS DATA:")
  console.log(JSON.stringify(data, null, 2))

  const items = data?.results || []
  const trends: TrendInput[] = []
  const locations: TrendLocationInput[] = []

  if (!items.length) {
    return { trends, locations }
  }

  for (const item of items.slice(0, 5)) {
    const keyword = item?.title
    if (!keyword) continue

    const slug = "google-" + slugify(keyword)
    const score = 75

    trends.push({
      slug,
      title: `${keyword} (Google NG)`,
      description: `Google Nigeria trending topic on ${date}: ${keyword}`,
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
  console.log("Starting GOOGLE TRENDS Nigeria ingestion")

  const { trends, locations } = await fetchGoogleTrendsNigeria()

  console.log("Fetched", trends.length, "Google Nigeria trends")

  if (trends.length > 0) {
    await upsertTrends(trends)
    await upsertTrendLocations(locations)
  }

  console.log("Google Trends Nigeria ingestion completed")
}

main()
  .then(() => console.log("Google ingestion script finished"))
  .catch((err) => {
    console.error("Google ingestion FAILED")
    console.error(err)
    process.exit(1)
  })
