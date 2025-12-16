import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import fetch from "node-fetch"

async function main() {
  const url = "https://google-trends8.p.rapidapi.com/regions"

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY as string,
      "X-RapidAPI-Host": "google-trends8.p.rapidapi.com",
    },
  })

  const data = await res.json()

  console.log("RAW REGIONS DATA:")
  console.log(JSON.stringify(data, null, 2))
}

main()
  .then(() => console.log("Region test finished"))
  .catch((err) => console.error(err))
