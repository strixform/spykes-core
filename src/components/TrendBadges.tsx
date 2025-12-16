"use client"

export function TrendBadges({
  source,
  kind,
}: {
  source?: string | null
  kind?: string | null
}) {
  const sourceMap: Record<string, { icon: string; color: string }> = {
    twitter: { icon: "🐦", color: "#1DA1F2" },
    x: { icon: "🐦", color: "#1DA1F2" },
    tiktok: { icon: "🎵", color: "#EE1D52" },
    google: { icon: "🔍", color: "#4285F4" },
    news: { icon: "📰", color: "#444" },
    youtube: { icon: "▶️", color: "red" },
    unknown: { icon: "❓", color: "#666" },
  }

  const kindMap: Record<string, { icon: string; color: string }> = {
    hashtag: { icon: "#️⃣", color: "#444" },
    topic: { icon: "🔥", color: "#E67E22" },
    search: { icon: "📈", color: "#2ECC71" },
    video: { icon: "🎬", color: "#8E44AD" },
    unknown: { icon: "❓", color: "#666" },
  }

  const s = source ? source.toLowerCase() : "unknown"
  const k = kind ? kind.toLowerCase() : "unknown"

  const sourceBadge = sourceMap[s] || sourceMap["unknown"]
  const kindBadge = kindMap[k] || kindMap["unknown"]

  return (
    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "8px",
          background: "#222",
          color: sourceBadge.color,
          fontSize: "13px",
        }}
      >
        {sourceBadge.icon} {source?.toUpperCase()}
      </span>

      <span
        style={{
          padding: "2px 8px",
          borderRadius: "8px",
          background: "#222",
          color: kindBadge.color,
          fontSize: "13px",
        }}
      >
        {kindBadge.icon} {kind}
      </span>
    </div>
  )
}
