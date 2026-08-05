import type { APIRoute } from "astro";
import { buildLangSitemap } from "../lib/sitemap/buildXml";

export const GET: APIRoute = () => {
  return new Response(buildLangSitemap("ru"), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
