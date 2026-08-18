# 10. Quality gates

Числовые пороги ниже, ниже которых ветка не мержится. Все проверяются
автоматически одной командой `npm run check` в CI — ни один порог не
проверяется «на глаз» на code review.

## 1. Пороги

| Гейт | Порог | Инструмент |
|---|---|---|
| TypeScript | `strict: true`, ноль `any` (кроме явно помеченных `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- причина`, которых в идеале 0), ноль ошибок сборки | `tsc --noEmit` |
| Линт | 0 ошибок, 0 warning (`--max-warnings=0`) | ESLint |
| Форматирование | без diff после `prettier --check` | Prettier |
| Lighthouse mobile — Performance | ≥ 90 | Lighthouse CI, мобильный профиль |
| Lighthouse mobile — Accessibility | ≥ 95 | Lighthouse CI (включая `axe-core` правила) |
| Lighthouse mobile — SEO | 100 | Lighthouse CI |
| LCP | ≤ 2.0s на throttled Slow 4G | Lighthouse CI |
| CLS | ≤ 0.05 | Lighthouse CI |
| INP | ≤ 200ms | Lighthouse CI (field-эмуляция через lab-данные на этом этапе, RUM — отдельная задача Ф2+) |
| JS на контентной странице | ≤ 60 KB gzip (весь JS, включая PhaseBar-остров) | Кастомный скрипт `scripts/check-bundle-budget.ts` по манифесту сборки Astro |
| JS инструмента | Загружается **только** на своей странице, отдельный chunk (не в общем бандле) | Тот же скрипт — проверяет, что chunk инструмента не входит в манифест других страниц |
| Языковые версии | Каждая **опубликованная** страница либо имеет пару LV/RU с корректным `hreflang`, либо у неё пара отсутствует **и** `LangSwitch` корректно в состоянии `disabled` (не битая ссылка) | `scripts/check-i18n-coverage.ts` (docs/07-i18n-seo.md) |
| Unit-тесты формул | 100% покрытие для: `computeWizardPath`, `computeCalculator`, `wilsonLowerBound`, `computeTheoryValidityDeadline`, `decodePrice`, `evaluateSimulation` — каждая формула из `docs/06-tools/*.md` обязана иметь тест с числами из соответствующей фикстуры | Vitest |
| Захардкоженные строки | 0 текстовых литералов в UI-компонентах островов (`.tsx` в `src/components/tools/*`, `src/components/layout/*`) вне словарей `src/i18n/{lv,ru}.json` | Кастомное ESLint-правило `no-hardcoded-ui-strings` |
| Фикстуры | Все 8 файлов `/fixtures/*.json` проходят валидацию Zod-схемой, соответствующей типу из docs/03-data-model.md | Vitest (`fixtures.spec.ts`) |

## 2. Почему именно эти числа (коротко, для будущих споров «а можно 65 KB?»)

- **60 KB gzip на контентной странице** — таков был явный бюджет задания;
  выбран, чтобы визард/калькулятор/тренажёр не притянули JS-рантайм на
  страницы вроде «Справочник знаков», которые открывают на дешёвых
  телефонах на мобильном интернете (контекст — не только Рига, а
  национальный охват, включая регионы с более слабым покрытием).
- **LCP ≤ 2.0s / CLS ≤ 0.05 / INP ≤ 200ms** — это верхняя граница Google
  Core Web Vitals «Good» с запасом (официальные пороги мягче — 2.5s/0.1/200ms),
  запас нужен, потому что реальные пользователи на throttled-соединении
  всегда хуже lab-теста.
- **SEO 100** — портал живёт с органики, это не «желательно», а
  единственный канал привлечения для контентных 85% дерева.

## 3. `npm run check`

Один скрипт, агрегирующий все гейты, вызывается локально перед PR и в CI на
каждый push:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "format:check": "prettier --check .",
    "test:unit": "vitest run",
    "build": "astro build",
    "budget": "tsx scripts/check-bundle-budget.ts",
    "i18n:coverage": "tsx scripts/check-i18n-coverage.ts",
    "lighthouse": "lhci autorun",
    "check": "npm run typecheck && npm run lint && npm run format:check && npm run test:unit && npm run build && npm run budget && npm run i18n:coverage && npm run lighthouse"
  }
}
```

Порядок — от самого дешёвого к самому дорогому (typecheck за секунды,
Lighthouse — десятки секунд на страницу), чтобы разработчик получал обратную
связь как можно раньше и не ждал полный Lighthouse-прогон ради опечатки в
типе.

## 4. Что НЕ входит в `npm run check` (сознательно, не забыто)

- E2E-тесты пользовательских сценариев (Playwright) — заводятся начиная с
  Ф1 как отдельный `npm run test:e2e`, не блокируют каждый PR (слишком
  медленные для гейта на каждый коммит), гоняются на ночной сборке и перед
  релизом фазы.
- RUM (реальные данные Core Web Vitals от пользователей) — задача Ф2+,
  Lighthouse CI даёт lab-данные, этого достаточно для гейта на PR, но не
  заменяет мониторинг прод-метрик.
- Security review RLS-политик Supabase (Ф4) — ручной процесс, не
  автоматизируется в `npm run check` (см. docs/00-assumptions.md, риски).
