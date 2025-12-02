import React from "react"
import Link from "next/link"
import { apiFetch } from "../lib/apiClient"

type TrendRow = {
  id: string
  slug: string
  title: string
  description?: string
  global_score?: number
  momentum?: string
  top_location?: string
}

type HomeSearchParams = {
  q?: string
  momentum?: string
  window?: string
}

// load trends from backend
async function getTrends(): Promise<TrendRow[]> {
  try {
    const res = await apiFetch("/api/trends", { cache: "no-store" })
    if (!res.ok) return []
    const data = (await res.json()) as TrendRow[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// heuristic for momentum from score (for demo)
function deriveMomentum(score?: number): "Rising" | "Stable" | "Cooling" {
  if (typeof score !== "number") return "Stable"
  if (score >= 80) return "Rising"
  if (score <= 60) return "Cooling"
  return "Stable"
}

// heuristic for time window bucket from score (for demo)
function deriveWindow(score?: number): "all" | "24h" | "today" | "7d" {
  if (typeof score !== "number") return "all"
  if (score >= 85) return "24h"
  if (score >= 70) return "today"
  if (score >= 60) return "7d"
  return "all"
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>
}) {
  const sp = await searchParams
  const trendsRaw = await getTrends()

  const searchQuery = (sp.q || "").toLowerCase().trim()
  const momentumFilter = (sp.momentum || "all").toLowerCase()
  const windowFilter = (sp.window || "all").toLowerCase()

  const trends = trendsRaw
    .map((t) => {
      const score =
        typeof t.global_score === "number" ? t.global_score : undefined
      const momentum = (t.momentum as any) || deriveMomentum(score)
      const windowBucket = deriveWindow(score)
      return { ...t, global_score: score, momentum, windowBucket }
    })
    .filter((t) => {
      if (searchQuery) {
        const text = `${t.title} ${t.description || ""}`.toLowerCase()
        if (!text.includes(searchQuery)) return false
      }
      if (momentumFilter !== "all") {
        if (t.momentum.toLowerCase() !== momentumFilter) return false
      }
      if (windowFilter !== "all") {
        if (t.windowBucket !== windowFilter) return false
      }
      return true
    })

  const heatmap = [
    { state: "Ikeja", value: 240 },
    { state: "Lekki", value: 196 },
    { state: "Victoria Island", value: 160 },
    { state: "Abuja", value: 148 },
    { state: "Ibadan", value: 126 },
    { state: "Lagos Island", value: 80 },
    { state: "Surulere", value: 40 },
    { state: "Lagos", value: 36 },
    { state: "Yaba", value: 32 },
    { state: "Ojota", value: 32 },
    { state: "Port Harcourt", value: 14 },
  ]
  const maxHeat = heatmap.reduce((m, r) => Math.max(m, r.value), 1)

  // helper to keep q + momentum + window in links
  const buildHref = (opts: {
    q?: string
    momentum?: string
    window?: string
  }) => {
    const params = new URLSearchParams()
    if (opts.q) params.set("q", opts.q)
    if (opts.momentum && opts.momentum !== "all")
      params.set("momentum", opts.momentum)
    if (opts.window && opts.window !== "all") params.set("window", opts.window)
    const q = params.toString()
    return q ? `/?${q}` : "/"
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:py-10">
        {/* TOP HEADER */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-400">
            Spykes
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Live trend intelligence for Nigerian streets and screens
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Slow time down. Watch what is moving across Nigeria in real
                time. Track the signals before they become noise.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200">
              <p className="uppercase tracking-[0.22em]">Backend status</p>
              <p className="mt-1 font-medium">Online · data sample feed</p>
            </div>
          </div>
        </header>

        {/* FILTER BAR */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form className="flex flex-1 items-center gap-2" action="/" method="GET">
            <input
              name="q"
              defaultValue={searchQuery}
              suppressHydrationWarning
              className="flex-1 rounded-full bg-slate-900/80 border border-slate-800 px-4 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Type a topic. Example: VDM matter, fuel scarcity, naira to dollar"
            />
            <button
              type="submit"
              className="rounded-full bg-cyan-400 text-slate-950 text-xs font-medium px-4 py-2 hover:bg-cyan-300"
            >
              Search
            </button>
            <a
              href="/"
              className="rounded-full border border-slate-600 text-slate-200 text-xs px-3 py-2 hover:border-slate-400 text-center"
            >
              Reset
            </a>
          </form>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {/* TIME WINDOW FILTER */}
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-slate-400">
                Time window
              </span>
              <div className="flex gap-1">
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: momentumFilter,
                    window: "all",
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (windowFilter === "all"
                        ? "bg-slate-200 text-slate-900"
                        : "border border-slate-600")
                    }
                  >
                    All
                  </span>
                </a>
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: momentumFilter,
                    window: "24h",
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (windowFilter === "24h"
                        ? "border border-cyan-400 text-cyan-200 bg-cyan-500/10"
                        : "border border-slate-600")
                    }
                  >
                    24h
                  </span>
                </a>
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: momentumFilter,
                    window: "today",
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (windowFilter === "today"
                        ? "border border-emerald-500/60 text-emerald-300 bg-emerald-500/10"
                        : "border border-slate-600")
                    }
                  >
                    Today
                  </span>
                </a>
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: momentumFilter,
                    window: "7d",
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (windowFilter === "7d"
                        ? "border border-violet-500/60 text-violet-300 bg-violet-500/10"
                        : "border border-slate-600")
                    }
                  >
                    7 days
                  </span>
                </a>
              </div>
            </div>

            {/* MOMENTUM FILTERS */}
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-slate-400">
                Momentum
              </span>
              <div className="flex gap-1">
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: "all",
                    window: windowFilter,
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (momentumFilter === "all"
                        ? "bg-slate-200 text-slate-900"
                        : "border border-slate-600")
                    }
                  >
                    All
                  </span>
                </a>
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: "rising",
                    window: windowFilter,
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (momentumFilter === "rising"
                        ? "border border-emerald-500/60 text-emerald-300 bg-emerald-500/10"
                        : "border border-slate-600")
                    }
                  >
                    Rising
                  </span>
                </a>
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: "stable",
                    window: windowFilter,
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (momentumFilter === "stable"
                        ? "border border-sky-500/60 text-sky-300 bg-sky-500/10"
                        : "border border-slate-600")
                    }
                  >
                    Stable
                  </span>
                </a>
                <a
                  href={buildHref({
                    q: searchQuery,
                    momentum: "cooling",
                    window: windowFilter,
                  })}
                >
                  <span
                    className={
                      "rounded-full px-3 py-1 " +
                      (momentumFilter === "cooling"
                        ? "border border-amber-400/70 text-amber-300 bg-amber-500/10"
                        : "border border-slate-600")
                    }
                  >
                    Cooling
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* TREND CARDS LEFT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Live trend board
              </p>
              <p className="text-[11px] text-slate-500">
                {trends.length} active topics
              </p>
            </div>

            <div className="space-y-3">
              {trends.map((trend) => {
                const score = trend.global_score
                const momentum = trend.momentum as string

                const momentumColor =
                  momentum === "Rising"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/50"
                    : momentum === "Cooling"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/60"
                    : "bg-slate-700/40 text-slate-200 border-slate-500/50"

                return (
                  <Link
                    key={trend.id}
                    href={`/trends/${trend.slug}`}
                    className="block rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/95 px-4 py-3 md:px-5 md:py-4 hover:border-cyan-400/60 hover:bg-slate-900/90 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            Trend
                          </p>
                        </div>
                        <h2 className="text-base md:text-lg font-medium leading-tight">
                          {trend.title}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-300 max-w-xl">
                          {trend.description || "No description yet."}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={
                            "border rounded-full px-3 py-1 text-[11px] font-medium " +
                            momentumColor
                          }
                        >
                          {momentum}
                        </span>
                        <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                          <p>
                            Global score{" "}
                            <span className="text-slate-100 font-semibold">
                              {typeof score === "number" ? score : "—"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        <span>Mentions</span>
                        <span className="text-slate-200 font-medium">—</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>Reach</span>
                        <span className="text-slate-200 font-medium">—</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>Top location</span>
                        <span className="text-slate-200 font-medium">
                          {trend.top_location || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        <span>Window</span>
                        <span className="text-slate-200 font-medium">
                          {trend.windowBucket === "24h"
                            ? "24h"
                            : trend.windowBucket === "today"
                            ? "Today"
                            : trend.windowBucket === "7d"
                            ? "7 days"
                            : "All"}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {trends.length === 0 && (
                <p className="text-sm text-slate-400">No trends found.</p>
              )}
            </div>
          </div>

          {/* LOCATION HEATMAP RIGHT */}
          <aside className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Location heatmap
              </p>
              <p className="text-[10px] text-slate-500">Across Nigeria</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 space-y-2">
              {heatmap.map((row) => {
                const width = `${Math.max(
                  8,
                  Math.round((row.value / maxHeat) * 100)
                )}%`
                return (
                  <div
                    key={row.state}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="text-slate-300">{row.state}</span>
                    <div className="flex-1 mx-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{ width }}
                      />
                    </div>
                    <span className="text-slate-400">{row.value}</span>
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-slate-500">
              Surface watching local data only. Backend on port 5000 feeds this
              deck in real time.
            </p>
          </aside>
        </section>
      </div>
    </main>
  )
}
