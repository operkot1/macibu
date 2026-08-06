/*
 * trackWizardEvent — единая точка интеграции для всех событий визарда из
 * docs/06-tools/vizard-tvoj-put.md §Аналитика (wizard_started,
 * wizard_step_completed, wizard_completed, wizard_path_saved,
 * wizard_share_link_copied). Все они — Слой Б (docs/08-analytics.md §1),
 * которого пока нет: нет ни consent-механизма, ни приёмника. Это
 * намеренный no-op, тот же честный паттерн, что AnalyticsLayerA.astro
 * (T-021, Слой А) — не притворяется, что событие куда-то уходит.
 */

export type WizardEventName =
  | "wizard_started"
  | "wizard_step_completed"
  | "wizard_completed"
  | "wizard_path_saved"
  | "wizard_share_link_copied";

export function trackWizardEvent(
  name: WizardEventName,
  params: Record<string, unknown> = {},
): void {
  void name;
  void params;
}
