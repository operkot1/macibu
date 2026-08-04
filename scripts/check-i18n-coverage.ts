import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/*
 * Покрытие переводов (docs/07-i18n-seo.md §2, docs/10-quality-gates.md).
 * Базовая версия (T-019, предусловие T-005 снято как ложное — скрипт
 * офлайн, не зависит от деплоя): сравнивает route_id, реально
 * существующие в src/content/pages/{lv,ru}/, а не сверяется построчно со
 * всеми ~126 маршрутами docs/02-routes.md — иначе отчёт был бы сплошным
 * шумом "ещё не реализовано" на этом этапе проекта. Полная сверка с
 * реестром — возможное расширение позже, не в этой задаче.
 *
 * Асимметричная пара (файл на одном языке без пары) — НЕ ошибка сборки
 * (exit 0, предупреждение), см. правило "нет перевода — страницы нет".
 * Несовпадение route_id во frontmatter с именем файла — ошибка (exit 1),
 * это типографская опечатка, а не осознанное решение.
 */

const CONTENT_DIR = path.join(process.cwd(), "src/content/pages");

interface PageEntry {
  file: string;
  routeId: string | null;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = /^(\w+):\s*"?([^"]*?)"?\s*$/.exec(line.trim());
    if (kv) result[kv[1]] = kv[2];
  }
  return result;
}

function scanLang(lang: "lv" | "ru"): PageEntry[] {
  const dir = path.join(CONTENT_DIR, lang);
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
  return files.map((file) => {
    const content = readFileSync(path.join(dir, file), "utf-8");
    const data = parseFrontmatter(content);
    return { file, routeId: data.route_id ?? null };
  });
}

function main(): void {
  let hasError = false;

  const lvEntries = scanLang("lv");
  const ruEntries = scanLang("ru");

  console.log(
    `LV: ${lvEntries.length} файл(ов), RU: ${ruEntries.length} файл(ов)\n`,
  );

  // Проверка: route_id во frontmatter совпадает с именем файла
  for (const { file, routeId } of [...lvEntries, ...ruEntries]) {
    const expectedRouteId = file.replace(/\.mdx$/, "");
    if (routeId === null) {
      console.error(`✗ ${file}: нет route_id во frontmatter`);
      hasError = true;
    } else if (routeId !== expectedRouteId) {
      console.error(
        `✗ ${file}: route_id="${routeId}" не совпадает с именем файла (ожидался "${expectedRouteId}")`,
      );
      hasError = true;
    }
  }

  // Асимметричные пары — предупреждение, не ошибка
  const lvIds = new Set(lvEntries.map((e) => e.routeId).filter(Boolean));
  const ruIds = new Set(ruEntries.map((e) => e.routeId).filter(Boolean));

  for (const id of lvIds) {
    if (!ruIds.has(id)) {
      console.warn(
        `⚠ route_id "${id}": есть LV, нет RU — LangSwitch должен быть disabled на LV-версии`,
      );
    }
  }
  for (const id of ruIds) {
    if (!lvIds.has(id)) {
      console.warn(
        `⚠ route_id "${id}": есть RU, нет LV — LangSwitch должен быть disabled на RU-версии`,
      );
    }
  }

  const pairedCount = [...lvIds].filter((id) => ruIds.has(id)).length;
  console.log(`\nПолных пар LV/RU: ${pairedCount}`);

  if (hasError) {
    console.error("\nНайдены структурные ошибки (см. выше).");
    process.exit(1);
  }

  console.log("Структурных ошибок нет.");
}

main();
