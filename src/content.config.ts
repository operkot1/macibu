import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";
import { TheoryQuestionSchema } from "./schemas/theoryQuestions";
import { ViolationSchema } from "./schemas/violation";

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

/*
 * theoryQuestions — реальный редакционный банк вопросов тренажёра
 * (T-044), отдельно от fixtures/theory_questions.json (тот — dev/test
 * мок-данные, 3 иллюстративных вопроса, fixtures/ по определению не
 * для прода, docs/01/CLAUDE.md). `file()`-loader: каждый элемент
 * массива в b.json становится отдельной записью коллекции по полю `id`.
 */
const theoryQuestions = defineCollection({
  loader: file("src/content/theory-questions/b.json"),
  schema: TheoryQuestionSchema,
});

/*
 * violations — реестр нарушений/штрафов (p5-sodi, T-085). Тот же паттерн,
 * что theoryQuestions: реальный редакционный контент через Content
 * Collections, не fixtures/*.json (docs/06-tools/spravochnik-shtrafov.md
 * прямо называет Content Collections). Сейчас все записи —
 * `source: "placeholder"` (см. A-14, docs/00-assumptions.md): конкретные
 * суммы штрафов не подтверждены достаточно надёжно в рамках этого сеанса.
 */
const violations = defineCollection({
  loader: file("src/content/violations/violations.json"),
  schema: ViolationSchema,
});

/*
 * blogPosts — записи блога (T-115). Отдельная от `pages` коллекция:
 * посту нужна дата публикации для Schema.org Article
 * (docs/07-i18n-seo.md §8) и хронологической сортировки на
 * `blog-index`, чего нет в общей схеме `pages`. `route_id` = `blog-{slug}`
 * — тот же паттерн, что `cat-{code}` в `categoryOrder.ts` (T-112): один
 * префикс, слаг URL выводится вычитанием префикса, не хранится отдельным
 * полем. Постов пока нет (CLAUDE.md: блог — только новости изменений
 * правил, не свалка) — публикация конкретных постов отдельной задачей
 * T-116, каждый со своей строкой в docs/02-routes.md по факту публикации.
 */
const blogPosts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    route_id: z.string().min(1),
    lang: z.enum(["lv", "ru"]),
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.string().date(),
    updatedAt: z.string().date().optional(),
  }),
});

export const collections = { pages, theoryQuestions, violations, blogPosts };
