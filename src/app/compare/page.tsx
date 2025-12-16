import React from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/apiClient"
import { TrendBadges } from "@/components/TrendBadges"

type Trend = {
  id: string
  slug: string
  title: string
  description?: string
  global_score?: number
  top_location?: string
  source?: string
  kind?: string
}

type CompareSearchParams = {
  left?: string
  right?: string
}

async function getTrend(slug: string): Promise<Trend | null> {
  if (!slug) return null

  try {
    const data = (await apiFetch(`/api/trends/${slug}`)) as {
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
}> {
  const sp = await spPromise

  const leftSlug = sp.left || "naira-dollar"
  const rightSlug = sp.right || "fuel-scarcity-latest"

  const [leftTrend, rightTrend] = await Promise.all([
    getTrend(leftSlug),
    getTrend(rightSlug),
  ])

  return { leftSlug, rightSlug, leftTrend, rightTrend }
}

function formatScore(score?: number) {
  return typeof score === "number" ? score : undefined
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<CompareSearchParams>
}) {
  const { leftSlug, rightSlug, leftTrend, rightTrend } =
    await getCompareData(searchParams)

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
                Place two trends side by side and see how their scores, summary
                and location footprint differ.
              </p>
            </div>
          </div>
        </header>

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
            <span className="font-mono text-sky-200">{leftSlug}</span>, right ={" "}
            <span className="font-mono text-sky-200">{rightSlug}</span>
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {/* Left signal */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/95 px-5 py-4 space-y-3">
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

                <TrendBadges source={leftTrend.source} kind={leftTrend.kind} />

                <p className="text-xs text-slate-300">
                  {leftTrend.description || "No description yet."}
                </p>
                <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-400 mt-3">
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">Score</p>
                    <p className="text-slate-100 font-semibold">
                      {formatScore(leftTrend.global_score) ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">
                      Top location
                    </p>
                    <p className="text-slate-100">
                      {leftTrend.top_location || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">Slug</p>
                    <p className="font-mono text-slate-300">
                      {leftTrend.slug}
                    </p>
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

          {/* Right signal */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/95 px-5 py-4 space-y-3">
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

                <TrendBadges source={rightTrend.source} kind={rightTrend.kind} />

                <p className="text-xs text-slate-300">
                  {rightTrend.description || "No description yet."}
                </p>
                <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-400 mt-3">
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">Score</p>
                    <p className="text-slate-100 font-semibold">
                      {formatScore(rightTrend.global_score) ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">
                      Top location
                    </p>
                    <p className="text-slate-100">
                      {rightTrend.top_location || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[10px]">Slug</p>
                    <p className="font-mono text-slate-300">
                      {rightTrend.slug}
                    </p>
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
