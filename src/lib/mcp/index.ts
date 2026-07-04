import { defineMcp } from "@lovable.dev/mcp-js";
import listProperties from "./tools/list-properties";
import getProperty from "./tools/get-property";
import searchProperties from "./tools/search-properties";

export default defineMcp({
  name: "madni-realstate-mcp",
  title: "Madni Real Estate MCP",
  version: "0.1.0",
  instructions:
    "Tools for browsing Madni Real Estate listings in Maghagha, Minya and surrounding areas. Use `search_properties` for keyword search, `list_properties` to browse by city/purpose, and `get_property` for full details by ID or code.",
  tools: [listProperties, getProperty, searchProperties],
});