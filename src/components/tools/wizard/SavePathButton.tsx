import { useState } from "react";
import type { WizardInput } from "../../../lib/wizard/computeWizardPath";
import { trackEvent } from "../../../lib/analytics/trackEvent";

/*
 * SavePathButton — Экран 2, «Сохранить путь» (Модуль 7 §7.5, T-031).
 * «Что дальше?» — отдельная, здесь не специфицированная кнопка из того же
 * ряда прототипа; в задаче T-031 не описана и не реализуется здесь.
 *
 * Единственный на портале запрос данных до момента записи. Email —
 * опционален; в обоих случаях (с email и без) генерируется shareable-
 * ссылка с закодированным WizardInput (только выбор шагов визарда — не
 * PII) в query-параметре `path`, это и есть фактическое «сохранение».
 * Email, если указан, пишется в localStorage — Supabase/user_state ещё
 * нет (Ф4, не подключено), backend для реальной отправки письма тоже не
 * существует, поэтому текст ниже не обещает "письмо отправлено".
 *
 * wizard_path_saved{has_email} и wizard_share_link_copied — события Слоя Б
 * (docs/08-analytics.md §1, §2), которого пока нет (только Слой А,
 * T-021) — см. lib/analytics/trackEvent.ts.
 */

export interface SavePathButtonProps {
  wizardInput: WizardInput;
  currentLocale: "lv" | "ru";
}

const STORAGE_KEY = "portal:saved_path";

function encodeWizardInput(input: WizardInput): string {
  return btoa(JSON.stringify(input));
}

function buildShareUrl(input: WizardInput): string {
  const url = new URL(window.location.href);
  url.searchParams.set("path", encodeWizardInput(input));
  return url.toString();
}

function saveEmailLocally(email: string, input: WizardInput): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      saved_path_email: email,
      wizard_input: input,
      updated_at: new Date().toISOString(),
    }),
  );
}

const text = {
  lv: {
    cta: "Saglabāt ceļu",
    emailLabel: "E-pasts (nav obligāts)",
    emailPlaceholder: "tavs@epasts.lv",
    submit: "Saglabāt",
    linkLabel: "Tava saite:",
    copy: "Kopēt",
    copied: "Nokopēts!",
    saved: "Ceļš saglabāts. Saite derīga bez konta.",
  },
  ru: {
    cta: "Сохранить путь",
    emailLabel: "Email (необязательно)",
    emailPlaceholder: "твой@email.lv",
    submit: "Сохранить",
    linkLabel: "Твоя ссылка:",
    copy: "Скопировать",
    copied: "Скопировано!",
    saved: "Путь сохранён. Ссылка работает без аккаунта.",
  },
} as const;

export default function SavePathButton({
  wizardInput,
  currentLocale,
}: SavePathButtonProps) {
  const t = text[currentLocale];
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSave() {
    const trimmedEmail = email.trim();
    const hasEmail = trimmedEmail.length > 0;
    if (hasEmail) {
      saveEmailLocally(trimmedEmail, wizardInput);
    }
    setShareUrl(buildShareUrl(wizardInput));
    trackEvent("wizard_path_saved", { has_email: hasEmail });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent("wizard_share_link_copied");
    } catch {
      // Clipboard API недоступен/отклонён — ссылка всё равно видна и
      // выделяема вручную в readonly-поле ниже.
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body border-neutral-300 focus-visible:ring-focus-ring rounded-md border p-3 hover:bg-neutral-100 focus-visible:ring-2"
      >
        {t.cta}
      </button>
    );
  }

  return (
    <div className="border-neutral-300 rounded-md border p-4">
      {!shareUrl && (
        <>
          <label className="text-body-sm text-neutral-600 mb-1 block">
            {t.emailLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="text-body focus-visible:ring-focus-ring flex-1 rounded-md border border-neutral-300 p-2 focus-visible:ring-2"
            />
            <button
              type="button"
              onClick={handleSave}
              className="text-body bg-neutral-900 rounded-md p-2 px-4 text-white"
            >
              {t.submit}
            </button>
          </div>
        </>
      )}

      {shareUrl && (
        <div>
          <p className="text-body-sm text-success-600 mb-2">{t.saved}</p>
          <p className="text-body-sm text-neutral-600 mb-1">{t.linkLabel}</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="text-body-sm flex-1 rounded-md border border-neutral-300 p-2"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="text-body-sm border-neutral-300 rounded-md border p-2 px-3 hover:bg-neutral-100"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
