import React from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/apiClient"

type ShortlistRow = {
  id: string
  handle: string
  display_name: string | null
  bio: string | null
  primary_niche: string | null
  total_followers: string | number
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

export default async function ShortlistPage() {
  const raw = await getShortlist()

  const items = raw.map((i) => ({
    ...i,
    total_followers: parseFollowers(i.total_followers),
  }))

  const summary = items.length
    ? items
        .map((inf, idx) => {
          const total = inf.total_followers as number
          const name = inf.display_name || inf.handle
          const niche = inf.primary_niche || "not set"
          return `${idx + 1}. ${name} (@${inf.handle}) - niche: ${niche} - followers: ${total.toLocaleString()}`
        })
        .join("\n")
    : "No influencers in shortlist yet."

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        <Link href="/" className="text-xs uppercase tracking-[0.28em] text-sky-400">
          Spykes
        </Link>

        <header className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Campaign shortlist
          </h1>
          <p className="text-sm text-slate-300">Influencers you saved.</p>
          <p className="text-[11px] text-slate-500">{items.length} influencers</p>
        </header>

        <section className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-slate-400">Shortlist is empty.</p>
          )}

          {items.map((inf) => {
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
                      <p className="text-slate-100 font-semibold">
                        {total.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="uppercase tracking-wide text-[10px]">Niche</p>
                      <p className="text-slate-200">
                        {inf.primary_niche || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-900">
          <p className="text-sm font-medium text-slate-200">Brand summary</p>
          <pre className="text-xs bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 whitespace-pre-wrap text-slate-200">
{summary}
          </pre>
        </section>

      </div>
    </main>
  )
}
