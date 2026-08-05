import { sitemapEntries } from "./entries";

// Плейсхолдер-домен — docs/07-i18n-seo.md §3, до появления реального (В-4,
// docs/00-assumptions.md).
const baseUrl = "https://example.lv";

export function buildLangSitemap(lang: "lv" | "ru"): string {
  const otherLang = lang === "lv" ? "ru" : "lv";
  const otherHreflang = otherLang === "lv" ? "lv-LV" : "ru-LV";

  const urls = sitemapEntries
    .filter((entry) => entry[lang] !== null)
    .map((entry) => {
      const loc = `${baseUrl}${entry[lang]}`;
      const alternatePath = entry[otherLang];
      const alternateTag = alternatePath
        ? `\n    <xhtml:link rel="alternate" hreflang="${otherHreflang}" href="${baseUrl}${alternatePath}" />`
        : "";
      return `  <url>\n    <loc>${loc}</loc>${alternateTag}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function buildSitemapIndex(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${baseUrl}/sitemap-lv.xml</loc></sitemap>\n  <sitemap><loc>${baseUrl}/sitemap-ru.xml</loc></sitemap>\n</sitemapindex>\n`;
}
