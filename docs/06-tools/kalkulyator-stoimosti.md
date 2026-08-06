# Инструмент: Калькулятор стоимости (`p3-kalkulators`, Ф1, ★★)

## Вход

```ts
interface CalculatorInput {
  gearbox: "manual" | "automatic";
  city_id: string;
  has_medical_certificate: boolean; // "есть"/"нет" в UI
  has_first_aid_course: boolean;
  difficulty: number; // 0..100, слайдер "легко—тяжело", по умолчанию 50
}
```

## Выход

Таблица 3 колонки (Оптимист / Реалист / Пессимист) × 4 строки (Школа /
Практика / CSDD / Медицина) + строка ИТОГО, статичный блок «Сюда НЕ входит»
(5 пунктов, редакционный контент, не считается), сравнение «Средняя цена по
городу» vs «Autoskola FORS» (только если в городе есть партнёр).

## Состояния

`default` (реалистичный сценарий с настройками по умолчанию виден сразу, без
клика «Рассчитать» — Экран 3 показывает результат сразу под формой) →
`input-changed` (пересчёт мгновенный, debounce 150ms на слайдере) →
`no-partner-in-city` (блок сравнения с FORS скрыт, если в выбранном городе
нет партнёра) → `estimated-fallback` (бейдж, если для города нет собственных
данных).

## Формула

```ts
function computeCalculator(input: CalculatorInput, coeffs: CostModelCoefficients[]): CalculatorResult {
  const scenarios = (["optimist", "realist", "pessimist"] as const).map(scenario => {
    const base = coeffs.find(c => c.city_id === input.city_id && c.gearbox === input.gearbox && c.scenario === scenario)
      ?? fallbackLatviaAverage(coeffs, input.gearbox, scenario);

    // слайдер "легко-тяжело" двигает только практику: 0 => -15%, 50 => 0%, 100 => +15%
    const difficultyMultiplier = 1 + ((input.difficulty - 50) / 50) * 0.15;

    return {
      scenario,
      school_fee_eur: base.school_fee_eur,
      practice_fee_eur: round2(base.practice_fee_eur * difficultyMultiplier),
      csdd_fee_eur: base.csdd_fee_eur,
      medical_fee_eur: input.has_medical_certificate ? 0 : base.medical_fee_eur,
      is_estimated_fallback: base.is_estimated_fallback,
    };
  });
  return { scenarios, totals: scenarios.map(s => ({ scenario: s.scenario, total: sum(s) })) };
}
```

`has_first_aid_course` не меняет числа в таблице (курс первой помощи учтён в
`medical_fee_eur` базовой ставки как отдельная строка расшифровки под
таблицей, не сворачивается в общую сумму — чтобы пользователь видел, за что
именно платит).

## Edge cases

- Город без записи в `cost_model` → `fallbackLatviaAverage`, явный бейдж
  «Точных данных по {город} пока нет — показана оценка по Латвии в среднем».
- В городе нет школы с `is_partner: true` → строка сравнения с FORS не
  рендерится вообще (не показывается прочерк/пустая строка).
- **Партнёрская цена НЕ подсвечивается визуально.** Строка FORS верстается в
  той же таблице тем же стилем, что и «Средняя цена по городу» — это
  проверяемый критерий приёмки (см. ниже), а не пожелание дизайна.

## Что при пустых данных

Если `cost_model` не загружен вовсе — калькулятор не рендерит таблицу с
нулями, а показывает `Callout tone="warning"`: «Данные о стоимости временно
недоступны» + ссылка на `p2-cenas` (официальные тарифы CSDD, которые не
зависят от рыночного исследования и могут быть доступны отдельно).

## Аналитика

`calculator_viewed` · `calculator_input_changed {field, value}` ·
`calculator_result_computed {realist_total_eur, city_id, gearbox}` ·
`calculator_partner_cta_clicked {school_id}`.

## Критерии приёмки

- Unit-тест на `computeCalculator`: реалистичный сценарий для Риги/механики
  с `difficulty=50` даёт ровно 909 / 1390 / 1999 € (числа из Экрана 3,
  фикстура `fixtures/cost_model.json`).
- Снимок DOM (visual regression) подтверждает, что строка FORS и строка
  «Средняя цена» имеют идентичные CSS-классы (единственное отличие — текст).
- Слайдер управляем клавиатурой, значение озвучивается скринридером
  (`aria-valuenow`/`aria-valuetext`, не только визуальная позиция).
- JS-бандл этого острова ≤ отдельный бюджет, заданный в docs/10-quality-gates.md.
