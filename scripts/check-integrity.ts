import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/*
 * Обнаружена честная проверка кодовой базы (август 2026): три собранные
 * страницы (dist/lv/macos-braukt/zimes/, dist/ru/uchus-vodit/znaki/,
 * dist/ru/avtoshkoly/kalkulyator/) содержат байты 0x00 внутри видимого
 * текста — детерминированно, на каждой чистой пересборке. Источник —
 * не src/ (проверено побайтово, чисто) и не сама строка (голая
 * Node-конкатенация тех же строк не воспроизводит) — воспроизводится
 * только через полный конвейер сборки Astro на текущей версии Node
 * (v26.5.1, нигде не зафиксированной в проекте). Первопричина не
 * найдена и не в scope этого скрипта — задача скрипта только не дать
 * такой порче снова тихо доехать до `dist/`, независимо от причины.
 */

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

function countNullBytes(buf: Buffer): number {
  let count = 0;
  for (const byte of buf) {
    if (byte === 0) count++;
  }
  return count;
}

const htmlFiles = findHtmlFiles(DIST_DIR);
const corrupted: Array<{ file: string; count: number }> = [];

for (const file of htmlFiles) {
  const buf = readFileSync(file);
  const count = countNullBytes(buf);
  if (count > 0) {
    corrupted.push({ file: path.relative(process.cwd(), file), count });
  }
}

if (corrupted.length > 0) {
  console.error(
    `✗ Найдены байты 0x00 в собранном HTML (${corrupted.length} файл(ов)):`,
  );
  for (const { file, count } of corrupted) {
    console.error(`  - ${file}: ${count} null byte(s)`);
  }
  console.error(
    "\nБраузер отрисует 0x00 в тексте как видимый символ замены «�» —" +
      " это реальная порча текста, не косметика. См. docs/10-quality-gates.md" +
      " §2.1 (известная проблема, расследована при ревизии кода, август 2026)" +
      " перед тем, как разбираться заново.",
  );
  process.exit(1);
}

console.log(`✓ Нет байтов 0x00 в ${htmlFiles.length} собранных HTML-файлах.`);
