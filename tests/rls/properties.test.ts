import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "pg";
import {
  expectDenied,
  inRollbackTx,
  makeClient,
  newUuid,
  resetRole,
  switchTo,
} from "./helpers";

let client: Client;

beforeAll(async () => {
  client = makeClient();
  await client.connect();
});
afterAll(async () => {
  await client?.end();
});

/**
 * Seed a scenario as the DB superuser (bypasses RLS) with two users and two
 * properties, then hand off to the caller with role-switching helpers.
 */
async function withPropertyScenario(
  cb: (ctx: {
    ownerA: string;
    ownerB: string;
    marketer: string;
    admin: string;
    other: string;
    pendingA: string; // pending, unpublished, owned by ownerA
    approvedA: string; // approved+published, owned by ownerA
    pendingB: string; // pending, unpublished, owned by ownerB
  }) => Promise<void>,
) {
  await inRollbackTx(client, async () => {
    const ownerA = newUuid();
    const ownerB = newUuid();
    const marketer = newUuid();
    const admin = newUuid();
    const other = newUuid();

    await client.query(
      `INSERT INTO public.user_roles(user_id, role) VALUES
       ($1,'user'), ($2,'user'), ($3,'marketer'), ($4,'admin'), ($5,'user')`,
      [ownerA, ownerB, marketer, admin, other],
    );

    const insertProp = async (owner: string, review: string, published: boolean) => {
      const { rows } = await client.query(
        `INSERT INTO public.properties
           (title, type, price, owner_id, review_status, published)
         VALUES ('t','شقة','1', $1, $2::property_status, $3)
         RETURNING id`,
        [owner, review, published],
      );
      return rows[0].id as string;
    };

    const pendingA = await insertProp(ownerA, "pending", false);
    const approvedA = await insertProp(ownerA, "approved", true);
    const pendingB = await insertProp(ownerB, "pending", false);

    await cb({ ownerA, ownerB, marketer, admin, other, pendingA, approvedA, pendingB });
  });
}

describe("properties RLS", () => {
  it("anon can only read approved+published properties", async () => {
    await withPropertyScenario(async ({ pendingA, approvedA, pendingB }) => {
      await switchTo(client, { role: "anon" });
      const { rows } = await client.query(
        `SELECT id FROM public.properties WHERE id = ANY($1::uuid[])`,
        [[pendingA, approvedA, pendingB]],
      );
      const ids = rows.map((r) => r.id);
      expect(ids).toContain(approvedA);
      expect(ids).not.toContain(pendingA);
      expect(ids).not.toContain(pendingB);
      await resetRole(client);
    });
  });

  it("owner can read their own pending properties", async () => {
    await withPropertyScenario(async ({ ownerA, pendingA }) => {
      await switchTo(client, { userId: ownerA });
      const { rows } = await client.query(
        `SELECT id FROM public.properties WHERE id = $1`,
        [pendingA],
      );
      expect(rows).toHaveLength(1);
      await resetRole(client);
    });
  });

  it("owner can update their own pending property", async () => {
    await withPropertyScenario(async ({ ownerA, pendingA }) => {
      await switchTo(client, { userId: ownerA });
      const { rowCount } = await client.query(
        `UPDATE public.properties SET title='updated' WHERE id=$1`,
        [pendingA],
      );
      expect(rowCount).toBe(1);
      await resetRole(client);
    });
  });

  it("owner cannot update an approved property (only pending is editable)", async () => {
    await withPropertyScenario(async ({ ownerA, approvedA }) => {
      await switchTo(client, { userId: ownerA });
      const { rowCount } = await client.query(
        `UPDATE public.properties SET title='blocked' WHERE id=$1`,
        [approvedA],
      );
      expect(rowCount).toBe(0);
      await resetRole(client);
    });
  });

  it("marketer cannot update a property they do not own (regression: no blanket marketer edit)", async () => {
    await withPropertyScenario(async ({ marketer, pendingA, approvedA }) => {
      await switchTo(client, { userId: marketer });
      const upd1 = await client.query(
        `UPDATE public.properties SET title='hijack' WHERE id=$1`,
        [pendingA],
      );
      const upd2 = await client.query(
        `UPDATE public.properties SET title='hijack' WHERE id=$1`,
        [approvedA],
      );
      expect(upd1.rowCount).toBe(0);
      expect(upd2.rowCount).toBe(0);
      await resetRole(client);
    });
  });

  it("unrelated authenticated user cannot update someone else's property", async () => {
    await withPropertyScenario(async ({ other, pendingA }) => {
      await switchTo(client, { userId: other });
      const { rowCount } = await client.query(
        `UPDATE public.properties SET title='no' WHERE id=$1`,
        [pendingA],
      );
      expect(rowCount).toBe(0);
      await resetRole(client);
    });
  });

  it("admin can update any property", async () => {
    await withPropertyScenario(async ({ admin, approvedA, pendingB }) => {
      await switchTo(client, { userId: admin });
      const upd1 = await client.query(
        `UPDATE public.properties SET title='ok' WHERE id=$1`,
        [approvedA],
      );
      const upd2 = await client.query(
        `UPDATE public.properties SET title='ok' WHERE id=$1`,
        [pendingB],
      );
      expect(upd1.rowCount).toBe(1);
      expect(upd2.rowCount).toBe(1);
      await resetRole(client);
    });
  });

  it("owner cannot flip review_status to approved (only admins can via separate policy)", async () => {
    await withPropertyScenario(async ({ ownerA, pendingA }) => {
      await switchTo(client, { userId: ownerA });
      await expectDenied(
        client.query(
          `UPDATE public.properties SET review_status='approved'::property_status WHERE id=$1`,
          [pendingA],
        ),
      );
      await resetRole(client);
    });
  });

  it("anon cannot insert a property", async () => {
    await inRollbackTx(client, async () => {
      await switchTo(client, { role: "anon" });
      await expectDenied(
        client.query(
          `INSERT INTO public.properties(title,type,price) VALUES ('x','شقة','1')`,
        ),
      );
      await resetRole(client);
    });
  });
});