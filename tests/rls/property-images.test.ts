import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "pg";
import { inRollbackTx, makeClient, newUuid, resetRole, switchTo } from "./helpers";

let client: Client;

beforeAll(async () => {
  client = makeClient();
  await client.connect();
});
afterAll(async () => {
  await client?.end();
});

/**
 * Seeds storage.objects rows in the `property-images` bucket under different
 * folder-name shapes and exercises the SELECT RLS policy that gates public
 * image visibility. We insert as the DB superuser (RLS bypass) so the seed
 * itself never depends on the policy under test.
 */
async function seedImage(
  ownerFolder: string,
  filename: string,
): Promise<string> {
  const { rows } = await client.query(
    `INSERT INTO storage.objects(bucket_id, name, owner, metadata)
     VALUES ('property-images', $1, NULL, '{}'::jsonb) RETURNING id`,
    [`${ownerFolder}/${filename}`],
  );
  return rows[0].id as string;
}

describe("property-images storage RLS", () => {
  it("anon can read images whose owner folder maps to an approved+published property", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      await client.query(`INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user')`, [owner]);
      await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'approved'::property_status,true)`,
        [owner],
      );
      const id = await seedImage(owner, "photo.jpg");

      await switchTo(client, { role: "anon" });
      const { rows } = await client.query(
        `SELECT id FROM storage.objects WHERE id=$1`,
        [id],
      );
      expect(rows).toHaveLength(1);
      await resetRole(client);
    });
  });

  it("anon CANNOT read images filed under a null/orphan owner folder (regression: hardened policy)", async () => {
    await inRollbackTx(client, async () => {
      // A file uploaded under a folder that doesn't correspond to any
      // property owner (or matches a property whose owner_id is NULL) must
      // never be publicly readable.
      const orphanFolder = newUuid();
      const id = await seedImage(orphanFolder, "leak.jpg");

      await switchTo(client, { role: "anon" });
      const { rows } = await client.query(
        `SELECT id FROM storage.objects WHERE id=$1`,
        [id],
      );
      expect(rows).toHaveLength(0);
      await resetRole(client);
    });
  });

  it("anon CANNOT read images for a property that exists but is pending/unpublished", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      await client.query(`INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user')`, [owner]);
      await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'pending'::property_status,false)`,
        [owner],
      );
      const id = await seedImage(owner, "draft.jpg");

      await switchTo(client, { role: "anon" });
      const { rows } = await client.query(
        `SELECT id FROM storage.objects WHERE id=$1`,
        [id],
      );
      expect(rows).toHaveLength(0);
      await resetRole(client);
    });
  });

  it("owner can read images under their own folder even before approval", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      await client.query(`INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user')`, [owner]);
      await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'pending'::property_status,false)`,
        [owner],
      );
      const id = await seedImage(owner, "draft.jpg");

      await switchTo(client, { userId: owner });
      const { rows } = await client.query(
        `SELECT id FROM storage.objects WHERE id=$1`,
        [id],
      );
      expect(rows).toHaveLength(1);
      await resetRole(client);
    });
  });

  it("unrelated user cannot read another user's private folder", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      const other = newUuid();
      await client.query(
        `INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user'),($2,'user')`,
        [owner, other],
      );
      await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'pending'::property_status,false)`,
        [owner],
      );
      const id = await seedImage(owner, "draft.jpg");

      await switchTo(client, { userId: other });
      const { rows } = await client.query(
        `SELECT id FROM storage.objects WHERE id=$1`,
        [id],
      );
      expect(rows).toHaveLength(0);
      await resetRole(client);
    });
  });

  it("admin can read images regardless of publication state", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      const admin = newUuid();
      await client.query(
        `INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user'),($2,'admin')`,
        [owner, admin],
      );
      await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'pending'::property_status,false)`,
        [owner],
      );
      const id = await seedImage(owner, "draft.jpg");

      await switchTo(client, { userId: admin });
      const { rows } = await client.query(
        `SELECT id FROM storage.objects WHERE id=$1`,
        [id],
      );
      expect(rows).toHaveLength(1);
      await resetRole(client);
    });
  });
});

describe("property_images (table) RLS", () => {
  it("anon can read image rows only for approved+published properties", async () => {
    await inRollbackTx(client, async () => {
      const owner = newUuid();
      await client.query(`INSERT INTO public.user_roles(user_id, role) VALUES ($1,'user')`, [owner]);
      const { rows: p1 } = await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'approved'::property_status,true) RETURNING id`,
        [owner],
      );
      const { rows: p2 } = await client.query(
        `INSERT INTO public.properties(title,type,price,owner_id,review_status,published)
         VALUES ('t','شقة','1',$1,'pending'::property_status,false) RETURNING id`,
        [owner],
      );
      const approvedId = p1[0].id;
      const pendingId = p2[0].id;
      await client.query(
        `INSERT INTO public.property_images(property_id, url) VALUES ($1,'a'),($2,'b')`,
        [approvedId, pendingId],
      );

      await switchTo(client, { role: "anon" });
      const { rows } = await client.query(
        `SELECT property_id FROM public.property_images
         WHERE property_id = ANY($1::uuid[])`,
        [[approvedId, pendingId]],
      );
      const ids = rows.map((r) => r.property_id);
      expect(ids).toContain(approvedId);
      expect(ids).not.toContain(pendingId);
      await resetRole(client);
    });
  });
});