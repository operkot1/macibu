import { useEffect, useState } from "react";
import { buildDailySession } from "../../../lib/trainer/buildDailySession";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { TheoryQuestion } from "../../../types/data";

/*
 * Trainer — тренажёр теории MVP (docs/06-tools/trenazhyor-teorii.md,
 * T-046). Состояния: intro → in-progress (по вопросу: default → answered)
 * → session-complete | category-empty | exhausted-today.
 *
 * `exhausted-today` — состояние, которого нет дословно в контракте (там
 * только "0 вопросов для категории" = category-empty), но которое реально
 * достижимо: banка 25 вопросов, buildDailySession может вернуть [] и
 * когда категория ЕСТЬ, но весь сегодняшний пул уже пройден. Это не то
 * же самое, что "раздел не готов" — честно другой текст, не переиспользую
 * category-empty для другого смысла.
 *
 * SSR и первый клиентский рендер — всегда "intro" (localStorage недоступен
 * при SSR); реальное чтение/резюме сессии — в useEffect после маунта, тот
 * же принцип, что фикс гидратации CookieBanner (T-022) и
 * StepListInteractive (T-036).
 *
 * CTA «Перейти к симулятору полного экзамена» из контракта не показан —
 * контракт сам обуславливает его "если он уже в проде" (p2-teorija-rezims,
 * Ф2, не построен).
 */

export interface TrainerProps {
  questions: TheoryQuestion[];
  category: string;
  currentLocale: "lv" | "ru";
}

type Stage =
  | "intro"
  | "in-progress"
  | "session-complete"
  | "category-empty"
  | "exhausted-today";

interface Answer {
  optionId: string;
  correct: boolean;
}

interface PersistedSession {
  sessionIds: string[];
  answers: Record<string, Answer>;
  currentIndex: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function seenStorageKey(date: string): string {
  return `portal:trainer:seen:${date}`;
}

function sessionStorageKey(date: string): string {
  return `portal:trainer:session:${date}`;
}

function readSeenToday(date: string): string[] {
  try {
    const raw = window.localStorage.getItem(seenStorageKey(date));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function addSeenToday(date: string, questionId: string): void {
  const seen = readSeenToday(date);
  if (!seen.includes(questionId)) {
    seen.push(questionId);
    window.localStorage.setItem(seenStorageKey(date), JSON.stringify(seen));
  }
}

function readPersistedSession(date: string): PersistedSession | null {
  try {
    const raw = window.localStorage.getItem(sessionStorageKey(date));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function writePersistedSession(date: string, session: PersistedSession): void {
  window.localStorage.setItem(sessionStorageKey(date), JSON.stringify(session));
}

function clearPersistedSession(date: string): void {
  window.localStorage.removeItem(sessionStorageKey(date));
}

const text = {
  lv: {
    introTitle: "Teorijas trenažieris",
    introBody:
      "20 jautājumi dienā, tuvi reālajam eksāmenam. Bez reģistrācijas.",
    start: "Sākt bez reģistrācijas",
    progress: (current: number, total: number) => `${current}/${total}`,
    availableToday: (n: number) => `Šodien pieejami ${n} jautājumi`,
    correct: "Pareizi!",
    incorrect: "Nepareizi",
    next: "Tālāk",
    finish: "Pabeigt",
    scoreTitle: "Sesija pabeigta",
    scoreBody: (score: number, total: number) => `Rezultāts: ${score}/${total}`,
    again: "Vēlreiz",
    categoryEmptyTitle: "Šī sadaļa vēl nav gatava",
    categoryEmptyBody: "Pieejams kategorijai B.",
    exhaustedTitle: "Šodien viss izpildīts",
    exhaustedBody:
      "Visi šodien pieejamie jautājumi jau ir izmantoti. Atgriezies rīt.",
  },
  ru: {
    introTitle: "Тренажёр теории",
    introBody:
      "20 вопросов в день, максимально близко к реальному экзамену. Без регистрации.",
    start: "Начать без регистрации",
    progress: (current: number, total: number) => `${current}/${total}`,
    availableToday: (n: number) => `Сегодня доступно ${n} вопросов`,
    correct: "Верно!",
    incorrect: "Неверно",
    next: "Далее",
    finish: "Завершить",
    scoreTitle: "Сессия завершена",
    scoreBody: (score: number, total: number) => `Результат: ${score}/${total}`,
    again: "Ещё раз",
    categoryEmptyTitle: "Этот раздел ещё не готов",
    categoryEmptyBody: "Доступно для категории B.",
    exhaustedTitle: "На сегодня всё пройдено",
    exhaustedBody:
      "Все доступные на сегодня вопросы уже использованы. Возвращайся завтра.",
  },
} as const;

export default function Trainer({
  questions,
  category,
  currentLocale,
}: TrainerProps) {
  const t = text[currentLocale];
  const [stage, setStage] = useState<Stage>("intro");
  const [session, setSession] = useState<TheoryQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [totalAvailableToday, setTotalAvailableToday] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const date = todayKey();
    const persisted = readPersistedSession(date);
    if (!persisted || persisted.sessionIds.length === 0) return;
    const bySessionId = new Map(questions.map((q) => [q.id, q]));
    const resumedSession = persisted.sessionIds
      .map((id) => bySessionId.get(id))
      .filter((q): q is TheoryQuestion => q !== undefined);
    if (resumedSession.length !== persisted.sessionIds.length) return;
    setSession(resumedSession);
    setAnswers(persisted.answers);
    setCurrentIndex(persisted.currentIndex);
    setStage("in-progress");
  }, []);

  function startSession() {
    const date = todayKey();
    const categoryPoolSize = questions.filter((q) =>
      q.categories.includes(category),
    ).length;
    if (categoryPoolSize === 0) {
      trackEvent("trainer_category_unavailable", { category });
      setStage("category-empty");
      return;
    }
    const seenToday = readSeenToday(date);
    const newSession = buildDailySession(questions, category, seenToday);
    if (newSession.length === 0) {
      setStage("exhausted-today");
      return;
    }
    setSession(newSession);
    setAnswers({});
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setTotalAvailableToday(newSession.length);
    setStage("in-progress");
    writePersistedSession(date, {
      sessionIds: newSession.map((q) => q.id),
      answers: {},
      currentIndex: 0,
    });
    trackEvent("trainer_started", { category });
  }

  function answer(question: TheoryQuestion, optionId: string) {
    if (selectedOptionId !== null) return;
    const option = question.options.find((o) => o.id === optionId);
    const correct = option?.is_correct ?? false;
    const date = todayKey();
    const nextAnswers = { ...answers, [question.id]: { optionId, correct } };
    setSelectedOptionId(optionId);
    setAnswers(nextAnswers);
    addSeenToday(date, question.id);
    writePersistedSession(date, {
      sessionIds: session.map((q) => q.id),
      answers: nextAnswers,
      currentIndex,
    });
    trackEvent("trainer_question_answered", {
      question_id: question.id,
      correct,
    });
  }

  function goNext() {
    const date = todayKey();
    if (currentIndex + 1 < session.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedOptionId(null);
      writePersistedSession(date, {
        sessionIds: session.map((q) => q.id),
        answers,
        currentIndex: nextIndex,
      });
      return;
    }
    const score = Object.values(answers).filter((a) => a.correct).length;
    clearPersistedSession(date);
    trackEvent("trainer_session_completed", {
      score,
      total: session.length,
      category,
    });
    setStage("session-complete");
  }

  if (stage === "intro") {
    return (
      <div>
        <h2 className="text-h2 text-neutral-900 mb-2">{t.introTitle}</h2>
        <p className="text-body text-neutral-600 mb-4">{t.introBody}</p>
        <button
          type="button"
          onClick={startSession}
          className="bg-primary-600 rounded-md p-3 px-4 text-white"
        >
          {t.start}
        </button>
      </div>
    );
  }

  if (stage === "category-empty") {
    return (
      <div className="bg-warning-100 text-warning-600 rounded-md p-4">
        <p className="text-body-sm font-bold">{t.categoryEmptyTitle}</p>
        <p className="text-body-sm">{t.categoryEmptyBody}</p>
      </div>
    );
  }

  if (stage === "exhausted-today") {
    return (
      <div className="bg-success-100 text-success-600 rounded-md p-4">
        <p className="text-body-sm font-bold">{t.exhaustedTitle}</p>
        <p className="text-body-sm">{t.exhaustedBody}</p>
      </div>
    );
  }

  if (stage === "session-complete") {
    const score = Object.values(answers).filter((a) => a.correct).length;
    return (
      <div>
        <h2 className="text-h2 text-neutral-900 mb-2">{t.scoreTitle}</h2>
        <p className="text-numeric text-neutral-900 mb-4 tabular-nums">
          {t.scoreBody(score, session.length)}
        </p>
        <button
          type="button"
          onClick={startSession}
          className="bg-primary-600 rounded-md p-3 px-4 text-white"
        >
          {t.again}
        </button>
      </div>
    );
  }

  const question = session[currentIndex];
  if (!question) return null;
  const isLast = currentIndex + 1 >= session.length;
  const answered = selectedOptionId !== null;
  const questionText =
    currentLocale === "lv" ? question.text_lv : question.text_ru;
  const explanationText =
    currentLocale === "lv" ? question.explanation_lv : question.explanation_ru;

  return (
    <div>
      <p className="text-body-sm text-neutral-600 mb-2">
        {t.progress(currentIndex + 1, session.length)}
      </p>
      {totalAvailableToday !== null && totalAvailableToday < 20 && (
        <p className="text-body-sm text-neutral-600 mb-4">
          {t.availableToday(totalAvailableToday)}
        </p>
      )}
      <h2 className="text-h3 text-neutral-900 mb-4">{questionText}</h2>
      <fieldset className="mb-4 flex flex-col gap-2">
        {question.options.map((option) => {
          const optionText =
            currentLocale === "lv" ? option.text_lv : option.text_ru;
          let stateClass =
            "border-neutral-300 hover:bg-neutral-100 text-neutral-900";
          if (answered) {
            if (option.id === selectedOptionId && option.is_correct) {
              stateClass = "border-success-600 bg-success-100 text-success-600";
            } else if (option.id === selectedOptionId && !option.is_correct) {
              stateClass = "border-danger-600 bg-danger-100 text-danger-600";
            } else if (option.is_correct) {
              stateClass = "border-success-600 bg-success-100 text-success-600";
            } else {
              stateClass = "border-neutral-300 text-neutral-600";
            }
          }
          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => answer(question, option.id)}
              className={`text-body focus-visible:ring-focus-ring rounded-md border p-3 text-left focus-visible:ring-2 ${stateClass}`}
            >
              {optionText}
            </button>
          );
        })}
      </fieldset>
      {answered && (
        <div className="mb-4">
          <p className="text-body-sm mb-2 font-bold">
            {answers[question.id]?.correct ? t.correct : t.incorrect}
          </p>
          <p className="text-body-sm text-neutral-600">{explanationText}</p>
        </div>
      )}
      {answered && (
        <button
          type="button"
          onClick={goNext}
          className="bg-primary-600 rounded-md p-3 px-4 text-white"
        >
          {isLast ? t.finish : t.next}
        </button>
      )}
    </div>
  );
}
