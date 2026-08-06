import { useState } from "react";
import WizardSteps from "./WizardSteps";
import WizardResult from "./WizardResult";
import SavePathButton from "./SavePathButton";
import {
  computeWizardPath,
  type WizardInput,
} from "../../../lib/wizard/computeWizardPath";
import type {
  CsddTariff,
  CostModelCoefficients,
  WizardResult as WizardResultData,
} from "../../../types/data";

/*
 * Wizard — единственный остров инструмента `wizard` (T-032), собирает
 * WizardSteps (T-029) → WizardResult (T-030) → SavePathButton (T-031) в
 * один hydration boundary. `computing` — обязательный отдельный кадр
 * между шагом 4 и результатом (docs/06-tools/vizard-tvoj-put.md
 * «Состояния»: без него результат «моргает»); скелетон повторяет
 * геометрию карточек результата, не спиннер (docs/04-design-system.md §5,
 * правило loading-состояния).
 */

export interface WizardProps {
  tariffs: CsddTariff[];
  cost: CostModelCoefficients[];
  currentLocale: "lv" | "ru";
}

type Stage = "steps" | "computing" | "result";

const COMPUTING_MIN_MS = 300;

function ResultSkeleton() {
  return (
    <ol className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <li
          key={i}
          className="border-neutral-300 flex items-center gap-3 rounded-md border p-3"
        >
          <span className="bg-neutral-100 h-8 w-8 shrink-0 animate-pulse rounded-full" />
          <span className="bg-neutral-100 h-4 flex-1 animate-pulse rounded" />
          <span className="bg-neutral-100 h-4 w-12 animate-pulse rounded" />
        </li>
      ))}
    </ol>
  );
}

export default function Wizard({ tariffs, cost, currentLocale }: WizardProps) {
  const [stage, setStage] = useState<Stage>("steps");
  const [result, setResult] = useState<WizardResultData | null>(null);

  function handleComplete(input: WizardInput) {
    setStage("computing");
    const computed = computeWizardPath(input, tariffs, cost);
    setTimeout(() => {
      setResult(computed);
      setStage("result");
    }, COMPUTING_MIN_MS);
  }

  return (
    <div aria-live="polite">
      {stage === "steps" && (
        <WizardSteps
          currentLocale={currentLocale}
          onComplete={handleComplete}
        />
      )}
      {stage === "computing" && <ResultSkeleton />}
      {stage === "result" && result && (
        <div>
          <WizardResult result={result} currentLocale={currentLocale} />
          <div className="mt-6">
            <SavePathButton
              wizardInput={{
                age_bracket: result.age_bracket,
                has_medical_certificate: result.has_medical_certificate,
                gearbox_preference: result.gearbox_preference,
                city_id: result.city_id,
              }}
              currentLocale={currentLocale}
            />
          </div>
        </div>
      )}
    </div>
  );
}
