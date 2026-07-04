import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_properties",
  title: "List properties",
  description: "List approved real estate properties from Madni Real Estate. Supports filtering by city, purpose (sale/rent), and limit.",
  inputSchema: {
    city: z.string().optional().describe("Filter by city name (e.g. Maghagha, Minya)."),
    purpose: z.enum(["sale", "rent"]).optional().describe("Filter by listing purpose."),
    limit: z.number().int().min(1).max(50).optional().describe("Max number of results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city, purpose, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("properties")
      .select("id, code, title, city, price, purpose, bedrooms, bathrooms, area, created_at")
      .eq("review_status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (city) q = q.ilike("city", `%${city}%`);
    if (purpose) q = q.eq("purpose", purpose);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});