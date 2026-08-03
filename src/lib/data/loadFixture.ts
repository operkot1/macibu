import { readFileSync } from "node:fs";
import path from "node:path";
import type { ZodType } from "zod";

/*
 * Читает /fixtures/*.json и валидирует через Zod-схему из src/schemas/.
 * Путь считается от process.cwd() — намеренно, не от import.meta.url:
 * после бандлинга Vite перекладывает этот модуль в dist/ на другую глубину
 * вложенности, и относительный путь от import.meta.url перестаёт совпадать
 * с исходной структурой src/ (проверено на реальной сборке — ENOENT).
 * process.cwd() стабилен, пока команды (npm run dev/build, CI) выполняются
 * из корня репозитория — это стандартное поведение npm-скриптов.
 *
 * Единственная точка, которую нужно будет заменить, когда вместо фикстур
 * появится реальный ETL/Supabase (Ф2+) — вызывающий код в index.ts менять
 * не придётся, только реализацию loadFixture.
 */

const fixturesDir = path.join(process.cwd(), "fixtures");

const cache = new Map<string, unknown>();

export function loadFixture<T>(filename: string, schema: ZodType<T>): T {
  const cached = cache.get(filename);
  if (cached !== undefined) {
    return cached as T;
  }

  const filePath = path.join(fixturesDir, filename);
  const raw = readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);
  const data = schema.parse(parsed);

  cache.set(filename, data);
  return data;
}
