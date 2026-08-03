import { map } from "nanostores";
import type { UserState } from "../../types/data";

/*
 * PhaseBar — docs/05-components.md §1. Тип фазы переиспользует
 * UserState["phase"] (docs/03-data-model.md), не заводит второй параллельный
 * словарь. Персистентность (аноним) — localStorage['portal:phase'].
 * Ф4 (аккаунт) добавит синхронизацию в Supabase поверх этого же store —
 * не в скоупе этой задачи.
 */

export type PhaseValue = UserState["phase"];

interface PhaseState {
  value: PhaseValue | null;
  updatedAt: string | null;
}

const STORAGE_KEY = "portal:phase";

export const phaseStore = map<PhaseState>({
  value: null,
  updatedAt: null,
});

export function getPhase(): PhaseValue | null {
  return phaseStore.get().value;
}

export function setPhase(value: PhaseValue): void {
  const updatedAt = new Date().toISOString();
  phaseStore.set({ value, updatedAt });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, updatedAt }));
  }
}

function isPhaseValue(candidate: unknown): candidate is PhaseValue {
  return (
    typeof candidate === "string" &&
    (
      [
        "choosing-school",
        "learning-theory",
        "driving-with-instructor",
        "preparing-exam",
        "failed-exam",
        "got-license",
      ] as const
    ).includes(candidate as PhaseValue)
  );
}

function initFromStorage(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "value" in parsed &&
      isPhaseValue((parsed as { value: unknown }).value)
    ) {
      const updatedAt =
        "updatedAt" in parsed &&
        typeof (parsed as { updatedAt: unknown }).updatedAt === "string"
          ? (parsed as { updatedAt: string }).updatedAt
          : null;
      phaseStore.set({
        value: (parsed as { value: PhaseValue }).value,
        updatedAt,
      });
    }
  } catch {
    // Испорченный JSON в localStorage — остаёмся в дефолтном состоянии,
    // не роняем страницу.
  }
}

// Синхронно на уровне модуля — до первого рендера PhaseBar.tsx, чтобы
// первый клиентский рендер уже был корректным (без ре-рендера после
// гидратации). Не устраняет зазор SSR-HTML → гидратация целиком — это
// архитектурное свойство островов, см. docs/05-components.md §1.
initFromStorage();
