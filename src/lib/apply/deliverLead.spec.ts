import { describe, expect, it, vi } from "vitest";
import { deliverLead, type Lead } from "./deliverLead";

const LEAD: Lead = {
  school_id: "sch-fors",
  city_id: "riga",
  category: "B",
  gearbox: "manual",
  language: "lv",
  name: "Jānis Bērziņš",
  phone: "+371 20000000",
};

const noopDelay = vi.fn(() => Promise.resolve());

function jsonResponse(ok: boolean, status = ok ? 200 : 500): Response {
  return { ok, status } as Response;
}

describe("deliverLead", () => {
  it("успех с первой попытки — 1 вызов fetch, без retry-задержек", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(true));
    const delayImpl = vi.fn(noopDelay);
    const result = await deliverLead(LEAD, { fetchImpl, delayImpl });
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(delayImpl).not.toHaveBeenCalled();
  });

  it("отправляет лид на /api/leads/deliver по умолчанию, POST + JSON body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(true));
    await deliverLead(LEAD, { fetchImpl, delayImpl: noopDelay });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/leads/deliver",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(LEAD),
      }),
    );
  });

  it("успех после двух неудачных попыток — 3 вызова fetch, 2 задержки с экспоненциальным ростом", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(false, 500))
      .mockResolvedValueOnce(jsonResponse(false, 502))
      .mockResolvedValueOnce(jsonResponse(true));
    const delayImpl = vi.fn(noopDelay);
    const result = await deliverLead(LEAD, {
      fetchImpl,
      delayImpl,
      retryDelayMs: 100,
    });
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(delayImpl).toHaveBeenNthCalledWith(1, 100);
    expect(delayImpl).toHaveBeenNthCalledWith(2, 200);
  });

  it("исчерпанные попытки — лид не теряется молча: результат ok:false и вызывается onDeliveryFailure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(false, 404));
    const onDeliveryFailure = vi.fn();
    const result = await deliverLead(LEAD, {
      fetchImpl,
      delayImpl: noopDelay,
      maxAttempts: 3,
      onDeliveryFailure,
    });
    expect(result).toEqual({ ok: false, error: "HTTP 404", attempts: 3 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(onDeliveryFailure).toHaveBeenCalledTimes(1);
    expect(onDeliveryFailure).toHaveBeenCalledWith(LEAD, "HTTP 404", 3);
  });

  it("сетевая ошибка (fetch отклонён) тоже обрабатывается как сбой, не падает необработанным исключением", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    const onDeliveryFailure = vi.fn();
    const result = await deliverLead(LEAD, {
      fetchImpl,
      delayImpl: noopDelay,
      maxAttempts: 2,
      onDeliveryFailure,
    });
    expect(result).toEqual({
      ok: false,
      error: "Failed to fetch",
      attempts: 2,
    });
    expect(onDeliveryFailure).toHaveBeenCalledWith(LEAD, "Failed to fetch", 2);
  });
});
