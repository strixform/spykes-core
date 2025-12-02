import React from "react"
import Link from "next/link"
import { apiFetch } from "../../../lib/apiClient"
import AddToShortlistButton from "../../../components/AddToShortlistButton"

type Influencer = {
  id: string
  handle: string
  display_name: string | null
  bio: string | null
  primary_niche: string | null
  avatar_url: string | null
  created_at: string
}

type PlatformRow = {
  platform: string
  platform_user_id: string | null
  platform_url: string | null
  followers: number
}

type MetricRow = {
  date: string
  platform: string
  reach: number
  mentions: number
  trend_impressions: number
  unique_trends: number
}

type ApiResponse = {
  influencer: Influencer
  platforms: PlatformRow[]
  metrics: MetricRow[]
}

type PageParams = {
  handle: string
}

async function getInfluencer(handle: string): Promise<ApiResponse | null> {
  try {
    const res = await apiFetch(`/api/influencers/${handle}`)
    if (!res.ok) return null
    const data = (await res.json()) as ApiResponse
    return data
  } catch {
    return null
  }
}

export default async function InfluencerPage({
  params,
}: {
  params: PageParams | Promise<PageParams>
}) {
  const p = params as any
  const resolved = typeof p.then === "function" ? await p : p

  const handle = resolved.handle
  const data = await getInfluencer(handle)

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">Influencer not found</p>
          <p className="text-sm text-slate-400">
            This handle is not in the system yet.
          </p>
          <a
            href="/influencers"
            className="text-sm text-sky-300 underline hover:text-sky-200"
          >
            Back to influencer radar
          </a>
        </div>
      </main>
    )
  }

  const { influencer, platforms, metrics } = data
  const name = influencer.display_name || influencer.handle
  const totalFollowers = platforms.reduce(
    (sum, p) => sum + (p.followers || 0),
    0
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        <Link
          href="/influencers"
          className="text-xs uppercase tracking-[0.28em] text-sky-400"
        >
          ← Influencer radar
        </Link>

        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-slate-900 pb-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Influencer profile
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {name}
            </h1>
            <p className="text-sm text-slate-300">@{influencer.handle}</p>

            <p className="text-sm text-slate-300 max-w-xl mt-2">
              {influencer.bio || "No bio yet."}
            </p>

            <div className="mt-3">
              <AddToShortlistButton handle={influencer.handle} />
            </div>
          </div>

          <div className="shrink-0 space-y-3 text-right text-xs text-slate-300">

            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Total followers
              </p>
              <p className="text-2xl font-semibold mt-1">
                {totalFollowers.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Primary niche
              </p>
              <p className="mt-1">
                {influencer.primary_niche || "Not set"}
              </p>
            </div>

          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
            <h2 className="text-xs font-medium text-slate-200 uppercase tracking-[0.18em]">
              Platforms
            </h2>
            {platforms.length === 0 && (
              <p className="text-xs text-slate-400">No platforms recorded.</p>
            )}
            {platforms.map((p) => (
              <div
                key={`${p.platform}-${p.platform_user_id || ""}`}
                className="flex items-center justify-between text-xs text-slate-300 py-1"
              >
                <div>
                  <p className="font-medium">{p.platform}</p>
                  <p className="text-slate-400">
                    {p.platform_user_id || ""}
                  </p>
                </div>
                <p className="text-slate-100 font-semibold">
                  {p.followers.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
            <h2 className="text-xs font-medium text-slate-200 uppercase tracking-[0.18em]">
              Recent metrics
            </h2>
            {metrics.length === 0 && (
              <p className="text-xs text-slate-400">No metrics recorded.</p>
            )}
            {metrics.map((m, index) => (
              <div
                key={`${m.date}-${m.platform}-${index}`}
                className="flex flex-col text-[11px] text-slate-300 py-1 border-b border-slate-900 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {m.platform} · {m.date}
                  </p>
                  <p className="text-slate-400">
                    Trends: {m.unique_trends}
                  </p>
                </div>
                <div className="flex gap-4 mt-1">
                  <p>Reach {m.reach.toLocaleString()}</p>
                  <p>Mentions {m.mentions}</p>
                  <p>Impressions {m.trend_impressions.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

        </section>

      </div>
    </main>
  )
}
