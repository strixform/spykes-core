import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set in environment variables");
      throw new Error("DATABASE_URL missing");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
