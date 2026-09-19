# Инструмент: Симулятор экзамена (`p2-teorija-rezims`, Ф2, ★★)

Полноразмерная имитация настоящего теоретического экзамена CSDD — в отличие
от тренажёра (Ф1, свободная тренировка), здесь фиксированное число вопросов,
таймер и порог сдачи/провала, максимально приближенные к реальному экзамену.

## Вход

Категория прав, кнопка «Начать симуляцию» (с явным экраном правил перед
стартом: сколько вопросов, сколько времени, сколько ошибок допустимо).

## Выход

Результат `passed: boolean`, число ошибок, время прохождения.

**Не реализовано (T-065, честно раскрыто в docs/11-backlog.md):** разбивка
ошибок по темам из исходного контракта невозможна на реальных данных — ни
`TheoryQuestion` (`src/types/data.ts`), ни фикстура
(`src/content/theory-questions/b.json`) не содержат поля темы/раздела
вопроса, только `categories` (категория прав «B», не тематика). Выдумывать
таксономию тем самостоятельно значило бы фабриковать классификацию
контента — нужна отдельная задача, добавляющая поле темы в модель данных,
прежде чем это станет возможным.

## Состояния

`rules-intro` → `in-progress` (таймер обратного отсчёта, X/N вопросов, строго
по порядку, без возврата назад — как в реальном экзамене) → `submitted` →
`result-passed` / `result-failed` → `insufficient-question-bank` (банк
вопросов ещё мал для честной симуляции — заменяет `rules-intro`, не
предлагает начать заведомо нечестную симуляцию).

## Формула

```ts
const EXAM_QUESTION_COUNT = 30;
const EXAM_MAX_ERRORS = 3;
const EXAM_TIME_LIMIT_MIN = 30;

function evaluateSimulation(answers: Array<{ question_id: string; correct: boolean }>): SimulationResult {
  const errors = answers.filter(a => !a.correct).length;
  return { passed: errors <= EXAM_MAX_ERRORS, errors_count: errors, total: answers.length };
}
```

**Пороговые числа подтверждены официальным источником (T-066):** csdd.lv,
«Vieglā automobiļa vadītāja apliecība (B)» → «Teorētiskais eksāmens un
pieteikšanās eksāmenam» (`csdd.lv/viegla-automobila-vaditaja-aplieciba-b/
teoretiskais-eksamens-un-pieteiksanas-eksamenam`), со ссылкой на MK
noteikumi Nr. 103 (02.02.2010). Дословно: «Eksāmenā jāatbild uz 30
jautājumiem... Atbilžu sniegšanai atvēlētais laiks ir 30 minūtes... Eksāmens
ir nokārtots, ja nepareizi atbildēto jautājumu skaits nepārsniedz 3
jautājumus» — до сверки `EXAM_MAX_ERRORS` был занижен до 2. Проверено прямым
скрейпом реального DOM (Playwright), не саммари WebFetch/WebSearch — числа
критичны для формулы.

## Edge cases

- Банк вопросов для категории < `EXAM_QUESTION_COUNT` уникальных вопросов →
  инструмент недоступен (`insufficient-question-bank`), не эмулирует экзамен
  повторами вопросов, выдавая это за честную симуляцию.
- Пользователь закрывает вкладку посреди симуляции → сессия не засчитывается,
  начинается заново (в отличие от тренажёра, здесь не сохраняем недосданную
  попытку — это исказило бы статистику «сдал/не сдал»).

## Что при пустых данных

См. `insufficient-question-bank` выше — единственное состояние, специфичное
для этого инструмента.

## Аналитика

`simulator_started {category}` · `simulator_completed {passed, errors_count,
duration_sec, category}`. `simulator_topic_breakdown_viewed` из исходного
контракта не реализовано — событие относится к разбивке по темам,
недоступной на реальных данных (см. «Выход» выше), не эмитируется без
соответствующего UI.

## Критерии приёмки

- Числа `EXAM_QUESTION_COUNT`/`EXAM_MAX_ERRORS`/`EXAM_TIME_LIMIT_MIN`
  подтверждены официальным источником CSDD (T-066, см. «Формула» выше).
- Таймер точен (проверяется unit-тестом на фиксированных временных метках —
  `getRemainingSeconds`, `src/lib/simulator/evaluateSimulation.ts` — не
  «на глаз» в браузере).
- Результат «провал» ведёт тем же тоном, что и экран «Не сдал экзамен»
  (docs/06-tools/ekran-ne-sdal.md) — не более резким.
