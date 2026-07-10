import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProperties from "./tools/list-properties";
import getProperty from "./tools/get-property";
import searchProperties from "./tools/search-properties";

// The OAuth issuer MUST be the direct Supabase host. Use the project ref
// literal Vite inlines at build time; the fallback keeps the issuer
// well-formed during the manifest-extract eval (a token never verifies
// against the sentinel).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "madni-realstate-mcp",
  title: "Madni Real Estate MCP",
  version: "0.1.0",
  instructions:
    "Tools for browsing Madni Real Estate listings in Maghagha, Minya and surrounding areas. Use `search_properties` for keyword search, `list_properties` to browse by city/purpose, and `get_property` for full details by ID or code.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProperties, getProperty, searchProperties],
});