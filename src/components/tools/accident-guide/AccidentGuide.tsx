import { useEffect, useState } from "react";
import { trackEvent } from "../../../lib/analytics/trackEvent";

/*
 * AccidentGuide — ветвящийся гайд "Что делать при ДТП" (T-087,
 * docs/06-tools/chto-delat-pri-dtp.md). Ключевое требование контракта —
 * работает в состоянии стресса пользователя: крупный текст первого шага,
 * минимум решений на экране, номер экстренных служб виден без скролла
 * (рендерится отдельным постоянным блоком вне ветвления, не только на
 * части экранов).
 *
 * Правило "полиция vs. saskaņotais paziņojums" — реальный, проверенный
 * факт (не выдумка): Valsts policija + LTAB (Latvijas Transportlīdzekļu
 * apdrošinātāju birojs) сходятся, что без полиции можно оформить
 * saskaņoto paziņojumu только если ОДНОВРЕМЕННО: нет цietušo, нет
 * повреждений чужого имущества (не только 2 машины), обе стороны
 * согласны с обстоятельствами, обе машины могут ехать дальше. Любое
 * несоблюдение — обязателен вызов полиции.
 */

type Screen = "start" | "injured" | "checklist" | "police" | "agreed";

export interface AccidentGuideProps {
  currentLocale: "lv" | "ru";
}

const text = {
  lv: {
    emergencyLabel: "Ārkārtas numurs",
    startHeading: "Vai kādam negadījumā ir gūti miesas bojājumi?",
    yes: "Jā",
    no: "Nē",
    injuredHeading: "Nekavējoties zvani 112",
    injuredSteps: [
      "Ieslēdz avārijas gaismas un uzstādi brīdinājuma trīsstūri.",
      "Nepārvieto cietušos, ja vien nav tiešu draudu dzīvībai (piemēram, uguns).",
      "Sniedz pirmo palīdzību tiktāl, cik proti, līdz ierodas mediķi.",
      "Nogaidi policiju un mediķus notikuma vietā.",
    ],
    checklistHeading: "Atzīmē, ja attiecas",
    checklistItems: [
      "Bojāts cits īpašums (ceļa zīme, žogs, ēka), ne tikai abas mašīnas",
      "Nepiekrītat viens otram par notikuma apstākļiem",
      "Kāda no mašīnām nevar turpināt braukt",
      "Ir aizdomas, ka kāds no vadītājiem ir reibumā vai bez tiesībām",
    ],
    continueButton: "Turpināt",
    policeHeading: "Zvani policijai — 112",
    policeSteps: [
      "Ieslēdz avārijas gaismas, uzstādi brīdinājuma trīsstūri.",
      "Ja iespējams un droši, nepārvieto mašīnas pirms policijas ierašanās.",
      "Apmaini kontaktinformāciju un OCTA datus ar otru pusi.",
      "Nogaidi policiju, saņem protokolu.",
    ],
    agreedHeading:
      "Vari aizpildīt saskaņoto paziņojumu — policija nav obligāta",
    agreedSteps: [
      "Pārvieto mašīnas, ja tās traucē satiksmei.",
      "Aizpildi saskaņoto paziņojumu kopā ar otru pusi (abu paraksti).",
      "Nofotografē bojājumus un notikuma vietu.",
      "Sazinies ar savu apdrošinātāju iespējami drīz.",
    ],
    restart: "← Sākt no jauna",
    source:
      "Avots: Valsts policija, LTAB (Latvijas Transportlīdzekļu apdrošinātāju birojs).",
  },
  ru: {
    emergencyLabel: "Номер экстренных служб",
    startHeading: "Есть ли пострадавшие в результате происшествия?",
    yes: "Да",
    no: "Нет",
    injuredHeading: "Немедленно звони 112",
    injuredSteps: [
      "Включи аварийные огни и выставь знак аварийной остановки.",
      "Не перемещай пострадавших, если нет прямой угрозы жизни (например, огонь).",
      "Окажи первую помощь в меру своих умений, пока не приедут медики.",
      "Дождись полицию и медиков на месте происшествия.",
    ],
    checklistHeading: "Отметь, если применимо",
    checklistItems: [
      "Повреждено чужое имущество (дорожный знак, забор, здание), не только обе машины",
      "Вы не согласны друг с другом насчёт обстоятельств происшествия",
      "Одна из машин не может ехать дальше",
      "Есть подозрение, что кто-то из водителей в состоянии опьянения или без прав",
    ],
    continueButton: "Продолжить",
    policeHeading: "Звони в полицию — 112",
    policeSteps: [
      "Включи аварийные огни, выставь знак аварийной остановки.",
      "Если возможно и безопасно, не перемещай машины до приезда полиции.",
      "Обменяйся контактами и данными ОСАГО с другой стороной.",
      "Дождись полицию, получи протокол.",
    ],
    agreedHeading: "Можно заполнить извещение о ДТП — полиция не обязательна",
    agreedSteps: [
      "Убери машины, если они мешают движению.",
      "Заполни извещение о ДТП вместе с другой стороной (подписи обеих сторон).",
      "Сфотографируй повреждения и место происшествия.",
      "Свяжись со своим страховщиком как можно скорее.",
    ],
    restart: "← Начать заново",
    source:
      "Источник: Государственная полиция, LTAB (Латвийское бюро страховщиков транспортных средств).",
  },
} as const;

export default function AccidentGuide({ currentLocale }: AccidentGuideProps) {
  const t = text[currentLocale];
  const [screen, setScreen] = useState<Screen>("start");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => trackEvent("accident_guide_viewed"), []);

  function go(next: Screen) {
    setScreen(next);
    trackEvent("accident_guide_screen_changed", { screen: next });
  }

  function toggleCheck(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  function evaluateChecklist() {
    go(checked.size > 0 ? "police" : "agreed");
  }

  function restart() {
    setChecked(new Set());
    go("start");
  }

  return (
    <div>
      <div className="bg-danger-100 border-danger-600 mb-6 rounded-md border-l-4 p-4">
        <p className="text-body-sm text-danger-600 mb-1">{t.emergencyLabel}</p>
        <a href="tel:112" className="text-h1 text-danger-600 font-bold">
          112
        </a>
      </div>

      {screen === "start" && (
        <div>
          <h2 className="text-h1 text-neutral-900 mb-4">{t.startHeading}</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => go("injured")}
              className="bg-danger-600 hover:bg-danger-700 focus-visible:ring-focus-ring rounded-md px-6 py-3 text-lg font-bold text-white focus-visible:ring-2"
            >
              {t.yes}
            </button>
            <button
              type="button"
              onClick={() => go("checklist")}
              className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-focus-ring rounded-md px-6 py-3 text-lg font-bold text-white focus-visible:ring-2"
            >
              {t.no}
            </button>
          </div>
        </div>
      )}

      {screen === "injured" && (
        <div>
          <h2 className="text-h1 text-danger-600 mb-4">{t.injuredHeading}</h2>
          <ol className="text-body text-neutral-900 mb-4 flex list-decimal flex-col gap-2 pl-5">
            {t.injuredSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={restart}
            className="text-primary-600 text-body-sm underline"
          >
            {t.restart}
          </button>
        </div>
      )}

      {screen === "checklist" && (
        <div>
          <h2 className="text-h2 text-neutral-900 mb-4">
            {t.checklistHeading}
          </h2>
          <ul className="mb-4 flex flex-col gap-2">
            {t.checklistItems.map((item, i) => {
              const inputId = `accident-check-${i}`;
              return (
                <li key={i}>
                  <label
                    htmlFor={inputId}
                    className="border-neutral-300 flex cursor-pointer items-center gap-3 rounded-md border p-3"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggleCheck(i)}
                      className="focus-visible:ring-focus-ring focus-visible:ring-2"
                    />
                    <span className="text-body text-neutral-900">{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={evaluateChecklist}
            className="bg-primary-600 hover:bg-primary-700 focus-visible:ring-focus-ring rounded-md px-6 py-3 text-lg font-bold text-white focus-visible:ring-2"
          >
            {t.continueButton}
          </button>
        </div>
      )}

      {screen === "police" && (
        <div>
          <h2 className="text-h1 text-danger-600 mb-4">{t.policeHeading}</h2>
          <ol className="text-body text-neutral-900 mb-4 flex list-decimal flex-col gap-2 pl-5">
            {t.policeSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={restart}
            className="text-primary-600 text-body-sm underline"
          >
            {t.restart}
          </button>
        </div>
      )}

      {screen === "agreed" && (
        <div>
          <h2 className="text-h2 text-success-600 mb-4">{t.agreedHeading}</h2>
          <ol className="text-body text-neutral-900 mb-4 flex list-decimal flex-col gap-2 pl-5">
            {t.agreedSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={restart}
            className="text-primary-600 text-body-sm underline"
          >
            {t.restart}
          </button>
        </div>
      )}

      <p className="text-body-sm text-neutral-600 mt-6">{t.source}</p>
    </div>
  );
}
