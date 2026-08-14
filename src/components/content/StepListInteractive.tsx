import { useEffect, useState } from "react";

/*
 * StepListInteractive — docs/05-components.md §3, ветка `interactive: true`
 * `StepList`, T-036. Прогресс должен писаться в `user_state`
 * (docs/02-routes.md, строка `p1-soli-pa-solim`), но там нет ни поля под
 * это (`UserState` в docs/03 такого не содержит — тот же пробел, что уже
 * решался в T-031 для `saved_path_email`), ни бэкенда (Supabase — Ф4).
 * Пишем в localStorage под ключом, специфичным для конкретного чек-листа
 * (`checklistId`) — узко, честно, без выдумывания несуществующего поля.
 *
 * Чекбокс — настоящий `<input type="checkbox">`, скрыт `sr-only`, видимый
 * бейдж — `<label>` рядом (тот же peer/sr-only приём, что уже используется
 * в Header.astro для мобильного меню, T-013) — нативная клавиатурная/
 * скринридер-доступность без ручной ARIA-разметки чекбокса.
 *
 * `loading`-состояние (докс §3): прогресс живёт в localStorage, недоступен
 * при SSR/первом клиентском рендере — тот же принцип, что фикс гидратации
 * CookieBanner (T-022): SSR и первый клиентский рендер обязаны совпадать
 * (оба — skeleton), реальное чтение — в useEffect после маунта.
 */

export interface StepListInteractiveStep {
  index: number;
  title: string;
  priceEur?: number;
  durationLabel?: string;
  note?: string; // короткая практическая подсказка (T-084, второй потребитель — pirmie-10-braucieni)
}

export interface StepListInteractiveProps {
  checklistId: string;
  steps: StepListInteractiveStep[];
}

function storageKey(checklistId: string): string {
  return `portal:checklist:${checklistId}`;
}

function readDoneIndices(checklistId: string): Set<number> {
  try {
    const raw = window.localStorage.getItem(storageKey(checklistId));
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? (parsed as number[]) : []);
  } catch {
    return new Set();
  }
}

function writeDoneIndices(checklistId: string, done: Set<number>): void {
  window.localStorage.setItem(
    storageKey(checklistId),
    JSON.stringify(Array.from(done)),
  );
}

function formatPrice(priceEur: number): string {
  return `${priceEur.toLocaleString("lv-LV", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

function SkeletonList({ count }: { count: number }) {
  return (
    <ol className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="border-neutral-300 flex items-center gap-3 rounded-md border p-3"
        >
          <span className="bg-neutral-100 h-8 w-8 shrink-0 animate-pulse rounded-full" />
          <span className="bg-neutral-100 h-4 flex-1 animate-pulse rounded" />
        </li>
      ))}
    </ol>
  );
}

export default function StepListInteractive({
  checklistId,
  steps,
}: StepListInteractiveProps) {
  const [loaded, setLoaded] = useState(false);
  const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    setDoneIndices(readDoneIndices(checklistId));
    setLoaded(true);
  }, [checklistId]);

  function toggle(index: number) {
    setDoneIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      writeDoneIndices(checklistId, next);
      return next;
    });
  }

  if (!loaded) {
    return <SkeletonList count={steps.length} />;
  }

  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step) => {
        const isDone = doneIndices.has(step.index);
        const inputId = `step-${checklistId}-${step.index}`;
        return (
          <li
            key={step.index}
            className="border-neutral-300 flex items-center gap-3 rounded-md border p-3"
          >
            <input
              type="checkbox"
              id={inputId}
              checked={isDone}
              onChange={() => toggle(step.index)}
              className="peer sr-only"
            />
            <label
              htmlFor={inputId}
              className={`text-body-sm focus-visible:ring-focus-ring peer-focus-visible:ring-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full font-bold ${
                isDone
                  ? "bg-success-100 text-success-600"
                  : "bg-neutral-100 text-neutral-900"
              }`}
            >
              {isDone ? "✓" : step.index}
            </label>
            <label
              htmlFor={inputId}
              className={`text-body flex-1 cursor-pointer ${
                isDone ? "text-neutral-600 line-through" : "text-neutral-900"
              }`}
            >
              {step.title}
              {step.note && (
                <span className="text-body-sm text-neutral-600 mt-0.5 block">
                  {step.note}
                </span>
              )}
            </label>
            {step.durationLabel && (
              <span className="text-body-sm text-neutral-600">
                {step.durationLabel}
              </span>
            )}
            {step.priceEur !== undefined && (
              <span className="text-numeric text-neutral-900 tabular-nums">
                {formatPrice(step.priceEur)}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
