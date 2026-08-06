# Инструмент: Визард «Твой путь» (`wizard`, Ф1, ★)

## Вход

4 шага, каждый — один выбор без возможности пропустить (прогресс-бар `●○○○`):

1. `age_bracket`: `"16-17" | "18-24" | "25-35" | "36+"`
2. `has_medical_certificate`: `"yes" | "no" | "unknown"`
3. `gearbox_preference`: `"manual" | "automatic" | "undecided"`
4. `city_id`: выбор из списка городов (docs/02-routes.md, Pillar 3)

## Выход

Объект `WizardResult` (тип — docs/03-data-model.md) + визуальный список шагов
пути (Экран 2 Модуля 7): 9 карточек-шагов с ценой и сроком, итоговая сумма,
дедлайн, две кнопки — «Сохранить путь» и «Что дальше?».

## Состояния

`step-1` … `step-4` → `computing` (короткий, <300ms, но обязателен как
отдельный кадр — иначе результат «моргает») → `result` → `saved` (после клика
«Сохранить путь») → `share-link-copied`.

## Формула

```ts
type StepId =
  | "medical-certificate" | "white-license" | "choose-school"
  | "theory-course" | "first-aid-course" | "theory-exam"
  | "practice" | "driving-exam" | "plastic-card";

function computeWizardPath(input: WizardInput, tariffs: CsddTariff[], cost: CostModelCoefficients[]): WizardResult {
  const steps: Array<{ step_id: StepId; price_eur: number; duration_label: string }> = [];

  if (input.has_medical_certificate !== "yes") {
    steps.push(priced("medical-certificate", tariffs, "1-7д"));
  }
  steps.push(priced("white-license", tariffs, "1д"));
  steps.push({ step_id: "choose-school", price_eur: 0, duration_label: "1-2н" });
  steps.push(priced("theory-course", tariffs, "4-8н"));
  steps.push(priced("first-aid-course", tariffs, "1д"));
  steps.push(priced("theory-exam", tariffs, ""));

  const realist = cost.find(c =>
    c.city_id === input.city_id &&
    c.gearbox === (input.gearbox_preference === "undecided" ? "manual" : input.gearbox_preference) &&
    c.scenario === "realist"
  ) ?? fallbackLatviaAverage(cost, input.gearbox_preference === "undecided" ? "manual" : input.gearbox_preference, "realist");
  steps.push({ step_id: "practice", price_eur: realist.practice_fee_eur, duration_label: "2-4м" });

  steps.push(priced("driving-exam", tariffs, ""));
  steps.push(priced("plastic-card", tariffs, ""));

  const computed_total_eur = steps.reduce((sum, s) => sum + s.price_eur, 0)
    + (realist.school_fee_eur ?? 0); // школа считается отдельной строкой в UI, но входит в итог

  const computed_deadline = addYears(new Date(), 3).toISOString(); // "экзамен вождения — до 3 лет с зачисления"

  return { ...input, computed_steps: steps, computed_total_eur, computed_deadline };
}
```

`priced()` — хелпер, ищет тариф по `id` в `csdd_tariffs`; если тариф
отсутствует — шаг **не добавляется** в массив (не 0 €), а в UI карточка шага
рендерится с пометкой «Цену уточняем» вместо суммы (см. `docs/03`, правило
пустых данных).

## Edge cases

- `age_bracket: "16-17"` — юридически требуется белые права + согласие
  родителей; шаг цены не меняется, но карточка результата получает `Callout
  tone="info"` со ссылкой на `p1-baltas-macities-ar-vecakiem`.
- `city_id` без данных в `cost_model` → используется `fallbackLatviaAverage`,
  и итоговая сумма помечена бейджем «оценка по Латвии в среднем» (переиспользует
  `is_estimated_fallback`, docs/03).
- `gearbox_preference: "undecided"` → расчёт использует `"manual"` как более
  дорогой и распространённый вариант (не занижает ожидания пользователя),
  явно подписано «Показано для механики — автомат обычно дороже».
- Повторное прохождение визарда перезаписывает `wizard_result` в `user_state`,
  не накапливает историю (история — не в скоупе Ф1).

## Что при пустых данных

Если `csdd_tariffs`/`cost_model` не загружены вовсе (первый деплой без ETL)
— визард показывает шаги без цен и баннер «Расчёт стоимости временно
недоступен, порядок шагов актуален» — сам визард не блокируется, потому что
последовательность шагов не зависит от актуальности цен.

## Аналитика

`wizard_started` · `wizard_step_completed {step, value}` ·
`wizard_completed {total_eur, city_id, deadline}` ·
`wizard_path_saved {has_email: boolean}` · `wizard_share_link_copied`.

## Критерии приёмки

- Unit-тест `computeWizardPath` на фикстурах `fixtures/cost_model.json` +
  `fixtures/csdd_tariffs.json`: сумма шагов совпадает с ручным пересчётом.
- Отсутствие любого одного тарифа не роняет расчёт остальных шагов.
- «Сохранить путь» работает без email (генерирует shareable-ссылку с
  закодированным (не PII) состоянием в query) и с email (пишет
  `saved_path_email` в `user_state`).
- Кнопка визарда на главной — единственный CTA верхнего уровня (нет второго
  равнозначного CTA рядом, см. Экран 1).
- Полностью проходим с клавиатуры (см. docs/04, §6).
