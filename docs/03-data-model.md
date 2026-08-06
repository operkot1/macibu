# 03. Контракты данных

Каждый источник ниже — это TypeScript-тип (компилируется, используется как
единственный источник правды и на фронте, и в ETL-скриптах), происхождение
данных, частота обновления, владелец и явное поведение при отсутствии данных.

Для каждого источника есть mock-фикстура в `/fixtures/*.json`, валидная по
своей схеме. Это блокирующее требование задания: инструменты собираются и
тестируются на фикстурах до появления реальных данных CSDD. Фикстуры лежат
рядом с этим документом в корне репозитория, не внутри `docs/`.

Общее правило пустых данных: **портал никогда не выдумывает число**. Если
данных нет — показывается явный empty state с текстом и (где уместно) датой
последней попытки обновления, а не 0, не «—» без объяснения и не число из
другого города/периода без пометки.

---

## 1. `csdd_tariffs` — тарифы CSDD

```ts
interface CsddTariff {
  id: string;                 // "medical-certificate" | "white-license" | "theory-course" | ...
  category: string;           // код категории прав ("B") или "all"
  name_lv: string;
  name_ru: string;
  price_eur: number;
  unit: "per-attempt" | "one-time" | "per-year";
  effective_from: string;     // ISO-8601 date
  source_document: string;    // ссылка/номер официального документа CSDD
}

interface CsddTariffsFile {
  updated_at: string;         // ISO-8601, когда загружена текущая выгрузка
  source: "csdd-export-xlsx";
  source_file_ref: string;    // имя/хэш загруженного файла — для аудита
  tariffs: CsddTariff[];
}
```

- **Откуда:** периодическая выгрузка CSDD в xlsx/csv (подтверждено
  заказчиком, не API). Файл загружается вручную в админ-инструмент импорта.
- **Как часто обновляется:** при изменении официальных тарифов (исторически
  — несколько раз в год), но **проверяется** ежемесячно cron-джобой, которая
  сверяет `updated_at` и шлёт алерт, если данные старше 60 дней.
- **Владелец:** Data Ops (человек, который получает файл от CSDD/заказчика и
  прогоняет импорт).
- **При отсутствии данных:** конкретная строка тарифа не рендерится в
  калькуляторе/визарде (не 0 €); компонент `DataFreshness` внизу страницы
  показывает «Тарифы CSDD: нет актуальных данных с {дата}, уточняйте на
  csdd.lv» — ссылка на официальный источник обязательна при устаревании
  >90 дней.

## 2. `schools` — каталог автошкол

```ts
interface School {
  id: string;
  slug: string;                        // общий слаг LV/RU, напр. "fors"
  name: string;
  city_id: string;                     // слаг города, общий на LV/RU
  address: string;
  csdd_registration_number: string;    // официальный рег. номер CSDD
  languages: Array<"lv" | "ru" | "en">;
  gearbox: Array<"manual" | "automatic">;
  categories: string[];                // ["B"], ["B", "A"], ...
  is_partner: boolean;                 // определяет наличие кнопки "Записаться"
  partner_price_eur: number | null;    // цена известна только если is_partner
                                        // и школа её предоставила
  phone: string | null;
  contact_email: string | null;
  website: string | null;
  data_available_for_rating: boolean;  // есть ли статистика CSDD для рейтинга
}

interface SchoolsFile {
  updated_at: string;
  source: "csdd-export-xlsx" | "partner-onboarding-form";
  schools: School[];
}
```

- **Откуда:** базовый список — CSDD-выгрузка (все зарегистрированные школы
  Латвии, открытые данные). Поля `is_partner`, `partner_price_eur`, `phone`,
  `contact_email` — из анкеты онбординга партнёра (ручной ввод Data Ops /
  партнёрского менеджера).
- **Как часто обновляется:** базовый список — при каждой CSDD-выгрузке
  (квартально); партнёрские поля — немедленно при онбординге/уходе партнёра.
- **Владелец:** Data Ops (базовые поля) + Partnerships (партнёрские поля).
- **При отсутствии данных:** `partner_price_eur: null` → в каталоге строка
  «цена по запросу» вместо выдуманного числа; `is_partner: false` → карточка
  школы не показывает кнопку «Записаться», только контакты (см. `A-02` в
  docs/00-assumptions.md о честности каталога — на старте только FORS
  `is_partner: true`).

## 3. `instructors` — инструкторы и статистика сдач

```ts
interface Instructor {
  id: string;
  full_name: string;
  school_id: string;              // FK → School.id
  city_id: string;
  languages: Array<"lv" | "ru" | "en">;
  gearbox: Array<"manual" | "automatic">;
  exam_attempts_total: number;    // знаменатель выборки
  exam_passes_total: number;      // числитель
  sample_period_from: string;     // ISO date
  sample_period_to: string;
}

interface InstructorsFile {
  updated_at: string;
  source: "csdd-export-xlsx";
  instructors: Instructor[];
}
```

- **Откуда:** CSDD-выгрузка статистики сдачи экзаменов по инструкторам.
- **Как часто обновляется:** с каждой статистической выгрузкой CSDD
  (исторически близко к квартальной периодичности — уточняется в открытом
  вопросе В-1, docs/00-assumptions.md).
- **Владелец:** Data Ops.
- **При отсутствии данных:** `exam_attempts_total: 0` → инструктор **не
  участвует** в рейтинге вообще (не показывается с 0%/N/A), вместо этого —
  бейдж «Недостаточно данных для рейтинга» на карточке инструктора вне
  ранжированного списка.

## 4. `ratings` — рассчитанный рейтинг + размер выборки

```ts
interface RatingEntry {
  subject_type: "school" | "instructor";
  subject_id: string;             // FK → School.id | Instructor.id
  pass_rate: number;              // 0..1, для отображения (честное сырое число)
  sample_size: number;            // exam_attempts_total
  confidence: "sufficient" | "limited" | "insufficient";
  rank_score: number;             // нижняя граница доверительного интервала — см. формулу ниже
  rank: number;                   // позиция в отсортированном списке по rank_score
  calculated_at: string;
}

interface RatingsFile {
  updated_at: string;
  methodology_version: string;    // семвер методики, см. p3-metodologija
  entries: RatingEntry[];
}
```

- **Откуда:** вычисляется автоматически на build-этапе из `schools` +
  `instructors` — **не вводится вручную никем**, это единственная защита от
  манипуляции цифрами.
- **Как часто обновляется:** пересчитывается автоматически при каждом
  обновлении `schools`/`instructors`.
- **Владелец:** нет человека-владельца — владелец это ETL-пайплайн
  (`scripts/compute-ratings.ts`), изменение формулы проходит через code
  review, а не через админку.
- **При отсутствии данных:** если `instructors`/`schools` не обновлялись —
  страница рейтинга показывает последний рассчитанный `ratings.json` с явной
  датой в `DataFreshness`, а не пустую страницу; если файла ratings вообще
  нет (первый запуск) — «Рейтинг пока не рассчитан» без списка-заглушки.

### Правило честности рейтинга (обязательно к прочтению перед любым изменением формулы)

Инструктор со 100% на 3 учениках **обязан** ранжироваться ниже инструктора с
71% на 48 учениках. Сырой процент (`pass_rate`) для этого непригоден — нужна
поправка на размер выборки.

**Формула ранжирования — нижняя граница доверительного интервала Уилсона
(Wilson score interval, 95%),** та же математика, что использует Reddit для
ранжирования комментариев по соотношению голосов:

```ts
function wilsonLowerBound(passes: number, total: number, z = 1.96): number {
  if (total === 0) return 0;
  const phat = passes / total;
  const denominator = 1 + (z * z) / total;
  const centre = phat + (z * z) / (2 * total);
  const margin = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total);
  return (centre - margin) / denominator;
}
```

`rank_score = wilsonLowerBound(exam_passes_total, exam_attempts_total)`.
Список сортируется по `rank_score` **по убыванию**. На экране показывается
`pass_rate` (честный сырой процент — не прячем его), но позиция в списке
определяется `rank_score`.

Проверка на примере из прототипа (Экран 5): 48 попыток / ~34 успеха (71%) →
`wilsonLowerBound ≈ 0.57`. 3 попытки / 3 успеха (100%) → `wilsonLowerBound ≈
0.44`. Первый ранжируется выше — соответствует требованию задания.

**Пороги достоверности (`confidence`), для бейджа рядом с процентом, не для
ранжирования:**

| `sample_size` | `confidence` | Текст на UI |
|---|---|---|
| ≥ 30 | `sufficient` | «ⓘ Выборка достаточная» |
| 10–29 | `limited` | «Выборка ограничена — учитывайте с осторожностью» |
| < 10 | `insufficient` | «⚠ Выборка мала — рейтинг недостоверен» |

Ни один порог не исключает инструктора из списка — Wilson-формула уже
физически отодвигает малые выборки вниз. Исключение из выдачи было бы менее
честным, чем видимая позиция с предупреждением (ровно как в Экране 5: К.
Лапиньш виден на позиции 14, а не скрыт).

## 5. `exam_zones` — зоны экзамена (UGC)

```ts
interface ExamZone {
  id: string;
  city_id: string;
  csdd_center_id: string;
  title_lv: string;
  title_ru: string;
  description_lv: string;
  description_ru: string;
  geo: { lat: number; lng: number };
  route_type: "city" | "highway" | "maneuvers";
  submitted_by: "editorial" | "ugc";
  submitted_at: string;
  moderation_status: "pending" | "approved" | "rejected";
  upvotes: number;
}

interface ExamZonesFile {
  updated_at: string;
  source: "user-generated" | "editorial-seed";
  zones: ExamZone[];
}
```

- **Откуда:** пользовательские отметки (форма на странице карты) +
  редакционные seed-данные на старте (Ф4), чтобы карта не была пустой в день
  запуска.
- **Как часто обновляется:** непрерывно (UGC); модерация — в течение 48
  часов (SLA, не техническое ограничение).
- **Владелец:** community/модерация (человек, не система — UGC требует
  ручной модерации для защиты от спама/недостоверных меток).
- **При отсутствии данных:** для города без отмеченных зон — состояние
  «Пока нет отмеченных зон в {город}. Будьте первым» с кнопкой добавления,
  не пустая серая карта без объяснения.

## 6. `theory_questions` — банк вопросов тренажёра

```ts
interface TheoryQuestionOption {
  id: string;
  text_lv: string;
  text_ru: string;
  is_correct: boolean;
}

interface TheoryQuestion {
  id: string;
  categories: string[];           // применимые категории прав, ["B"], ["B","A"]
  text_lv: string;
  text_ru: string;
  media_url: string | null;       // для video-jautajumi — ссылка на видео
  options: TheoryQuestionOption[];
  explanation_lv: string;
  explanation_ru: string;
  difficulty: "easy" | "medium" | "hard";
  official_reference: string | null; // номер вопроса в официальном банке CSDD, если известен
}

interface TheoryQuestionsFile {
  updated_at: string;
  source: "editorial" | "csdd-question-bank";
  questions: TheoryQuestion[];
}
```

- **Откуда:** редакционная методическая команда, сверяется с официальным
  банком вопросов CSDD там, где он публичен.
- **Как часто обновляется:** нерегулярно — при изменении официального банка
  вопросов CSDD (исторически редко, но без фиксированного цикла).
- **Владелец:** методист/контент-команда.
- **При отсутствии данных:** если для категории (например, C) вопросов ещё
  нет — тренажёр на этой категории показывает «Этот раздел ещё не готов,
  доступно для категории B» вместо пустого/падающего квиза.

## 7. `user_state` — «где ты сейчас», сохранённый путь, прогресс

```ts
interface WizardResult {
  age_bracket: "16-17" | "18-24" | "25-35" | "36+";
  has_medical_certificate: "yes" | "no" | "unknown";
  gearbox_preference: "manual" | "automatic" | "undecided";
  city_id: string;
  computed_steps: Array<{ step_id: string; price_eur: number; duration_label: string }>;
  computed_total_eur: number;
  computed_deadline: string; // ISO date, "экзамен вождения до 3 лет с зачисления"
  is_estimated_fallback: boolean; // true, если city_id не нашёлся в cost_model и сумма — усреднение по Латвии (docs/06-tools/vizard-tvoj-put.md, edge cases)
}

interface UserState {
  user_id: string | null;         // null = анонимная сессия, только localStorage
  phase:
    | "choosing-school"
    | "learning-theory"
    | "driving-with-instructor"
    | "preparing-exam"
    | "failed-exam"
    | "got-license";
  wizard_result: WizardResult | null;
  saved_path_email: string | null;   // ступень 3 лестницы микроконверсий, опционально
  theory_progress: Array<{ question_id: string; correct: boolean; answered_at: string }>;
  tracker_lessons: Array<{
    date: string;
    instructor_id: string | null;
    duration_min: number;
    skill_tags: string[];
  }>;
  deadlines: Array<{ label: string; due_date: string }>;
  push_opt_in: boolean;
  updated_at: string;
}
```

- **Откуда:** действия самого пользователя (визард, тренажёр, трекер).
  `user_id: null` до ступени 7 лестницы микроконверсий (см.
  docs/08-analytics.md) — хранится в `localStorage`, не в Supabase.
  С момента создания account (ступень 7) синхронизируется в Supabase
  `user_state` с RLS-политикой `user_id = auth.uid()`.
- **Как часто обновляется:** в реальном времени, на каждое действие
  пользователя.
- **Владелец:** нет — управляется самим пользователем через продукт.
- **При отсутствии данных:** свежий анонимный `UserState` со всеми полями
  `null`/`[]` — это не «ошибка», а нормальное стартовое состояние.

## 8. `cost_model` — коэффициенты калькулятора

```ts
interface CostModelCoefficients {
  city_id: string;
  gearbox: "manual" | "automatic";
  scenario: "optimist" | "realist" | "pessimist";
  school_fee_eur: number;
  practice_fee_eur: number;
  csdd_fee_eur: number;
  medical_fee_eur: number;
  is_estimated_fallback: boolean;  // true если для этого города нет точных данных
                                    // и используется усреднённое по Латвии значение
  updated_at: string;
}

interface CostModelFile {
  updated_at: string;
  source: "market-research" | "partner-data";
  coefficients: CostModelCoefficients[];
}
```

- **Откуда:** рыночное исследование цен (Data Ops собирает цены школ вручную
  раз в квартал) + `partner_price_eur` из `schools` для строки конкретного
  партнёра (FORS) в калькуляторе.
- **Как часто обновляется:** ежеквартально по рынку; немедленно при смене
  партнёрской цены.
- **Владелец:** Product/аналитик, отвечающий за честность калькулятора.
- **При отсутствии данных:** если для города нет собственных коэффициентов —
  используются усреднённые по Латвии значения с `is_estimated_fallback: true`,
  и калькулятор показывает пометку «Точных данных по {город} пока нет,
  показана оценка по Латвии в среднем» — никогда не подставляет цифры Риги
  молча под другой город.

---

## Фикстуры

Все восемь файлов лежат в `/fixtures/` в корне репозитория и валидны по
типам выше. Значения взяты из чисел, уже приведённых в прототипах Модуля 7
(Экраны 2, 3, 5), чтобы фикстуры были правдоподобны, а не случайны.

| Файл | Соответствует типу |
|---|---|
| `fixtures/csdd_tariffs.json` | `CsddTariffsFile` |
| `fixtures/schools.json` | `SchoolsFile` |
| `fixtures/instructors.json` | `InstructorsFile` |
| `fixtures/ratings.json` | `RatingsFile` |
| `fixtures/exam_zones.json` | `ExamZonesFile` |
| `fixtures/theory_questions.json` | `TheoryQuestionsFile` |
| `fixtures/user_state.json` | `UserState` (пример анонимной сессии после визарда) |
| `fixtures/cost_model.json` | `CostModelFile` |

Definition of Done для Ф0-задачи «типы данных» (см. docs/11-backlog.md):
`tsc --noEmit` проходит на всех типах, все фикстуры проходят валидацию через
соответствующую Zod-схему в тесте `fixtures.spec.ts`.
