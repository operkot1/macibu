/*
 * deliverLead — доставка лида партнёру (T-078, docs/06-tools/forma-zapisi.md).
 * POST на /api/leads/deliver — тот же паттерн, что AnalyticsLayerA.astro
 * (T-021, /api/beacon/pageview): реального Cloudflare Pages Function-
 * приёмника ещё нет (T-005 отложена), запрос сейчас честно получит 404 —
 * это отдельная будущая задача по инфраструктуре, не блокирует эту.
 * Собственно email/API-транспорт до школы-партнёра происходит на сервере
 * внутри будущей Function, не здесь — секреты/ключи не место в клиентском
 * коде статического сайта.
 *
 * В отличие от AnalyticsLayerA, который сбой молча проглатывает (потеря
 * одного pageview — не событие), здесь сбой лида — событие: результат
 * всегда явно `{ ok: false, ... }`, вызывающий код обязан на него
 * посмотреть (критерий задачи — «сбой доставки не теряет лид молча»).
 *
 * Граница доверия (зафиксировано ревизией T-091): deliverLead сам не
 * проверяет is_partner — доверяет, что `lead.school_id` уже прошёл
 * через matchSchools() (T-077), которая единственная гарантирует, что
 * лид не улетает не-партнёрам (см. leadPipeline.spec.ts). Будущий код
 * реального маршрута (T-079) обязан вызывать deliverLead только с
 * school_id из результата matchSchools, не с произвольным
 * пользовательским/клиентским значением.
 */

export interface Lead {
  school_id: string;
  city_id: string;
  category: string;
  gearbox: "manual" | "automatic";
  language: "lv" | "ru" | "en";
  name: string;
  phone: string;
}

export interface DeliverLeadOptions {
  endpoint?: string;
  maxAttempts?: number;
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
  delayImpl?: (ms: number) => Promise<void>;
  onDeliveryFailure?: (lead: Lead, error: string, attempts: number) => void;
}

export type DeliverLeadResult =
  { ok: true } | { ok: false; error: string; attempts: number };

const DEFAULT_ENDPOINT = "/api/leads/deliver";
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

function defaultDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptDelivery(
  lead: Lead,
  endpoint: string,
  fetchImpl: typeof fetch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      body: JSON.stringify(lead),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function deliverLead(
  lead: Lead,
  options: DeliverLeadOptions = {},
): Promise<DeliverLeadResult> {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const delayImpl = options.delayImpl ?? defaultDelay;

  let lastError = "unknown error";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await attemptDelivery(lead, endpoint, fetchImpl);
    if (result.ok) {
      return { ok: true };
    }
    lastError = result.error;
    if (attempt < maxAttempts) {
      await delayImpl(retryDelayMs * 2 ** (attempt - 1));
    }
  }

  options.onDeliveryFailure?.(lead, lastError, maxAttempts);
  return { ok: false, error: lastError, attempts: maxAttempts };
}
