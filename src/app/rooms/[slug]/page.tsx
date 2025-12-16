import React from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/apiClient"
import { TrendBadges } from "@/components/TrendBadges"

type Trend = {
  id: string
  slug: string
  title: string
  description: string
  global_score: number
  source?: string
  kind?: string
}

type RoomParams = {
  slug: string
}

type TrendDetailResponse = {
  trend: Trend
}

type TikTokVideo = {
  id: string
  title: string
  url: string
  thumbnail: string
  duration: number
  created_at: string | null
}

async function getTrend(slug: string): Promise<Trend | null> {
  try {
    const data = (await apiFetch(`/api/trends/${slug}`)) as TrendDetailResponse
    return data.trend || null
  } catch {
    return null
  }
}

async function fetchTikTokVideos(): Promise<TikTokVideo[]> {
  try {
    const host = process.env.TIKTOK_VIDEOS_HOST || process.env.TIKTOK_TRENDS_HOST
    const key = process.env.RAPIDAPI_KEY
    const path = process.env.TIKTOK_VIDEOS_PATH || "/api/videos?country=NG"

    if (!host || !key || !path) {
      return []
    }

    const url = "https://" + host + path

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": host,
      },
      cache: "no-store",
    })

    const data: any = await res.json()

    // According to docs: { count, data: [ ... ] }
    const items: any[] = Array.isArray(data?.data) ? data.data : []

    return items.slice(0, 10).map((v: any) => ({
      id: String(v.id),
      title: v.title || "",
      url: v.item_url || "",
      thumbnail: v.thumbnail_url || "",
      duration: typeof v.duration === "number" ? v.duration : 0,
      created_at: v.created_at || null,
    }))
  } catch {
    return []
  }
}

export default async function RoomPage({
  params,
}: {
  params: Promise<RoomParams>
}) {
  const { slug } = await params
  const trend = await getTrend(slug)

  if (!trend) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium">Room not found</p>
          <p className="text-sm text-slate-400">
            This trend is not available yet.
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

  const isTikTok = trend.source && trend.source.toLowerCase() === "tiktok"
  const videos = isTikTok ? await fetchTikTokVideos() : []

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href={`/trends/${trend.slug}`}
          className="text-xs uppercase tracking-[0.28em] text-sky-400 hover:text-sky-300"
        >
          ← Back to trend
        </Link>

        <header className="space-y-3 border-b border-slate-900 pb-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Room
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {trend.title}
          </h1>

          <TrendBadges source={trend.source} kind={trend.kind} />

          <p className="text-sm text-slate-300 max-w-2xl">
            {trend.description}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* LIVE FEED */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
                Live TikTok feed
              </p>

              {!isTikTok && (
                <p className="text-xs text-slate-400">
                  Live feed currently wired for TikTok signals only. This
                  signal’s source is {trend.source || "unknown"}.
                </p>
              )}

              {isTikTok && videos.length === 0 && (
                <p className="text-xs text-slate-400">
                  No trending videos returned yet. Check your TikTok videos API
                  usage or region.
                </p>
              )}

              {isTikTok && videos.length > 0 && (
                <div className="space-y-3">
                  {videos.map((v) => (
                    <a
                      key={v.id}
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-2 rounded-xl border border-slate-800 hover:border-cyan-400/60 transition"
                    >
                      <img
                        src={v.thumbnail}
                        alt=""
                        className="w-20 h-14 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-100 line-clamp-2">
                          {v.title || "Untitled video"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Duration: {v.duration}s
                        </p>
                        {v.created_at && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {v.created_at}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Chat placeholder */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
                Room chat
              </p>
              <p className="text-xs text-slate-400">
                Later, this will be a live chat for strategists, brands and
                analysts to discuss this signal in real time.
              </p>
            </div>
          </div>

          {/* Meta section */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-1">
                Signal meta
              </p>
              <p className="text-xs text-slate-400">
                Global score:{" "}
                <span className="text-slate-100 font-semibold">
                  {trend.global_score}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                slug: {trend.slug}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-1">
                How to use this room
              </p>
              <p className="text-xs text-slate-400">
                Use this space to plan campaigns, screenshot key posts, and
                track how this signal behaves across TikTok, X and the rest of
                the stack. In the future this area can pull in live embeds and
                analytics.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
