import { getSitemapEntries } from "./entries";

// Плейсхолдер-домен — docs/07-i18n-seo.md §3, до появления реального (В-4,
// docs/00-assumptions.md).
const baseUrl = "https://example.lv";

export async function buildLangSitemap(lang: "lv" | "ru"): Promise<string> {
  const otherLang = lang === "lv" ? "ru" : "lv";
  const otherHreflang = otherLang === "lv" ? "lv-LV" : "ru-LV";
  const sitemapEntries = await getSitemapEntries();

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

/*
 * /en/ (T-113) — моноязычный маршрут вне lv/ru-дерева, не подходит под
 * SitemapEntry (пара lv/ru). Отдельный, третий файл сайтмапа — тот же
 * принцип, что у lv/ru, просто с одной записью.
 */
export function buildEnSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/en/</loc>\n  </url>\n</urlset>\n`;
}

export function buildSitemapIndex(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${baseUrl}/sitemap-lv.xml</loc></sitemap>\n  <sitemap><loc>${baseUrl}/sitemap-ru.xml</loc></sitemap>\n  <sitemap><loc>${baseUrl}/sitemap-en.xml</loc></sitemap>\n</sitemapindex>\n`;
}
