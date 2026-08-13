/*
 * Типы данных проекта. Источник правды — docs/03-data-model.md, каждый тип
 * здесь скопирован из соответствующего раздела документа буквально. Любое
 * изменение типа начинается правкой docs/03-data-model.md, не наоборот.
 */

// 1. `csdd_tariffs` — тарифы CSDD

export interface CsddTariff {
  id: string; // "medical-certificate" | "white-license" | "theory-course" | ...
  category: string; // код категории прав ("B") или "all"
  name_lv: string;
  name_ru: string;
  price_eur: number;
  unit: "per-attempt" | "one-time" | "per-year";
  effective_from: string; // ISO-8601 date
  source_document: string; // ссылка/номер официального документа CSDD
}

export interface CsddTariffsFile {
  updated_at: string; // ISO-8601, когда загружена текущая выгрузка
  source: "csdd-export-xlsx";
  source_file_ref: string; // имя/хэш загруженного файла — для аудита
  tariffs: CsddTariff[];
}

// 2. `schools` — каталог автошкол

export interface School {
  id: string;
  slug: string; // общий слаг LV/RU, напр. "fors"
  name: string;
  city_id: string; // слаг города, общий на LV/RU
  address: string;
  csdd_registration_number: string; // официальный рег. номер CSDD
  languages: Array<"lv" | "ru" | "en">;
  gearbox: Array<"manual" | "automatic">;
  categories: string[]; // ["B"], ["B", "A"], ...
  is_partner: boolean; // определяет наличие кнопки "Записаться"
  partner_price_eur: number | null; // цена известна только если is_partner
  // и школа её предоставила
  phone: string | null;
  contact_email: string | null;
  website: string | null;
  data_available_for_rating: boolean; // есть ли статистика CSDD для рейтинга
}

export interface SchoolsFile {
  updated_at: string;
  source: "csdd-export-xlsx" | "partner-onboarding-form";
  schools: School[];
}

// 3. `instructors` — инструкторы и статистика сдач

export interface Instructor {
  id: string;
  full_name: string;
  school_id: string; // FK → School.id
  city_id: string;
  languages: Array<"lv" | "ru" | "en">;
  gearbox: Array<"manual" | "automatic">;
  exam_attempts_total: number; // знаменатель выборки
  exam_passes_total: number; // числитель
  sample_period_from: string; // ISO date
  sample_period_to: string;
}

export interface InstructorsFile {
  updated_at: string;
  source: "csdd-export-xlsx";
  instructors: Instructor[];
}

// 4. `ratings` — рассчитанный рейтинг + размер выборки

export interface RatingEntry {
  subject_type: "school" | "instructor";
  subject_id: string; // FK → School.id | Instructor.id
  pass_rate: number; // 0..1, для отображения (честное сырое число)
  sample_size: number; // exam_attempts_total
  confidence: "sufficient" | "limited" | "insufficient";
  rank_score: number; // нижняя граница доверительного интервала — см. формулу в docs/03
  rank: number; // позиция в отсортированном списке по rank_score
  calculated_at: string;
}

export interface RatingsFile {
  updated_at: string;
  methodology_version: string; // семвер методики, см. p3-metodologija
  entries: RatingEntry[];
}

// 5. `exam_zones` — зоны экзамена (UGC)

export interface ExamZone {
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

export interface ExamZonesFile {
  updated_at: string;
  source: "user-generated" | "editorial-seed";
  zones: ExamZone[];
}

// 6. `theory_questions` — банк вопросов тренажёра

export interface TheoryQuestionOption {
  id: string;
  text_lv: string;
  text_ru: string;
  is_correct: boolean;
}

export interface TheoryQuestion {
  id: string;
  categories: string[]; // применимые категории прав, ["B"], ["B","A"]
  text_lv: string;
  text_ru: string;
  media_url: string | null; // для video-jautajumi — ссылка на видео
  options: TheoryQuestionOption[];
  explanation_lv: string;
  explanation_ru: string;
  difficulty: "easy" | "medium" | "hard";
  official_reference: string | null; // номер вопроса в официальном банке CSDD, если известен
}

export interface TheoryQuestionsFile {
  updated_at: string;
  source: "editorial" | "csdd-question-bank";
  questions: TheoryQuestion[];
}

// 7. `user_state` — «где ты сейчас», сохранённый путь, прогресс

export interface WizardResult {
  age_bracket: "16-17" | "18-24" | "25-35" | "36+";
  has_medical_certificate: "yes" | "no" | "unknown";
  gearbox_preference: "manual" | "automatic" | "undecided";
  city_id: string;
  computed_steps: Array<{
    step_id: string;
    price_eur: number;
    duration_label: string;
  }>;
  computed_total_eur: number;
  computed_deadline: string; // ISO date, "экзамен вождения до 3 лет с зачисления"
  is_estimated_fallback: boolean; // true, если city_id не нашёлся в cost_model и сумма — усреднение по Латвии
}

export interface UserState {
  user_id: string | null; // null = анонимная сессия, только localStorage
  phase:
    | "choosing-school"
    | "learning-theory"
    | "driving-with-instructor"
    | "preparing-exam"
    | "failed-exam"
    | "got-license";
  wizard_result: WizardResult | null;
  saved_path_email: string | null; // ступень 3 лестницы микроконверсий, опционально
  theory_progress: Array<{
    question_id: string;
    correct: boolean;
    answered_at: string;
  }>;
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

// 8. `cost_model` — коэффициенты калькулятора

export interface CostModelCoefficients {
  city_id: string;
  gearbox: "manual" | "automatic";
  scenario: "optimist" | "realist" | "pessimist";
  school_fee_eur: number;
  practice_fee_eur: number;
  csdd_fee_eur: number;
  medical_fee_eur: number;
  is_estimated_fallback: boolean; // true если для этого города нет точных данных
  // и используется усреднённое по Латвии значение
  updated_at: string;
}

export interface CostModelFile {
  updated_at: string;
  source: "market-research" | "partner-data";
  coefficients: CostModelCoefficients[];
}

// 9. `csdd_centers` — адреса центров CSDD (T-042)

export interface CsddCenter {
  city_id: string;
  address: string;
  phone: string | null;
}

export interface CsddCentersFile {
  updated_at: string;
  // "placeholder" — честно отражает, что это не реальная выгрузка CSDD
  // (docs/00-assumptions.md, [ДОПУЩЕНИЕ] про адреса центров), а
  // иллюстративные данные до появления настоящего ETL.
  source: "placeholder" | "csdd-export-xlsx";
  centers: CsddCenter[];
}

// 10. `first_aid_providers` — курсы первой помощи (T-070)

export interface FirstAidProvider {
  id: string;
  name: string;
  city_id: string;
  address: string;
  phone: string | null;
  website: string | null;
}

export interface FirstAidProvidersFile {
  updated_at: string;
  // "placeholder" — тот же принцип, что csdd_centers (A-11): реального
  // источника данных нет, адреса заведомо вымышленные.
  source: "placeholder" | "editorial";
  providers: FirstAidProvider[];
}

// 11. `medical_check_locations` — места сдачи медсправки (T-072)

export interface MedicalCheckLocation {
  id: string;
  name: string;
  city_id: string;
  address: string;
  phone: string | null;
  website: string | null;
}

export interface MedicalCheckLocationsFile {
  updated_at: string;
  // "placeholder" — тот же принцип, что first_aid_providers (A-12).
  source: "placeholder" | "editorial";
  locations: MedicalCheckLocation[];
}
