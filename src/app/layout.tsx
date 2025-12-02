import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Spykes",
  description: "Live trend and influencer intelligence for Nigerian streets and screens.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col">
          {/* top nav */}
          <header className="border-b border-slate-900 bg-slate-950/90 backdrop-blur">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
              <Link
                href="/"
                className="text-sm font-semibold tracking-tight text-slate-50"
              >
                Spykes
              </Link>
              <nav className="flex items-center gap-4 text-xs text-slate-300">
                <Link href="/" className="hover:text-sky-300">
                  Trends
                </Link>
                <Link href="/influencers" className="hover:text-sky-300">
                  Influencers
                </Link>
                <Link href="/shortlist" className="hover:text-sky-300">
                  Shortlist
                </Link>
                <Link href="/compare" className="hover:text-sky-300">
                  Compare
                </Link>
              </nav>
            </div>
          </header>

          {/* page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
