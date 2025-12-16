import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import {
  upsertTrends,
  upsertTrendLocations,
  TrendInput,
  TrendLocationInput,
} from "../src/lib/ingestHelpers"

// In a real version, this function would call Google Trends or another API.
async function fetchGoogleTrendsMock(): Promise<{
  trends: TrendInput[]
  locations: TrendLocationInput[]
}> {
  // Pretend this came from an external source
  const trends: TrendInput[] = [
    {
      slug: "naira-dollar-google",
      title: "Naira to Dollar (Google)",
      description: "FX search interest based on Google Trends snapshot.",
      global_score: 88,
    },
    {
      slug: "fuel-scarcity-google",
      title: "Fuel scarcity (Google)",
      description: "Search interest in fuel queues and scarcity.",
      global_score: 79,
    },
  ]

  const locations: TrendLocationInput[] = [
    { trendSlug: "naira-dollar-google", state: "Lagos", lga: null, score: 90 },
    { trendSlug: "naira-dollar-google", state: "Abuja", lga: null, score: 76 },

    { trendSlug: "fuel-scarcity-google", state: "Lagos", lga: null, score: 82 },
    { trendSlug: "fuel-scarcity-google", state: "Oyo", lga: null, score: 60 },
  ]

  return { trends, locations }
}

async function main() {
  console.log("Starting Google Trends style ingestion")

  const { trends, locations } = await fetchGoogleTrendsMock()

  console.log("Upserting trends from external source")
  await upsertTrends(trends)

  console.log("Upserting locations from external source")
  await upsertTrendLocations(locations)

  console.log("Google Trends style ingestion completed")
}

main()
  .then(() => console.log("Google trends demo script finished"))
  .catch((err) => {
    console.error("Google trends ingestion failed")
    console.error(err)
    process.exit(1)
  })
