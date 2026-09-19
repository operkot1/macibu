import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

/*
 * output: "static" + adapter — весь текущий сайт (249 страниц) остаётся
 * полностью статичным ровно как раньше (T-005, docs/11-backlog.md).
 * Адаптер сам по себе ничего не переводит в SSR — в Astro 5 отдельные
 * маршруты опционально выходят из пререндера через
 * `export const prerender = false`, никто в проекте пока это не
 * использует. Адаптер нужен заранее для уже задокументированных, но не
 * реализованных Cloudflare Pages Functions (`/api/beacon/pageview`,
 * T-021; `/api/leads/deliver`, T-083) — когда они появятся, инфраструктура
 * уже будет на месте, без повторной миграции хостинга.
 */
export default defineConfig({
  output: "static",
  adapter: cloudflare(),
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    "/": { status: 302, destination: "/lv/" },
  },
});
