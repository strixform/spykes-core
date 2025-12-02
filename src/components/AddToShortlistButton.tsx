"use client"

import { useState } from "react"

type Props = {
  handle: string
}

export default function AddToShortlistButton({ handle }: Props) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  )

  async function add() {
    if (!handle || status === "saving") return
    setStatus("saving")

    try {
      const res = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      })

      if (!res.ok) {
        setStatus("error")
        return
      }

      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }

  let label = "Add to shortlist"
  if (status === "saving") label = "Saving..."
  if (status === "saved") label = "Added"
  if (status === "error") label = "Try again"

  return (
    <button
      type="button"
      onClick={add}
      disabled={status === "saving"}
      className="inline-flex items-center rounded-full border border-slate-600 text-xs px-3 py-1.5 text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:opacity-50"
    >
      {label}
    </button>
  )
}
