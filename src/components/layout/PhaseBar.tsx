import { useStore } from "@nanostores/react";
import { phaseStore, setPhase, type PhaseValue } from "../../lib/state/phase";

// PhaseBar — docs/05-components.md §1. Первый остров в проекте.

export interface PhaseBarProps {
  variant: "sticky-mobile" | "inline-desktop";
  currentLocale: "lv" | "ru";
}

const PHASES: Array<{
  value: PhaseValue;
  label: { lv: string; ru: string };
}> = [
  {
    value: "choosing-school",
    label: { lv: "Izvēlos skolu", ru: "Выбираю школу" },
  },
  {
    value: "learning-theory",
    label: { lv: "Mācos teoriju", ru: "Учу теорию" },
  },
  {
    value: "driving-with-instructor",
    label: { lv: "Braucu ar instruktoru", ru: "Езжу с инструктором" },
  },
  {
    value: "preparing-exam",
    label: { lv: "Gatavojos eksāmenam", ru: "Готовлюсь к экзамену" },
  },
  { value: "failed-exam", label: { lv: "Nenokārtoju", ru: "Не сдал" } },
  {
    value: "got-license",
    label: { lv: "Ieguvu tiesības", ru: "Получил права" },
  },
];

export default function PhaseBar({ variant, currentLocale }: PhaseBarProps) {
  const state = useStore(phaseStore);

  const containerClass =
    variant === "sticky-mobile"
      ? "sticky top-0 z-10 bg-neutral-0 border-b border-neutral-300 md:hidden"
      : "hidden md:block bg-neutral-0 border-b border-neutral-300";

  return (
    <div className={containerClass}>
      <ul className="flex gap-2 overflow-x-auto p-2">
        {PHASES.map((phase) => {
          const isActive = state.value === phase.value;
          return (
            <li key={phase.value}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => setPhase(phase.value)}
                className={
                  "text-body-sm focus-visible:ring-focus-ring whitespace-nowrap rounded-md px-3 py-2 focus-visible:ring-2 " +
                  (isActive
                    ? "bg-primary-100 text-primary-700 font-bold"
                    : "text-neutral-900 hover:bg-neutral-100")
                }
              >
                {phase.label[currentLocale]}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
