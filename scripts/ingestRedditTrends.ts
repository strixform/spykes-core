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

async function fetchRedditTrends() {
  const url = process.env.REDDIT_TRENDS_URL
  if (!url) {
    throw new Error("REDDIT_TRENDS_URL is not set in .env.local")
  }

  const res = await fetch(url)
  const data = await res.json()

  // For Reddit, a common shape:
  // { data: { children: [ { data: { title, subreddit, score } }, ... ] } }
  const children =
    data?.data?.children ||
    data.items ||
    data.trends ||
    []

  const trends: TrendInput[] = []
  const locations: TrendLocationInput[] = []

  for (const child of children.slice(0, 10)) {
    const post = child.data || child
    const title = post.title || post.name
    if (!title) continue

    const slug = "reddit-" + slugify(title)
    const score =
      typeof post.score === "number"
        ? post.score
        : typeof post.ups === "number"
        ? post.ups
        : 75

    const subreddit = post.subreddit || "reddit"

    trends.push({
      slug,
      title: `${title} (r/${subreddit})`,
      description:
        post.selftext ||
        `Trending Reddit post in r/${subreddit}: ${title}`,
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
  console.log("Ingesting Reddit trends…")

  const { trends, locations } = await fetchRedditTrends()

  console.log("Reddit topics fetched:", trends.length)

  if (trends.length > 0) {
    await upsertTrends(trends)
    await upsertTrendLocations(locations)
  }

  console.log("Reddit trends ingestion completed")
}

main()
  .then(() => console.log("Reddit script finished"))
  .catch((err) => {
    console.error("Reddit trends ingestion failed")
    console.error(err)
    process.exit(1)
  })
