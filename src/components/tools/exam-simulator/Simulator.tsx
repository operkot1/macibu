import { useEffect, useRef, useState } from "react";
import {
  EXAM_MAX_ERRORS,
  EXAM_QUESTION_COUNT,
  EXAM_TIME_LIMIT_MIN,
  buildExamSession,
  evaluateSimulation,
  getRemainingSeconds,
  hasSufficientQuestionBank,
  type SimulationAnswer,
  type SimulationResult,
} from "../../../lib/simulator/evaluateSimulation";
import { trackEvent } from "../../../lib/analytics/trackEvent";
import type { TheoryQuestion } from "../../../types/data";

/*
 * Simulator — полноразмерная имитация теоретического экзамена
 * (docs/06-tools/simulyator-ekzamena.md, T-066). В отличие от Trainer.tsx
 * (Ф1, свободная тренировка с немедленной обратной связью), здесь по
 * реальному источнику (csdd.lv) ошибки видны только в конце («Noslēdzoties
 * eksāmenam, kļūdas tiks parādītas datora monitorā») — поэтому выбор
 * варианта сразу переходит к следующему вопросу, без объяснения.
 *
 * Реальный банк категории B — 25 вопросов < EXAM_QUESTION_COUNT (30,
 * T-065) — `insufficient-question-bank` заменяет `rules-intro` целиком,
 * не предлагая заведомо нечестную симуляцию с повторами вопросов.
 *
 * Поведение при истечении таймера — реальный источник не описывает
 * буквально, что происходит с неотвеченными вопросами при таймауте;
 * решено считать их ошибками (симметрично тому, что незавершённый
 * реальный экзамен не защитан) — не выдумывание факта, а естественное
 * доопределение поведения инструмента, честно раскрытое здесь и в
 * docs/11-backlog.md (T-066).
 *
 * Не сохраняем сессию в localStorage между перезагрузками (в отличие от
 * Trainer) — контракт явно требует: закрытие вкладки посреди симуляции
 * не засчитывается, начинается заново, чтобы не исказить статистику
 * "сдал/не сдал".
 */

export interface SimulatorProps {
  questions: TheoryQuestion[];
  category: string;
  currentLocale: "lv" | "ru";
}

type Stage = "rules-intro" | "in-progress" | "result-passed" | "result-failed";

const text = {
  lv: {
    introTitle: "Eksāmena režīms",
    introBody: (n: number, min: number, errors: number) =>
      `Pilna eksāmena imitācija: ${n} jautājumi, ${min} minūtes, pieļaujamas ne vairāk kā ${errors} kļūdas. Atbildes redzēsi tikai beigās — tāpat kā reālajā eksāmenā.`,
    start: "Sākt eksāmena režīmu",
    insufficientTitle: "Eksāmena režīms vēl nav pieejams",
    insufficientBody: (have: number, need: number) =>
      `Šim režīmam nepieciešami vismaz ${need} jautājumi kategorijai B, pašlaik pieejami ${have}. Simulators kļūs pieejams, kad jautājumu banka paaugstināsies.`,
    progress: (current: number, total: number) => `${current}/${total}`,
    timeLeft: (mmss: string) => `Atlicis: ${mmss}`,
    passedTitle: "Eksāmens nokārtots",
    failedTitle: "Eksāmens nav nokārtots",
    resultBody: (errors: number, total: number, max: number) =>
      `Kļūdas: ${errors}/${total} (pieļaujamas ne vairāk kā ${max})`,
    again: "Vēlreiz",
  },
  ru: {
    introTitle: "Режим экзамена",
    introBody: (n: number, min: number, errors: number) =>
      `Полная имитация экзамена: ${n} вопросов, ${min} минут, допустимо не более ${errors} ошибок. Ответы будут видны только в конце — как на настоящем экзамене.`,
    start: "Начать режим экзамена",
    insufficientTitle: "Режим экзамена пока недоступен",
    insufficientBody: (have: number, need: number) =>
      `Для этого режима нужно минимум ${need} вопросов для категории B, сейчас доступно ${have}. Симулятор станет доступен, когда банк вопросов вырастет.`,
    progress: (current: number, total: number) => `${current}/${total}`,
    timeLeft: (mmss: string) => `Осталось: ${mmss}`,
    passedTitle: "Экзамен сдан",
    failedTitle: "Экзамен не сдан",
    resultBody: (errors: number, total: number, max: number) =>
      `Ошибки: ${errors}/${total} (допустимо не более ${max})`,
    again: "Ещё раз",
  },
} as const;

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Simulator({
  questions,
  category,
  currentLocale,
}: SimulatorProps) {
  const t = text[currentLocale];
  const categoryQuestions = questions.filter((q) =>
    q.categories.includes(category),
  );
  const sufficient = hasSufficientQuestionBank(questions, category);

  const [stage, setStage] = useState<Stage>("rules-intro");
  const [session, setSession] = useState<TheoryQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SimulationAnswer[]>([]);
  const [finalResult, setFinalResult] = useState<SimulationResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    EXAM_TIME_LIMIT_MIN * 60,
  );
  const startedAtRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  /*
   * finishSession принимает finalAnswers (может включать неотвеченные
   * вопросы, дополненные при таймауте, — они не попадают в состояние
   * `answers`, только в этот вызов). Результат кладётся в отдельный
   * `finalResult`, а не пересчитывается на экране из `answers` — иначе
   * при таймауте с недоотвеченными вопросами экран показал бы число
   * ошибок только по реально нажатым ответам, разойдясь с тем, что
   * фактически определило исход "сдал/не сдал" (баг, пойманный живой
   * Playwright-проверкой T-066 при недостающих ответах на таймауте).
   */
  function finishSession(finalAnswers: SimulationAnswer[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const result = evaluateSimulation(finalAnswers);
    const durationSec = startedAtRef.current
      ? Math.floor((Date.now() - startedAtRef.current) / 1000)
      : null;
    trackEvent("simulator_completed", {
      passed: result.passed,
      errors_count: result.errors_count,
      duration_sec: durationSec,
      category,
    });
    setFinalResult(result);
    setStage(result.passed ? "result-passed" : "result-failed");
  }

  useEffect(() => {
    if (stage !== "in-progress") return;
    const interval = setInterval(() => {
      if (!startedAtRef.current) return;
      const left = getRemainingSeconds(
        startedAtRef.current,
        Date.now(),
        EXAM_TIME_LIMIT_MIN,
      );
      setRemainingSeconds(left);
      if (left === 0) {
        const unanswered = session
          .slice(answers.length)
          .map((q): SimulationAnswer => ({
            question_id: q.id,
            correct: false,
          }));
        finishSession([...answers, ...unanswered]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, answers, session]);

  if (!sufficient) {
    return (
      <div className="bg-warning-100 text-warning-600 rounded-md p-4">
        <p className="text-body-sm mb-1 font-bold">{t.insufficientTitle}</p>
        <p className="text-body-sm">
          {t.insufficientBody(categoryQuestions.length, EXAM_QUESTION_COUNT)}
        </p>
      </div>
    );
  }

  if (stage === "rules-intro") {
    return (
      <div>
        <h2 className="text-h2 text-neutral-900 mb-2">{t.introTitle}</h2>
        <p className="text-body text-neutral-600 mb-4">
          {t.introBody(
            EXAM_QUESTION_COUNT,
            EXAM_TIME_LIMIT_MIN,
            EXAM_MAX_ERRORS,
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            const newSession = buildExamSession(questions, category);
            startedAtRef.current = Date.now();
            submittedRef.current = false;
            setSession(newSession);
            setAnswers([]);
            setFinalResult(null);
            setCurrentIndex(0);
            setRemainingSeconds(EXAM_TIME_LIMIT_MIN * 60);
            setStage("in-progress");
            trackEvent("simulator_started", { category });
          }}
          className="bg-primary-600 rounded-md p-3 px-4 text-white"
        >
          {t.start}
        </button>
      </div>
    );
  }

  if ((stage === "result-passed" || stage === "result-failed") && finalResult) {
    return (
      <div>
        <h2 className="text-h2 text-neutral-900 mb-2">
          {stage === "result-passed" ? t.passedTitle : t.failedTitle}
        </h2>
        <p className="text-numeric text-neutral-900 mb-4 tabular-nums">
          {t.resultBody(
            finalResult.errors_count,
            finalResult.total,
            EXAM_MAX_ERRORS,
          )}
        </p>
        <button
          type="button"
          onClick={() => setStage("rules-intro")}
          className="bg-primary-600 rounded-md p-3 px-4 text-white"
        >
          {t.again}
        </button>
      </div>
    );
  }

  const question = session[currentIndex];
  if (!question) return null;
  const questionText =
    currentLocale === "lv" ? question.text_lv : question.text_ru;

  function selectOption(optionId: string) {
    const option = question.options.find((o) => o.id === optionId);
    const correct = option?.is_correct ?? false;
    const nextAnswers = [...answers, { question_id: question.id, correct }];
    setAnswers(nextAnswers);
    if (currentIndex + 1 >= session.length) {
      finishSession(nextAnswers);
      return;
    }
    setCurrentIndex(currentIndex + 1);
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-body-sm text-neutral-600">
          {t.progress(currentIndex + 1, session.length)}
        </p>
        <p className="text-body-sm tabular-nums text-neutral-600">
          {t.timeLeft(formatMmSs(remainingSeconds))}
        </p>
      </div>
      <h2 className="text-h3 text-neutral-900 mb-4">{questionText}</h2>
      <fieldset className="mb-4 flex flex-col gap-2">
        {question.options.map((option) => {
          const optionText =
            currentLocale === "lv" ? option.text_lv : option.text_ru;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option.id)}
              className="border-neutral-300 hover:bg-neutral-100 text-body text-neutral-900 focus-visible:ring-focus-ring rounded-md border p-3 text-left focus-visible:ring-2"
            >
              {optionText}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
