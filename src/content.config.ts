import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/*
 * Схема frontmatter контентных страниц (docs/07-i18n-seo.md §1). route_id
 * связывает LV/RU-версии одной страницы и совпадает со строкой в
 * docs/02-routes.md. pageType намеренно не enum — полный список типов
 * страниц привязывается к *Template.astro по мере их появления, фиксировать
 * его здесь сейчас значило бы гадать вперёд задачи.
 */

const pages = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pages" }),
  schema: z.object({
    route_id: z.string().min(1),
    lang: z.enum(["lv", "ru"]),
    title: z.string().min(1),
    description: z.string().min(1),
    pageType: z.string().min(1),
  }),
});

export const collections = { pages };
