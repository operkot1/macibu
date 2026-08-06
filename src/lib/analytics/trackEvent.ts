/*
 * trackEvent — единая точка интеграции для событий Слоя Б
 * (docs/08-analytics.md §1, §2) для всех инструментов-островов
 * (визард, калькулятор, ...). Слоя Б пока нет: нет ни
 * consent-механизма, ни приёмника. Намеренный no-op, тот же честный
 * паттерн, что AnalyticsLayerA.astro (T-021, Слой А) — не притворяется,
 * что событие куда-то уходит.
 *
 * Раньше — `lib/wizard/trackWizardEvent.ts`, специфичный для визарда;
 * обобщён в T-034, когда калькулятору понадобились свои события и
 * третья копия того же no-op стала бы дублированием.
 */

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  void name;
  void params;
}
