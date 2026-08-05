import { useEffect, useState } from "react";

/*
 * CookieBanner — docs/08-analytics.md §4. Нижняя полоса, не модальное
 * окно, не блокирует контент. «Принять»/«Отклонить» — визуально
 * равнозначны (одинаковый размер/паддинг), без предзаполненных галочек,
 * без тёмных паттернов.
 *
 * Слой Б (docs/08-analytics.md §1) ещё не существует — подключается
 * позже, в Ф1+, когда появится первое событие воронки. Точка интеграции
 * отмечена комментарием ниже, реальной загрузки скрипта сейчас нет.
 *
 * Состояние согласия — локально в компоненте + localStorage, не
 * nanostores-стор (в отличие от PhaseBar): здесь один инстанс на
 * страницу, читать это значение сейчас некому — заводить общий стор
 * ради гипотетического будущего потребителя не стал.
 *
 * ВАЖНО: решение «показывать ли баннер» принимается в useEffect (после
 * маунта), не во время самого рендера. Найдено вживую при проверке: если
 * первый клиентский рендер сразу возвращает null при SSR-разметке с
 * видимым div (сервер не знает localStorage), гидратация React не
 * убирает рассинхронизированную SSR-разметку — обработчики кликов после
 * этого работают, но сам баннер остаётся видимым навсегда, хотя
 * consent уже сохранён. SSR и первый клиентский рендер теперь всегда
 * идентичны (оба — "ничего"), реальное решение — отдельным пост-маунт
 * рендером, для которого этот механизм уже проверенно работает.
 */

export interface CookieBannerProps {
  currentLocale: "lv" | "ru";
}

const STORAGE_KEY = "portal:cookie-consent";

type ConsentValue = "accepted" | "declined";

function readStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "accepted" || raw === "declined" ? raw : null;
}

const text = {
  lv: {
    message:
      "Mēs vienmēr izmantojam anonimizētu apmeklējumu statistiku un, ar jūsu piekrišanu, arī detalizētāku analītiku.",
    privacyLink: "Privātuma politika",
    accept: "Piekrītu",
    decline: "Noraidu",
  },
  ru: {
    message:
      "Мы всегда используем анонимную статистику посещений, а с вашего согласия — более детальную аналитику.",
    privacyLink: "Политика конфиденциальности",
    accept: "Принимаю",
    decline: "Отклоняю",
  },
} as const;

const privacyHref = {
  lv: "/lv/privatuma-politika/",
  ru: "/ru/politika-konfidencialnosti/",
} as const;

export default function CookieBanner({ currentLocale }: CookieBannerProps) {
  // Всегда false и на сервере, и на первом клиентском рендере — решение
  // принимается только после маунта (см. комментарий выше).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readStoredConsent() === null) {
      setVisible(true);
    }
  }, []);

  function choose(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
    if (value === "accepted") {
      // Точка интеграции Слоя Б (Ф1+, docs/08-analytics.md §1) — здесь
      // будет условно подгружаться реальный аналитический скрипт с
      // персистентным ID. Слоя Б не существует, подгружать нечего.
    }
  }

  if (!visible) return null;

  const t = text[currentLocale];

  return (
    <div
      role="region"
      aria-label={
        currentLocale === "lv"
          ? "Sīkdatņu piekrišana"
          : "Согласие на использование данных"
      }
      className="border-neutral-300 bg-neutral-0 fixed inset-x-0 bottom-0 z-20 border-t p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-neutral-900">
          {t.message}{" "}
          <a
            href={privacyHref[currentLocale]}
            className="text-primary-600 focus-visible:ring-focus-ring rounded-md underline focus-visible:ring-2"
          >
            {t.privacyLink}
          </a>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="text-body-sm text-neutral-900 focus-visible:ring-focus-ring rounded-md border border-neutral-300 px-4 py-2 focus-visible:ring-2"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="text-body-sm text-primary-700 focus-visible:ring-focus-ring border-primary-600 rounded-md border px-4 py-2 focus-visible:ring-2"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
