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

async function withRequestScenario(
  cb: (ctx: {
    owner: string;
    buyer: string;
    other: string;
    admin: string;
    propertyId: string;
    requestId: string;
  }) => Promise<void>,
) {
  await inRollbackTx(client, async () => {
    const owner = newUuid();
    const buyer = newUuid();
    const other = newUuid();
    const admin = newUuid();
    await client.query(
      `INSERT INTO public.user_roles(user_id, role) VALUES
       ($1,'user'), ($2,'user'), ($3,'user'), ($4,'admin')`,
      [owner, buyer, other, admin],
    );
    const { rows: pRows } = await client.query(
      `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
       VALUES ('t','شقة','1',$1,'approved'::property_status,true) RETURNING id`,
      [owner],
    );
    const propertyId = pRows[0].id as string;
    const { rows: rRows } = await client.query(
      `INSERT INTO public.purchase_requests(property_id,buyer_user_id,buyer_name,buyer_phone,buyer_email)
       VALUES ($1,$2,'Ali','01000000000','a@b.co') RETURNING id`,
      [propertyId, buyer],
    );
    const requestId = rRows[0].id as string;
    await cb({ owner, buyer, other, admin, propertyId, requestId });
  });
}

describe("purchase_requests RLS", () => {
  it("anon cannot read buyer PII", async () => {
    await withRequestScenario(async () => {
      await switchTo(client, { role: "anon" });
      const { rows } = await client.query(
        `SELECT id, buyer_name, buyer_phone, buyer_email FROM public.purchase_requests`,
      );
      expect(rows).toHaveLength(0);
      await resetRole(client);
    });
  });

  it("unrelated authenticated user cannot read requests", async () => {
    await withRequestScenario(async ({ other, requestId }) => {
      await switchTo(client, { userId: other });
      const { rows } = await client.query(
        `SELECT id FROM public.purchase_requests WHERE id=$1`,
        [requestId],
      );
      expect(rows).toHaveLength(0);
      await resetRole(client);
    });
  });

  it("buyer can read their own request", async () => {
    await withRequestScenario(async ({ buyer, requestId }) => {
      await switchTo(client, { userId: buyer });
      const { rows } = await client.query(
        `SELECT id, buyer_phone FROM public.purchase_requests WHERE id=$1`,
        [requestId],
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].buyer_phone).toBe("01000000000");
      await resetRole(client);
    });
  });

  it("property owner can read requests for their property", async () => {
    await withRequestScenario(async ({ owner, requestId }) => {
      await switchTo(client, { userId: owner });
      const { rows } = await client.query(
        `SELECT id FROM public.purchase_requests WHERE id=$1`,
        [requestId],
      );
      expect(rows).toHaveLength(1);
      await resetRole(client);
    });
  });

  it("admin can read every request", async () => {
    await withRequestScenario(async ({ admin, requestId }) => {
      await switchTo(client, { userId: admin });
      const { rows } = await client.query(
        `SELECT id FROM public.purchase_requests WHERE id=$1`,
        [requestId],
      );
      expect(rows).toHaveLength(1);
      await resetRole(client);
    });
  });

  it("anon can create a request for an approved+published property (with valid contact)", async () => {
    await withRequestScenario(async ({ propertyId }) => {
      await switchTo(client, { role: "anon" });
      const { rowCount } = await client.query(
        `INSERT INTO public.purchase_requests(property_id,buyer_name,buyer_phone)
         VALUES ($1,'Sara','01111111111')`,
        [propertyId],
      );
      expect(rowCount).toBe(1);
      await resetRole(client);
    });
  });

  it("anon cannot create a request against a pending/unpublished property", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      await client.query(`INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user')`, [owner]);
      const { rows } = await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'pending'::property_status,false) RETURNING id`,
        [owner],
      );
      const pid = rows[0].id;
      await switchTo(client, { role: "anon" });
      await expectDenied(
        client.query(
          `INSERT INTO public.purchase_requests(property_id,buyer_name,buyer_phone)
           VALUES ($1,'Sara','01111111111')`,
          [pid],
        ),
      );
      await resetRole(client);
    });
  });

  it("anon cannot spoof buyer_user_id to another user", async () => {
    await withRequestScenario(async ({ propertyId, other }) => {
      await switchTo(client, { role: "anon" });
      await expectDenied(
        client.query(
          `INSERT INTO public.purchase_requests(property_id,buyer_user_id,buyer_name,buyer_phone)
           VALUES ($1,$2,'Sara','01111111111')`,
          [propertyId, other],
        ),
      );
      await resetRole(client);
    });
  });

  it("non-owner authenticated user cannot update a request", async () => {
    await withRequestScenario(async ({ other, requestId }) => {
      await switchTo(client, { userId: other });
      const { rowCount } = await client.query(
        `UPDATE public.purchase_requests SET buyer_name='hacked' WHERE id=$1`,
        [requestId],
      );
      expect(rowCount).toBe(0);
      await resetRole(client);
    });
  });
});