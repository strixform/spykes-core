import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import {
  upsertTrendLocations,
  TrendLocationInput,
} from "../src/lib/ingestHelpers"

const DEMO_LOCATIONS: TrendLocationInput[] = [
  // demo-ingestion
  { trendSlug: "demo-ingestion", state: "Lagos", lga: null, score: 68 },
  { trendSlug: "demo-ingestion", state: "Abuja", lga: null, score: 54 },

  // campus-gist-demo
  { trendSlug: "campus-gist-demo", state: "Lagos", lga: null, score: 61 },
  { trendSlug: "campus-gist-demo", state: "Oyo", lga: null, score: 48 },

  // crypto-chats-demo
  { trendSlug: "crypto-chats-demo", state: "Lagos", lga: null, score: 75 },
  { trendSlug: "crypto-chats-demo", state: "Abuja", lga: null, score: 63 },

  // fuel-queue-demo
  { trendSlug: "fuel-queue-demo", state: "Lagos", lga: null, score: 55 },
  { trendSlug: "fuel-queue-demo", state: "Abuja", lga: null, score: 47 },
]

async function main() {
  console.log("Starting demo trend-location ingestion")
  await upsertTrendLocations(DEMO_LOCATIONS)
  console.log("All demo trend locations processed")
}

main()
  .then(() => console.log("Location ingestion finished"))
  .catch((err) => {
    console.error("Location ingestion failed")
    console.error(err)
    process.exit(1)
  })
