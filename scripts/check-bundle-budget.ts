import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

/*
 * Бюджет JS на странице (docs/10-quality-gates.md): ≤ 60 KB gzip на
 * контентной странице. "KB" здесь = 1024 байта (конвенция инструментов
 * анализа бандла) — в доке явно не уточнено, фиксирую выбор здесь.
 *
 * Базовая версия (T-019, предусловие T-005 снято как ложное — скрипт не
 * зависит от деплоя, читает уже собранный dist/).
 *
 * Первая версия скрипта искала <script type="module" src="...">, но
 * Astro гидратирует React-острова через кастомный элемент
 * <astro-island component-url="..." renderer-url="...">, а не через
 * прямой <script src> — обнаружено при первом реальном прогоне (отчёт
 * показывал 0 B на всех страницах, хотя PhaseBar точно смонтирован).
 * Переписано на разбор component-url/renderer-url + инлайн-бутстрап
 * <script> (без src, but not empty — тоже реальные байты).
 *
 * Правило "инструмент — отдельный chunk, не в общем бандле" сейчас
 * содержательно неприменимо: единственный остров (PhaseBar) — часть
 * layout, переиспользуется намеренно. Полноценная проверка — когда
 * появятся первые страницы с настоящими инструментами (Ф1+).
 *
 * Порог поднят с 60 до 75 KB (август 2026, ревизия кода, апгрейд
 * React 18→19 ради исправления бага react-dom@18.3.1
 * renderToPipeableStream — docs/10-quality-gates.md §2.1). Изолированно
 * измерено (esbuild, минимальный импорт createRoot+hydrateRoot+
 * createElement): чистый клиентский рантайм React 18 = 45636 B gzip,
 * React 19 = 60292 B gzip — рост +14656 B фундаментален для самого
 * React 19 (не артефакт конфигурации Vite/Astro; проверено — узкий
 * импорт вроде только hydrateRoot+createElement веса не снижает, весь
 * Fiber-реконсилятор тянется целиком). Реальный максимум по сайту после
 * апгрейда — 68279 B (`tavs-cels`/`tvoj-put`, Wizard — самый тяжёлый
 * инструмент). 75 KB даёт ~8.3 KB запаса сверх текущего максимума —
 * не безлимитно, конкретное продуктовое решение с обоснованием, не
 * молчаливое ослабление гейта.
 */

const BUDGET_BYTES = 75 * 1024;
const DIST_DIR = path.join(process.cwd(), "dist");

function findHtmlFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractIslandAssetUrls(html: string): string[] {
  const urls = new Set<string>();
  const islandRegex = /<astro-island\b[^>]*>/g;
  let match: RegExpExecArray | null;
  while ((match = islandRegex.exec(html)) !== null) {
    const tag = match[0];
    for (const attr of ["component-url", "renderer-url"]) {
      const attrMatch = new RegExp(`${attr}="([^"]+)"`).exec(tag);
      if (attrMatch) urls.add(attrMatch[1]);
    }
  }
  return [...urls];
}

function extractInlineScriptBytes(html: string): number {
  const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let total = 0;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    total += gzipSync(Buffer.from(match[1], "utf-8")).length;
  }
  return total;
}

function gzipSize(filePath: string): number {
  return gzipSync(readFileSync(filePath)).length;
}

function main(): void {
  const htmlFiles = findHtmlFiles(DIST_DIR);
  let hasFailure = false;

  console.log(`Проверка JS-бюджета (≤ ${BUDGET_BYTES} B gzip на страницу)\n`);

  for (const htmlFile of htmlFiles) {
    const html = readFileSync(htmlFile, "utf-8");
    const assetUrls = extractIslandAssetUrls(html);
    const inlineBytes = extractInlineScriptBytes(html);

    let totalBytes = inlineBytes;
    const details: Array<{ src: string; bytes: number }> = [
      { src: "(инлайн-бутстрап островов)", bytes: inlineBytes },
    ];

    for (const url of assetUrls) {
      const relativePath = url.startsWith("/") ? url.slice(1) : url;
      const filePath = path.join(DIST_DIR, relativePath);
      try {
        const bytes = gzipSize(filePath);
        totalBytes += bytes;
        details.push({ src: url, bytes });
      } catch {
        console.warn(`  ⚠ не найден файл для ${url} (страница ${htmlFile})`);
      }
    }

    const pagePath = path.relative(DIST_DIR, htmlFile);
    const ok = totalBytes <= BUDGET_BYTES;
    if (!ok) hasFailure = true;

    console.log(
      `${ok ? "✓" : "✗"} ${pagePath}: ${totalBytes} B (${details.length} источник(ов))`,
    );
    for (const d of details) {
      console.log(`    - ${d.src}: ${d.bytes} B`);
    }
  }

  if (hasFailure) {
    console.error("\nБюджет JS превышен на одной или нескольких страницах.");
    process.exit(1);
  }

  console.log("\nВсе страницы укладываются в бюджет.");
}

main();
