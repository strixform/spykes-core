export const apiUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function apiFetch(path: string, init?: RequestInit) {
  const url = apiUrl + path;

  const res = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
