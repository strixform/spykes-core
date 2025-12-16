import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { upsertTrends, TrendInput } from "../src/lib/ingestHelpers"

const DEMO_TRENDS: TrendInput[] = [
  {
    slug: "demo-ingestion",
    title: "Demo ingestion trend",
    description: "This trend was created by the ingestDemoTrends script.",
    global_score: 72,
  },
  {
    slug: "campus-gist-demo",
    title: "Campus gist demo",
    description: "Sample campus discussion pattern.",
    global_score: 64,
  },
  {
    slug: "crypto-chats-demo",
    title: "Crypto chats demo",
    description: "Crypto chatter and discussion demo.",
    global_score: 81,
  },
  {
    slug: "fuel-queue-demo",
    title: "Fuel queue demo",
    description: "Demo trend showing fuel scarcity patterns.",
    global_score: 59,
  }
]

async function main() {
  console.log("Starting demo trend ingestion")
  await upsertTrends(DEMO_TRENDS)
  console.log("All demo trends upserted")
}

main()
  .then(() => console.log("Ingestion script finished"))
  .catch((err) => {
    console.error("Ingestion script failed")
    console.error(err)
    process.exit(1)
  })
