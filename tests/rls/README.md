# RLS Regression Tests

These tests lock in the row-level-security posture for `properties`,
`property_images` (both the storage bucket and the table), and
`purchase_requests`. They protect against silent regressions such as:

- Marketers regaining blanket edit access to other people's listings.
- The `property-images` storage bucket leaking files whose folder maps to a
  missing/`NULL` owner.
- Buyer PII in `purchase_requests` becoming readable by `anon` or unrelated
  authenticated users.

## How they work

Each test opens a transaction as a database superuser, seeds the scenario
(users, roles, properties, images, requests) with RLS bypassed, then uses
`SET LOCAL ROLE` + `request.jwt.claims` to act as `anon`, an owner, a
marketer, an admin, etc. — exactly how PostgREST evaluates policies at
runtime. Every test rolls back, so nothing persists.

## Requirements

You need a Postgres connection with permission to switch into the
`authenticated`, `anon`, and `service_role` roles (the built-in `postgres`
superuser works). Any of these are picked up automatically:

- `DATABASE_URL` or `SUPABASE_DB_URL` — full connection string.
- Discrete `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE`.

> The Lovable sandbox's default `sandbox_exec` user is not privileged
> enough to run these tests — use them locally against `supabase start`, or
> in CI against a dedicated test project, with a superuser connection
> string.

## Run

```bash
bun run test:rls
```

or

```bash
bunx vitest run tests/rls
```