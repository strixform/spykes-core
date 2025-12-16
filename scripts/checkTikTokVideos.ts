import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import fetch from "node-fetch"

async function main() {
  const host = process.env.TIKTOK_TRENDS_HOST
  const key = process.env.RAPIDAPI_KEY
  const path = "/api/videos?country=NG" // or US

  if (!host || !key) {
    console.error("Missing host or key")
    process.exit(1)
  }

  const url = "https://" + host + path
  console.log("Calling:", url)

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
    },
  })

  const data = await res.json()
  console.log(JSON.stringify(data, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
