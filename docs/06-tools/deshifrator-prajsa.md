# Инструмент: Дешифратор прайса (`p3-cenu-atsifretajs`, Ф2, ★★)

## Назначение и границы (важно прочитать перед реализацией)

Это образовательный инструмент прозрачности, **не** публичный инструмент
разоблачения конкретных школ. Он помогает пользователю разложить *любую*
рекламируемую цену на вероятный полный набор компонентов — не хранит и не
публикует «настоящую» цену конкретной школы без её согласия (это защищает от
репутационного/юридического риска — иначе портал превращается в площадку
для необоснованных обвинений в скрытых платежах).

## Вход

```ts
interface DecoderInput {
  advertised_price_eur: number;         // цена, которую пользователь увидел в рекламе/на сайте школы
  included: {
    theory_course: boolean;
    exam_fees: boolean;
    practice_hours_count: number | null; // если известно из рекламы
    first_aid_course: boolean;
  };
  city_id: string;
  gearbox: "manual" | "automatic";
}
```

Опционально — выбор школы из каталога (только для партнёров с полными
данными о цене, `partner_price_eur` уже включает все компоненты по
определению партнёрского онбординга).

## Выход

Разложение: список типовых компонентов полной стоимости (из `cost_model`
реалистичного сценария выбранного города), напротив каждого — отмечено
`included`/`not mentioned`, итоговая «вероятная полная стоимость» = 
`advertised_price_eur + sum(компоненты, не отмеченные included)`.

## Формула

```ts
function decodePrice(input: DecoderInput, cost: CostModelCoefficients): DecoderResult {
  const missing: Array<{ component: string; typical_eur: number }> = [];
  if (!input.included.theory_course) missing.push({ component: "theory_course", typical_eur: 200 });
  if (!input.included.exam_fees) missing.push({ component: "exam_fees", typical_eur: cost.csdd_fee_eur });
  if (!input.included.first_aid_course) missing.push({ component: "first_aid_course", typical_eur: cost.medical_fee_eur });
  if (input.included.practice_hours_count !== null && input.included.practice_hours_count < 20) {
    missing.push({ component: "extra_practice_hours", typical_eur: cost.practice_fee_eur * 0.3 });
  }
  const likely_total = input.advertised_price_eur + missing.reduce((s, m) => s + m.typical_eur, 0);
  return { missing, likely_total_eur: likely_total };
}
```

## Состояния

`input` → `result` (таблица компонентов + итог) → `school-selected` (авто-
заполнение из данных партнёра, без «missing»-строк, потому что партнёрская
цена по определению полная).

## Edge cases

- Если пользователь отмечает всё как `included` — результат равен введённой
  цене, инструмент честно показывает «Похоже, эта цена уже полная», не
  придумывает скрытые компоненты, которых нет.
- Инструмент никогда не привязывает результат разбора к названию конкретной
  не-партнёрской школы автоматически — только к введённым пользователем
  данным.

## Что при пустых данных

`cost_model` для города недоступен → используется усреднённое значение по
Латвии с пометкой `is_estimated_fallback`, как и в калькуляторе.

## Аналитика

`decoder_started` · `decoder_manual_price_entered` · `decoder_school_selected
{school_id}` · `decoder_result_viewed {missing_count, likely_total_eur}`.

## Критерии приёмки

- Unit-тест `decodePrice` на нескольких комбинациях `included`.
- Текст результата не называет школу «нечестной» — формулировки нейтральные
  («не упомянуто в рекламируемой цене», не «скрывает от вас»).
- Работает без выбора школы (чисто ручной ввод) как основной сценарий.
