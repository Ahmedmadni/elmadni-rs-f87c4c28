import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_properties",
  title: "Search properties",
  description: "Full-text search over approved properties by keyword across title, description, city, and district.",
  inputSchema: {
    query: z.string().min(1).describe("Free-text search query (Arabic or English)."),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const like = `%${query}%`;
    const { data, error } = await supabase
      .from("properties")
      .select("id, code, title, city, district, price, purpose, bedrooms, bathrooms, area")
      .eq("review_status", "approved")
      .or(`title.ilike.${like},description.ilike.${like},city.ilike.${like},district.ilike.${like}`)
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});