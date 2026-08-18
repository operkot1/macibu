import type { APIRoute } from "astro";
import { buildEnSitemap } from "../lib/sitemap/buildXml";

export const GET: APIRoute = () => {
  return new Response(buildEnSitemap(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
