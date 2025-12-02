import React from "react"
import Link from "next/link"
import { apiFetch } from "../../lib/apiClient"


type Trend = {
  id: string
  slug: string
  title: string
  description?: string
  global_score?: number
}

type LocationRow = {
  state: string
  lga: string | null
  score: number
}

type TrendApiResponse = {
  trend?: Trend
  locations?: LocationRow[]
}

type CompareSearchParams = {
  left?: string
  right?: string
}

async function getTrend(slug: string): Promise<Trend | null> {
  if (!slug) return null

  try {
    const res = await apiFetch(`/api/trends/${slug}`)
    if (!res.ok) return null

    const data = (await res.json()) as {
      trend?: Trend
      locations?: { state: string }[]
    }

    if (!data.trend) return null

    const topLocation =
      data.locations && data.locations.length > 0
        ? data.locations[0].state
        : undefined

    return { ...data.trend, top_location: topLocation }
  } catch {
    return null
  }
}

async function getCompareData(
  spPromise: Promise<CompareSearchParams>
): Promise<{
  leftSlug: string
  rightSlug: string
  leftTrend: Trend | null
  rightTrend: Trend | null
  leftLocations: LocationRow[]
  rightLocations: LocationRow[]
}> {
  const sp = await spPromise

  const leftSlug = sp.left || "naira-dollar"
  const rightSlug = sp.right || "fuel-scarcity"

  const [left, right] = await Promise.all([
    getTrendWithLocations(leftSlug),
    getTrendWithLocations(rightSlug),
  ])

  return {
    leftSlug,
    rightSlug,
    leftTrend: left.trend,
    rightTrend: right.trend,
    leftLocations: left.locations,
    rightLocations: right.locations,
  }
}

function formatScore(score?: number) {
  return typeof score === "number" ? score : undefined
}

function topLocationName(locations: LocationRow[]) {
  if (!locations.length) return "—"
  return locations[0].state
}

function compareScoreLabel(
  leftScore?: number,
  rightScore?: number
): "left" | "right" | "tie" | "none" {
  if (typeof leftScore !== "number" || typeof rightScore !== "number") {
    return "none"
  }
  if (leftScore > rightScore) return "left"
  if (rightScore > leftScore) return "right"
  return "tie"
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<CompareSearchParams>
}) {
  const {
    leftSlug,
    rightSlug,
    leftTrend,
    rightTrend,
    leftLocations,
    rightLocations,
  } = await getCompareData(searchParams)

  const leftScore = formatScore(leftTrend?.global_score)
  const rightScore = formatScore(rightTrend?.global_score)

  const scoreWinner = compareScoreLabel(leftScore, rightScore)

  const leftTopLocation = topLocationName(leftLocations)
  const rightTopLocation = topLocationName(rightLocations)

  const leftMaxHeat =
    leftLocations.reduce((max, l) => Math.max(max, l.score), 1) || 1
  const rightMaxHeat =
    rightLocations.reduce((max, l) => Math.max(max, l.score), 1) || 1

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.28em] text-sky-400"
          >
            Spykes
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Compare two signals
              </h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Place two trends side by side and see how their scores,
                summaries and location footprints differ.
              </p>
            </div>
          </div>
        </header>

        {/* URL hints */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-[11px] text-slate-400 space-y-1">
          <p className="font-medium text-slate-200">How to switch signals</p>
          <p>
            Change the URL like{" "}
            <span className="font-mono text-sky-300">
              /compare?left=vdm-matter&amp;right=fuel-scarcity-latest
            </span>
          </p>
          <p>
            Current: left ={" "}
            <span className="font-mono text-sky-200">{leftSlug}</span>, right =
            <span className="font-mono text-sky-200"> {rightSlug}</span>
          </p>
        </section>

        {/* score strip */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <p className="uppercase tracking-[0.18em] text-slate-400">
              Score comparison
            </p>
            <p>
              Left score:{" "}
              <span className="font-semibold text-slate-50">
                {leftScore ?? "—"}
              </span>{" "}
              · Right score:{" "}
              <span className="font-semibold text-slate-50">
                {rightScore ?? "—"}
              </span>
            </p>
          </div>
          <div className="space-y-1 md:text-right">
            <p className="uppercase tracking-[0.18em] text-slate-400">
              Stronger signal
            </p>
            <p className="font-semibold">
              {scoreWinner === "left" && "Left signal"}
              {scoreWinner === "right" && "Right signal"}
              {scoreWinner === "tie" && "Both equal"}
              {scoreWinner === "none" && "Not enough data"}
            </p>
          </div>
        </section>

        {/* comparison grid */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* left card */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/95 px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Left signal
              </p>
              <span className="text-[10px] font-mono text-slate-500">
                {leftSlug}
              </span>
            </div>
            {leftTrend ? (
              <>
                <h2 className="text-lg font-medium">{leftTrend.title}</h2>
                <p className="text-xs text-slate-300">
                  {leftTrend.description || "No description yet."}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-slate-400">
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">
                      Score
                    </p>
                    <p className="text-slate-100 font-semibold">
                      {leftScore ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">
                      Top location
                    </p>
                    <p className="text-slate-100">{leftTopLocation}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">Slug</p>
                    <p className="font-mono text-slate-300">
                      {leftTrend.slug}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Location footprint
                  </p>
                  <div className="space-y-1">
                    {leftLocations.slice(0, 4).map((loc) => {
                      const width = `${Math.max(
                        8,
                        Math.round((loc.score / leftMaxHeat) * 100)
                      )}%`
                      return (
                        <div
                          key={loc.state}
                          className="flex items-center gap-2 text-[11px]"
                        >
                          <span className="text-slate-300 w-20 truncate">
                            {loc.state}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width }}
                            />
                          </div>
                          <span className="text-slate-400 w-6 text-right">
                            {loc.score}
                          </span>
                        </div>
                      )
                    })}
                    {leftLocations.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        No locations recorded.
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/trends/${leftTrend.slug}`}
                  className="inline-flex mt-3 text-[11px] text-sky-300 hover:text-sky-200"
                >
                  Open full signal →
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Could not load left signal.
              </p>
            )}
          </div>

          {/* right card */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/95 px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Right signal
              </p>
              <span className="text-[10px] font-mono text-slate-500">
                {rightSlug}
              </span>
            </div>
            {rightTrend ? (
              <>
                <h2 className="text-lg font-medium">{rightTrend.title}</h2>
                <p className="text-xs text-slate-300">
                  {rightTrend.description || "No description yet."}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3 text-[11px] text-slate-400">
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">
                      Score
                    </p>
                    <p className="text-slate-100 font-semibold">
                      {rightScore ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">
                      Top location
                    </p>
                    <p className="text-slate-100">{rightTopLocation}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">Slug</p>
                    <p className="font-mono text-slate-300">
                      {rightTrend.slug}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Location footprint
                  </p>
                  <div className="space-y-1">
                    {rightLocations.slice(0, 4).map((loc) => {
                      const width = `${Math.max(
                        8,
                        Math.round((loc.score / rightMaxHeat) * 100)
                      )}%`
                      return (
                        <div
                          key={loc.state}
                          className="flex items-center gap-2 text-[11px]"
                        >
                          <span className="text-slate-300 w-20 truncate">
                            {loc.state}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width }}
                            />
                          </div>
                          <span className="text-slate-400 w-6 text-right">
                            {loc.score}
                          </span>
                        </div>
                      )
                    })}
                    {rightLocations.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        No locations recorded.
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/trends/${rightTrend.slug}`}
                  className="inline-flex mt-3 text-[11px] text-sky-300 hover:text-sky-200"
                >
                  Open full signal →
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Could not load right signal.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
