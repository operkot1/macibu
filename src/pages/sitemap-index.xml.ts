import type { APIRoute } from "astro";
import { buildSitemapIndex } from "../lib/sitemap/buildXml";

export const GET: APIRoute = () => {
  return new Response(buildSitemapIndex(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
