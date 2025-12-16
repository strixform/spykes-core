import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import gtrends from "g-trends"

async function main() {
  console.log("Running ExploreTrendRequest test...")

  const { ExploreTrendRequest, SearchProviders } = gtrends as any

  const req = new ExploreTrendRequest({
    keyword: "Nigeria",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
    endTime: new Date(),
    geo: "NG",
    category: 0,
    searchType: SearchProviders.Web
  })

  const exploreData = await req.getExploration()

  console.log("RAW EXPLORE DATA:")
  console.log(JSON.stringify(exploreData, null, 2))
}

main().catch((err) => {
  console.error("Error in ingestRealGoogleTrends.ts")
  console.error(err)
  process.exit(1)
})