import React from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/apiClient"

type InfluencerRow = {
  id: string
  handle: string
  display_name: string | null
  bio: string | null
  primary_niche: string | null
  total_followers: string | number
}

type InfluencerSearchParams = {
  q?: string
  niche?: string
  band?: string
}

async function getInfluencers(): Promise<InfluencerRow[]> {
  try {
    const data = (await apiFetch("/api/influencers")) as InfluencerRow[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function parseFollowers(raw: string | number | null | undefined): number {
  if (typeof raw === "number") return raw
  if (typeof raw === "string") {
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function inBand(followers: number, band: string): boolean {
  if (!band || band === "all") return true
  if (band === "0-50k") return followers <= 50000
  if (band === "50k-200k") return followers > 50000 && followers <= 200000
  if (band === "200k-plus") return followers > 200000
  return true
}

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: Promise<InfluencerSearchParams>
}) {
  const sp = await searchParams

  const query = (sp.q || "").toLowerCase().trim()
  const nicheFilter = (sp.niche || "all").toLowerCase()
  const bandFilter = (sp.band || "all").toLowerCase()

  const raw = await getInfluencers()

  const influencers = raw
    .map((i) => ({
      ...i,
      total_followers: parseFollowers(i.total_followers),
    }))
    .filter((i) => {
      const total = i.total_followers as number

      if (query) {
        const text = `${i.handle} ${i.display_name || ""} ${i.bio || ""}`.toLowerCase()
        if (!text.includes(query)) return false
      }

      if (nicheFilter !== "all") {
        const n = (i.primary_niche || "").toLowerCase()
        if (!n.includes(nicheFilter)) return false
      }

      if (!inBand(total, bandFilter)) return false

      return true
    })

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-xs uppercase tracking-[0.28em] text-sky-400">
            Spykes
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Influencer radar
              </h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Search for handles and filter by niche and follower band.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form
              className="flex flex-1 items-center gap-2"
              action="/influencers"
              method="GET"
            >
              <input
                name="q"
                defaultValue={query}
                className="flex-1 rounded-full bg-slate-900/80 border border-slate-800 px-4 py-2 text-xs text-slate-100"
                placeholder="Search handle or niche..."
              />
              <button
                type="submit"
                className="rounded-full bg-cyan-400 text-slate-950 text-xs font-medium px-4 py-2"
              >
                Search
              </button>
              <a
                href="/influencers"
                className="rounded-full border border-slate-600 text-slate-200 text-xs px-3 py-2"
              >
                Reset
              </a>
            </form>

            <p className="text-[11px] text-slate-500">
              {influencers.length} profiles found
            </p>
          </div>

          {/* niche filters */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-[11px]">
            <div className="flex flex-wrap gap-1">
              <a href="/influencers" className={`rounded-full px-3 py-1 border ${nicheFilter==="all" ? "bg-slate-200 text-slate-900" : "border-slate-600"}`}>All</a>
              <a href="/influencers?niche=finance" className={`rounded-full px-3 py-1 border ${nicheFilter==="finance" ? "border-emerald-500/60 text-emerald-300 bg-emerald-500/10" : "border-slate-600"}`}>Finance</a>
              <a href="/influencers?niche=gist" className={`rounded-full px-3 py-1 border ${nicheFilter==="gist" ? "border-sky-500/60 text-sky-300 bg-sky-500/10" : "border-slate-600"}`}>Street gist</a>
              <a href="/influencers?niche=campus" className={`rounded-full px-3 py-1 border ${nicheFilter==="campus" ? "border-violet-500/60 text-violet-300 bg-violet-500/10" : "border-slate-600"}`}>Campus</a>
              <a href="/influencers?niche=crypto" className={`rounded-full px-3 py-1 border ${nicheFilter==="crypto" ? "border-amber-500/60 text-amber-300 bg-amber-500/10" : "border-slate-600"}`}>Crypto</a>
            </div>

            {/* band filters */}
            <div className="flex flex-wrap gap-1">
              <a href="/influencers" className={`rounded-full px-3 py-1 border ${bandFilter==="all" ? "bg-slate-200 text-slate-900" : "border-slate-600"}`}>All</a>
              <a href="/influencers?band=0-50k" className={`rounded-full px-3 py-1 border ${bandFilter==="0-50k" ? "border-slate-500 text-slate-100 bg-slate-700/60" : "border-slate-600"}`}>0–50k</a>
              <a href="/influencers?band=50k-200k" className={`rounded-full px-3 py-1 border ${bandFilter==="50k-200k" ? "border-cyan-500/60 text-cyan-300 bg-cyan-500/10" : "border-slate-600"}`}>50k–200k</a>
              <a href="/influencers?band=200k-plus" className={`rounded-full px-3 py-1 border ${bandFilter==="200k-plus" ? "border-emerald-500/60 text-emerald-300 bg-emerald-500/10" : "border-slate-600"}`}>200k+</a>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {influencers.length === 0 && (
            <p className="text-sm text-slate-400">No influencers found.</p>
          )}

          {influencers.map((inf) => {
            const total = inf.total_followers as number
            const name = inf.display_name || inf.handle

            return (
              <Link
                key={inf.id}
                href={`/influencers/${inf.handle}`}
                className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950 px-5 py-4 hover:border-cyan-400/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Influencer</p>
                    <h2 className="text-base md:text-lg font-medium">{name}</h2>
                    <p className="text-xs text-slate-300">@{inf.handle}</p>
                    <p className="text-xs text-slate-400 mt-1">{inf.bio || "No bio yet."}</p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <div>
                      <p className="uppercase tracking-wide text-[10px]">Followers</p>
                      <p className="text-slate-100 font-semibold">{total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-[10px]">Niche</p>
                      <p className="text-slate-200">{inf.primary_niche || "—"}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      </div>
    </main>
  )
}
