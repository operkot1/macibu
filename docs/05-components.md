# 05. Инвентарь компонентов

Три категории: **layout** (общие для всех страниц, ноль JS кроме PhaseBar),
**контентные** (используются внутри статей/справочников, ноль JS), **инструменты**
(каждый — отдельный React-остров, гидратируется только на своей странице).

Общее правило именования: `PascalCase.astro` для чисто серверных компонентов,
`PascalCase.tsx` для островов. Файлы — в `src/components/layout/`,
`src/components/content/`, `src/components/tools/{tool-slug}/`.

---

## 1. PhaseBar — сквозная система персонализации (спроектировать первой)

Это не виджет, а источник состояния, который читают: главная (блок
рекомендаций), рекомендации в конце статей, содержание push-уведомлений (Ф4).
Спроектировано до первой страницы, потому что переписывать эту часть после
того, как 50 статей уже сверстаны с точечными интеграциями, — дорого.

### Где живёт состояние

- **Хранилище:** `nanostores` (не Redux/Zustand — нужен минимальный размер
  бандла, `nanostores` даёт framework-agnostic store, который могут читать
  несколько независимых React-островов на одной странице без общего дерева
  компонентов и без prop drilling между `client:*` границами).
- **Файл:** `src/lib/state/phase.ts`, экспортирует
  `phaseStore: MapStore<{ value: PhasePhase; updatedAt: string }>` и функции
  `setPhase()`/`getPhase()`.
- **Тип фазы — переиспользует enum `UserState.phase`** из
  docs/03-data-model.md (`"choosing-school" | "learning-theory" |
  "driving-with-instructor" | "preparing-exam" | "failed-exam" |
  "got-license"`), чтобы не было двух параллельных словарей одного понятия.
- **Персистентность (аноним):** `localStorage['portal:phase']`, читается
  синхронно при инициализации store на клиенте.
- **Персистентность (Ф4, есть аккаунт):** запись дублируется в Supabase
  `user_state.phase` при каждом изменении (fire-and-forget, не блокирует UI);
  при логине на новом устройстве серверное значение перекрывает локальное.

### Как читают остальные компоненты

- `PhaseBar.tsx` (остров, `client:load` — это единственный остров, который
  должен гидратироваться сразу, а не лениво, потому что он sticky и виден с
  первого кадра) — пишет в `phaseStore` по клику.
- `HomePhaseRecommendation.tsx` (остров, `client:visible`) — подписан на
  `phaseStore`, рендерит разный блок под главной в зависимости от значения.
  **До гидратации на сервере рендерится нейтральное состояние** («Ещё не
  выбрал(а)? [Пройти визард]») — фаза известна только на клиенте
  (`localStorage`), поэтому SSR не может персонализировать этот блок без
  сдвига layout после гидратации. Высота блока фиксирована заранее (skeleton
  того же размера), чтобы не было CLS.
- `ArticleRecommendation.astro` внутри `ArticleTemplate` — рендерится как
  тонкий серверный шелл + маленький остров `client:idle` внутри, который
  дополняет типовую рекомендацию персонализированной, когда браузер свободен
  (не блокирует LCP статьи).
- Push-уведомления (Ф4) — не читают `phaseStore` напрямую (это серверная
  задача), а читают `user_state.phase` из Supabase при формировании рассылки.

### Props `PhaseBar`

```ts
interface PhaseBarProps {
  variant: "sticky-mobile" | "inline-desktop"; // sticky под меню на мобильном, инлайн на desktop
  currentLocale: "lv" | "ru";
}
```

Состояния: `default`, `active` (текущая выбранная фаза подсвечена
`color-primary-100` фоном), `focus-visible` на каждой кнопке-фазе,
`loading` не применим (значение читается синхронно из localStorage до первой
отрисовки через инлайн-скрипт в `<head>`, чтобы не было мигания).

---

## 2. Layout-компоненты

### `Header.astro`

```ts
interface HeaderProps {
  currentLocale: "lv" | "ru";
  currentRouteId: string; // для подсветки активного пункта меню
}
```
Состояния: `default`, `menu-open` (мобильный бургер — управляется маленьким
инлайн-скриптом, не React-островом, это чистый CSS `:checked`-переключатель,
чтобы не тянуть JS ради открытия меню).

### `LangSwitch.astro`

```ts
interface LangSwitchProps {
  currentLocale: "lv" | "ru";
  alternateUrl: string | null; // null, если перевода страницы нет — см. docs/07-i18n-seo.md
}
```
Состояния: `default`, `disabled` (если `alternateUrl === null` — переключатель
показывает второй язык неактивным с подсказкой «Страница пока недоступна на
русском», а не скрывается молча и не ведёт на 404).

### `Footer.astro`

```ts
interface FooterProps {
  currentLocale: "lv" | "ru";
  dataFreshness: {
    csddTariffsUpdatedAt: string | null;
    ratingsUpdatedAt: string | null;
  };
}
```
Содержит: ссылку на методику рейтинга (`p3-metodologija`), источники данных,
дату последней сверки тарифов (переиспользует `DataFreshness`, см. ниже),
контакты, юридическое.

---

## 3. Контентные компоненты

### `Callout.astro`

```ts
interface CalloutProps {
  tone: "info" | "warning" | "danger" | "success";
  title?: string;
  // children — MDX content
}
```
Используется, в частности, для cross-link исправлений `D-01` (docs/02-routes.md)
— страницы без собственного инструмента ссылаются на ближайший через
`<Callout tone="info">`.

### `StepList.astro`

```ts
interface StepListStep {
  index: number;
  title: string;
  priceEur?: number;
  durationLabel?: string;
  isDone?: boolean; // для интерактивного чек-листа "9 шагов"
}
interface StepListProps {
  steps: StepListStep[];
  interactive: boolean; // false — просто список в статье; true — чекбоксы с персистентностью в user_state
}
```
Состояния: `default`, `done` (зачёркнутый пункт + галочка, только если
`interactive`), `loading` (skeleton-строки, пока не прочитан `user_state`).

### `Checklist.astro`

Специализация `StepList` без цен/сроков — используется в справочных
чек-листах («Что взять с собой», «Проверка перед покупкой»). Без стейта,
чистый HTML `<ul>` со стилизованными маркерами (не настоящий интерактивный
компонент — интерактивные чек-листы используют `StepList interactive`).

### `DataFreshness.astro`

```ts
interface DataFreshnessProps {
  label: string;              // "Тарифы CSDD", "Рейтинг"
  updatedAt: string | null;   // ISO date; null → состояние unknown
  staleAfterDays: number;     // порог, после которого статус меняется на warning
  locale: "lv" | "ru";        // без этого статусный текст хардкодится на одном языке — найдено при интеграции в Footer (T-014)
}
```
Состояния: `fresh` (`color-success-600`, «Проверено {дата}»), `stale`
(`color-warning-600`, «Обновлено {дата} — проверяем актуальность»), `unknown`
(`color-neutral-600`, «Нет данных» — см. правило пустых данных docs/03).

### `FAQ.astro`

```ts
interface FAQItem { question: string; answer: string; } // answer — MDX
interface FAQProps { items: FAQItem[]; }
```
Рендерит `<details>/<summary>` (нативная доступность, работает без JS) +
генерирует `FAQPage` Schema.org (docs/07-i18n-seo.md).

---

## 4. Инструменты — острова

Общий контракт для любого инструмента — обёртка `ToolShell`, чтобы каждый
остров не переизобретал заголовок/хлебные крошки/состояние загрузки:

```ts
interface ToolShellProps {
  toolId: string;         // совпадает с route_id из docs/02-routes.md
  title: string;
  dataFreshness?: DataFreshnessProps; // если инструмент использует внешние данные
  emptyStateSlot?: boolean; // зарезервировать слот под empty state до готовности данных
}
```

Каждый инструмент — отдельный `.tsx`-файл в `src/components/tools/{slug}/`,
монтируется `client:visible` по умолчанию (не `client:load`), кроме
`PhaseBar`, который не инструмент, а системный компонент. Полные контракты
(вход/выход/формулы/edge cases/аналитика/критерии приёмки) — в
`docs/06-tools/*.md`, по одному файлу на инструмент.

| Инструмент | route_id | Файл контракта |
|---|---|---|
| Визард «Твой путь» | `wizard` | `docs/06-tools/vizard-tvoj-put.md` |
| Калькулятор стоимости | `p3-kalkulators` | `docs/06-tools/kalkulyator-stoimosti.md` |
| Экран «Не сдал экзамен» | `p2-nenokartoju-index` | `docs/06-tools/ekran-ne-sdal.md` |
| Тренажёр теории | `p2-teorija-testi` | `docs/06-tools/trenazhyor-teorii.md` |
| Симулятор экзамена | `p2-teorija-rezims` | `docs/06-tools/simulyator-ekzamena.md` |
| Разбор протокола | `p2-nenokartoju-protokols` | `docs/06-tools/razbor-protokola.md` |
| Каталог школ с фильтрами | `p3-katalogs` | `docs/06-tools/katalog-shkol.md` |
| Рейтинг школ | `p3-reitings` | `docs/06-tools/rejting-shkol.md` |
| Рейтинг инструкторов | `p3-instruktori` | `docs/06-tools/rejting-instruktorov.md` |
| Дешифратор прайса | `p3-cenu-atsifretajs` | `docs/06-tools/deshifrator-prajsa.md` |
| Трекер занятий | `p4-trakeris` | `docs/06-tools/treker-zanyatij.md` |
| Карта экзаменационных зон | `p2-vadisana-zonas` | `docs/06-tools/karta-zon.md` |
| Справочник штрафов | `p5-sodi` | `docs/06-tools/spravochnik-shtrafov.md` |
| «Что делать при ДТП» | `p5-csn-negadijums` | `docs/06-tools/chto-delat-pri-dtp.md` |
| Форма записи | `apply-index` | `docs/06-tools/forma-zapisi.md` |

Инструменты вне этого списка (интерактивный чек-лист 9 шагов, карта мест
сдачи медсправки, каталог курсов первой помощи, карта центров CSDD, права
ученика, генератор заявления о смене инструктора, проверка e-CSDD, справочник
знаков, таймлайн/дедлайны, план первых 10 поездок, пункты нарушений,
проверка перед покупкой авто, калькулятор содержания авто) — более лёгкие
острова (★, не ★★), их контракт фиксируется в конкретной backlog-задаче на
момент реализации (docs/11-backlog.md), отдельного файла в `06-tools/` для
них не заводим, чтобы не плодить документы под однодневные задачи.
