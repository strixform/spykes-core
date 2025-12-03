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
    direction = "active and visible across feeds
