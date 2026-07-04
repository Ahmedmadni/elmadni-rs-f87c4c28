import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_property",
  title: "Get property details",
  description: "Fetch full details of a single approved property by its ID or code (e.g. MAD-123).",
  inputSchema: {
    idOrCode: z.string().min(1).describe("The property UUID or its human code (e.g. MAD-42)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ idOrCode }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrCode);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("review_status", "approved")
      .eq(isUuid ? "id" : "code", idOrCode)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Property not found." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { property: data },
    };
  },
});