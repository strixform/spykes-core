const DEFAULT_BASE_URL = "http://localhost:3000"

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  return DEFAULT_BASE_URL
}

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const base = getBaseUrl()
  const url = `${base}${path}`
  return fetch(url, { cache: "no-store", ...init })
}
