import { Client } from "pg";
import { randomUUID } from "crypto";
import "dotenv/config";

/**
 * Build a pg.Client using either DATABASE_URL / SUPABASE_DB_URL, or discrete
 * PG* env vars (as provided by the Lovable sandbox).
 */
export function makeClient(): Client {
  const url = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  if (url) {
    return new Client({
      connectionString: url,
      ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false },
    });
  }
  return new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGHOST && process.env.PGHOST !== "localhost"
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

/**
 * Execute `fn` inside a transaction that runs as PostgREST would for a given
 * Supabase user: switches to the `authenticated` (or `anon`) role and sets the
 * JWT claims that `auth.uid()` / `auth.role()` read from. Rolls back on exit
 * so tests never mutate real data.
 */
export async function asUser<T>(
  client: Client,
  opts: { userId?: string | null; role?: "anon" | "authenticated" | "service_role" },
  fn: () => Promise<T>,
): Promise<T> {
  const role = opts.role ?? (opts.userId ? "authenticated" : "anon");
  const claims: Record<string, unknown> = { role };
  if (opts.userId) claims.sub = opts.userId;

  await client.query("BEGIN");
  try {
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    await client.query(`SELECT set_config('request.jwt.claim.role', $1, true)`, [role]);
    if (opts.userId) {
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [opts.userId]);
    }
    await client.query(`SET LOCAL ROLE ${role}`);
    const out = await fn();
    return out;
  } finally {
    await client.query("ROLLBACK");
  }
}

/** Convenience: assert a query rejects with a Postgres RLS/permission error. */
export async function expectDenied(promise: Promise<unknown>): Promise<void> {
  let err: unknown;
  try {
    await promise;
  } catch (e) {
    err = e;
  }
  if (!err) throw new Error("expected query to be denied by RLS, but it succeeded");
  const msg = String((err as Error).message ?? err).toLowerCase();
  const denied =
    msg.includes("row-level security") ||
    msg.includes("permission denied") ||
    msg.includes("violates row-level security policy") ||
    msg.includes("new row violates");
  if (!denied) throw err;
}

export function newUuid(): string {
  return randomUUID();
}

/** Run cb inside a transaction that always rolls back; keeps DB pristine. */
export async function inRollbackTx(client: Client, cb: () => Promise<void>): Promise<void> {
  await client.query("BEGIN");
  try {
    await cb();
  } finally {
    await client.query("ROLLBACK");
  }
}

/**
 * Switch the current transaction to act as PostgREST does for a Supabase user:
 * sets the request-scoped JWT claims, then `SET LOCAL ROLE`. Call between
 * subtests inside the same transaction with `resetRole(client)` first.
 */
export async function switchTo(
  client: Client,
  opts: { userId?: string | null; role?: "anon" | "authenticated" | "service_role" },
): Promise<void> {
  const role = opts.role ?? (opts.userId ? "authenticated" : "anon");
  const claims: Record<string, unknown> = { role };
  if (opts.userId) claims.sub = opts.userId;
  await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
  await client.query(`SELECT set_config('request.jwt.claim.role', $1, true)`, [role]);
  if (opts.userId) {
    await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [opts.userId]);
  }
  await client.query(`SET LOCAL ROLE ${role}`);
}

export async function resetRole(client: Client): Promise<void> {
  await client.query("RESET ROLE");
  await client.query(`SELECT set_config('request.jwt.claims', '', true)`);
  await client.query(`SELECT set_config('request.jwt.claim.sub', '', true)`);
  await client.query(`SELECT set_config('request.jwt.claim.role', '', true)`);
}