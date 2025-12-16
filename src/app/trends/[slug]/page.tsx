import React from "react"
import AddToShortlistButton from "./AddToShortlistButton"
import { apiFetch } from "@/lib/apiClient"
import { TrendBadges } from "@/components/TrendBadges"

type Trend = {
  id: string
  slug: string
  title: string
  description: string
  global_score: number
  first_seen_at: string
  last_seen_at: string
  source?: string
  kind?: string
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

type TrendPageParams = {
  slug: string
}

type TrendPageProps = {
  params: Promise<TrendPageParams>
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

async function getTrendInfluencers(
  slug: string
): Promise<InfluencerImpact[]> {
  try {
    const data = (await apiFetch(
      `/api/trends/${slug}/influencers`
    )) as InfluencerImpact[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
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

  return `This is a ${band} signal with a score of ${score}, currently ${direction}. ${locLine}`
}

export default async function TrendPage({ params }: TrendPageProps) {
  const { slug } = await params

  const [detail, influencers] = await Promise.all([
    getTrendDetail(slug),
    getTrendInfluencers(slug),
  ])

  if (!detail) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">Trend not found</p>
          <p className="text-sm text-slate-400">
            This signal is not in the system yet.
          </p>
          <a
            href="/"
            className="text-sm text-sky-300 underline hover:text-sky-200"
          >
            Back to trends
          </a>
        </div>
      </main>
    )
  }

  const { trend, locations } = detail
  const summary = buildSummary(trend, locations)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        <a
          href="/"
          className="text-xs uppercase tracking-[0.28em] text-sky-400 hover:text-sky-300"
        >
          ← Trends
        </a>

        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-slate-900 pb-6">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Trend signal
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {trend.title}
            </h1>

            <TrendBadges source={trend.source} kind={trend.kind} />

            <div className="mt-1">
              <a
                href={`/rooms/${trend.slug}`}
                className="text-[11px] text-sky-300 hover:text-sky-200"
              >
                Open room for this signal →
              </a>
            </div>

            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              {trend.description}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-right space-y-2">
            <div>
              <p className="text-[10px] text-slate-400 tracking-[0.18em] uppercase">
                Global score
              </p>
              <p className="text-3xl font-semibold mt-1">
                {trend.global_score}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              slug: {trend.slug}
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <h2 className="text-xs font-medium text-slate-200 mb-2 uppercase tracking-[0.18em]">
              Signal window
            </h2>
            <div className="text-xs text-slate-400 space-y-1">
              <p>
                First seen:{" "}
                <span className="text-slate-100">
                  {formatDate(trend.first_seen_at)}
                </span>
              </p>
              <p>
                Last seen:{" "}
                <span className="text-slate-100">
                  {formatDate(trend.last_seen_at)}
                </span>
              </p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
            <h2 className="text-xs font-medium text-slate-200 mb-2 uppercase tracking-[0.18em]">
              AI-style summary
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {summary}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium text-slate-200 uppercase tracking-[0.18em]">
              Locations
            </h2>
            <p className="text-[11px] text-slate-500">
              {locations.length} active entries
            </p>
          </div>

          {locations.length === 0 ? (
            <p className="text-sm text-slate-400">
              No location data recorded yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {locations.map((loc, index) => (
                <div
                  key={`${loc.state}-${loc.lga ?? "all"}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-100">
                      {loc.state}
                      {loc.lga ? ` · ${loc.lga}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Local footprint
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-50">
                    {loc.score}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* influencers + actions can still be added here if needed */}

      </div>
    </main>
  )
}
