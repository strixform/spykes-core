import React from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/apiClient"

type Trend = {
  id: string
  slug: string
  title: string
  description: string
  global_score: number
  first_seen_at: string
  last_seen_at: string
}

type LocationRow = {
  state: string
  lga: string | null
  score: number
}

type TrendDetailResponse = {
  trend: Trend
  locations: LocationRow[]
}

type InfluencerImpact = {
  handle: string
  display_name: string | null
  primary_niche: string | null
  estimated_reach: number
  engagement_score: number
  primary_state: string | null
}

type ShortlistRow = {
  id: string
  handle: string
  display_name: string | null
  bio: string | null
  primary_niche: string | null
  total_followers: string | number
}

type CampaignSearchParams = {
  trend?: string
}

async function getTrendDetail(slug: string): Promise<TrendDetailResponse | null> {
  try {
    const data = (await apiFetch(`/api/trends/${slug}`)) as TrendDetailResponse
    if (!data || !data.trend) return null
    return data
  } catch {
    return null
  }
}

async function getTrendInfluencers(slug: string): Promise<InfluencerImpact[]> {
  try {
    const data = (await apiFetch(`/api/trends/${slug}/influencers`)) as InfluencerImpact[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function getShortlist(): Promise<ShortlistRow[]> {
  try {
    const data = (await apiFetch("/api/shortlist")) as ShortlistRow[]
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

function buildSummary(trend: Trend, locations: LocationRow[]): string {
  const score = trend.global_score
  let band = "moderate"
  let direction = "steady"

  if (score >= 85) {
    band = "very strong"
    direction = "loud and hard to ignore"
  } else if (score >= 70) {
    band = "strong"
    direction = "active and visible across feeds"
  } else if (score <= 55) {
    band = "soft"
    direction = "present but fading into background"
  }

  const topLoc =
    locations.length > 0 ? locations[0].state : "no clear top location yet"

  const locCount = locations.length
  const locLine =
    locCount > 1
      ? `Most of the signal clusters around ${topLoc}, with ${locCount} locations showing activity.`
      : locCount === 1
      ? `Most of the signal clusters around ${topLoc}.`
      : `Location footprint has not been mapped yet.`

  return `This is a ${band} signal with a score of ${score}. It is ${direction}. ${locLine}`
}

export default async function CampaignPage({
  searchParams,
}: {
  searchParams: Promise<CampaignSearchParams>
}) {
  const sp = await searchParams
  const trendSlug = sp.trend || "naira-dollar"

  const [detail, infs, shortlistRaw] = await Promise.all([
    getTrendDetail(trendSlug),
    getTrendInfluencers(trendSlug),
    getShortlist(),
  ])

  if (!detail) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">Trend not found</p>
          <p className="text-sm text-slate-400">This trend slug does not exist.</p>
          <a href="/" className="text-sm text-sky-300 underline hover:text-sky-200">
            Back to trends
          </a>
        </div>
      </main>
    )
  }

  const shortlist = shortlistRaw.map((i) => ({
    ...i,
    total_followers: parseFollowers(i.total_followers),
  }))

  const { trend, locations } = detail
  const summary = buildSummary(trend, locations)

  const impactMap = new Map<string, InfluencerImpact>()
  for (const inf of infs) {
    impactMap.set(inf.handle.toLowerCase(), inf)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        <Link href="/" className="text-xs uppercase tracking-[0.28em] text-sky-400">
          Spykes
        </Link>

        <header className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Campaign view</p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{trend.title}</h1>
              <p className="text-sm text-slate-300 max-w-xl">Trend summary and influencer impact.</p>
            </div>

            <div className="text-xs text-slate-400 space-y-1 md:text-right">
              <p>
                Trend slug:{" "}
                <span className="font-mono text-sky-300">{trend.slug}</span>
              </p>
              <p>
                Shortlist size:{" "}
                <span className="text-slate-100 font-semibold">{shortlist.length}</span>
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Left column */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Trend snapshot</p>
              <h2 className="text-lg font-medium text-slate-50">{trend.title}</h2>
              <p className="text-sm text-slate-300">{trend.description}</p>

              <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-400 mt-3">
                <div>
                  <p className="uppercase tracking-wide text-[10px]">Score</p>
                  <p className="text-slate-100 font-semibold">{trend.global_score}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-[10px]">First seen</p>
                  <p>{new Date(trend.first_seen_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-[10px]">Last seen</p>
                  <p>{new Date(trend.last_seen_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">AI-style summary</p>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{summary}</p>
            </div>

            {/* Locations */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Top locations</p>
              {locations.length === 0 ? (
                <p className="text-xs text-slate-400">No location data.</p>
              ) : (
                <div className="space-y-1 text-xs text-slate-300">
                  {locations.slice(0, 5).map((loc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>
                        {loc.state}
                        {loc.lga ? ` · ${loc.lga}` : ""}
                      </span>
                      <span className="text-slate-200 font-semibold">{loc.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href={`/trends/${trend.slug}`} className="text-[11px] text-sky-300 hover:text-sky-200">
              Open full trend view →
            </Link>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-200">Shortlisted influencers</p>
              <p className="text-[11px] text-slate-500">
                {shortlist.length} in shortlist · {infs.length} linked to signal
              </p>
            </div>

            {shortlist.length === 0 ? (
              <p className="text-sm text-slate-400">Shortlist is empty.</p>
            ) : (
              <div className="space-y-3">
                {shortlist.map((inf) => {
                  const total = inf.total_followers as number
                  const impact = impactMap.get(inf.handle.toLowerCase())

                  return (
                    <div
                      key={inf.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      {/* Left */}
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Influencer</p>
                        <p className="text-sm font-medium text-slate-100">{inf.display_name || inf.handle}</p>
                        <p className="text-xs text-slate-300">@{inf.handle}</p>
                        <p className="text-xs text-slate-400 mt-1">{inf.bio || "No bio yet."}</p>

                        <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 mt-1">
                          <span>
                            Followers{" "}
                            <span className="text-slate-100 font-semibold">{total.toLocaleString()}</span>
                          </span>
                          <span>
                            Niche{" "}
                            <span className="text-slate-100">{inf.primary_niche || "—"}</span>
                          </span>
                          {impact && (
                            <span>
                              Signal reach{" "}
                              <span className="text-slate-100 font-semibold">
                                {impact.estimated_reach.toLocaleString()}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-end gap-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-3 py-1 " +
                              (impact
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/60"
                                : "bg-slate-800 text-slate-300 border border-slate-700")
                            }
                          >
                            {impact ? "Driving this signal" : "Not a core driver (yet)"}
                          </span>
                        </div>

                        {impact && (
                          <div className="text-right space-y-1">
                            <p>
                              Main location:{" "}
                              <span className="text-slate-100">{impact.primary_state || "—"}</span>
                            </p>
                            <p>
                              Engagement:{" "}
                              <span className="text-slate-100">
                                {(impact.engagement_score * 100).toFixed(0)}%
                              </span>
                            </p>
                          </div>
                        )}

                        <Link
                          href={`/influencers/${inf.handle}`}
                          className="text-sky-300 hover:text-sky-200"
                        >
                          Open profile →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
