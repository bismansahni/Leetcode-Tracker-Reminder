import { sql } from '@vercel/postgres';
import { Pool } from '@neondatabase/serverless';

let pool: Pool | undefined;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  }
  return pool;
}

export { sql };