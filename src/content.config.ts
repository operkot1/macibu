import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";
import { TheoryQuestionSchema } from "./schemas/theoryQuestions";

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

export const collections = { pages, theoryQuestions };
