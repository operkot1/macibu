/*
 * eCsddCheck — soļi, kā e-CSDD profilā pārbaudīt savu apmācības progresu
 * (p4-instruktors-e-csdd, T-107). Tas pats paraugs, kas nineSteps.ts/
 * tenTrips.ts/prePurchaseChecklist.ts: kopīgi LV/RU dati priekš
 * StepListInteractive (T-036) — ceturtais reālais patērētājs. Fakti par
 * portālu (adrese, pieteikšanās veidi, ko rāda profilā) — reāli, pārbaudīti
 * WebFetch pret csdd.lv (docs/00-assumptions.md A-17), nevis izdomāti.
 */

export interface ECsddCheckStep {
  title: string;
  note: string;
}

export const eCsddCheck: Record<"lv" | "ru", ECsddCheckStep[]> = {
  lv: [
    {
      title: "Atver oficiālo e-CSDD portālu",
      note: "Adrese ir e.csdd.lv — pārliecinies, ka esi tieši šajā adresē, ne līdzīgā krāpnieciskā lapā.",
    },
    {
      title: "Piesakies ar vienoto pieteikšanās moduli",
      note: "Autorizācija caur Latvija.lv (internetbanka, eParaksts, eID) vai norādot vadītāja apliecības datus.",
    },
    {
      title: "Atrodi savu apmācības profilu",
      note: "Sadaļā par apmācību autoskolā redzama informācija par tavu progresu.",
    },
    {
      title: "Pārbaudi veiktās braukšanas nodarbības",
      note: "Instruktors katru nodarbību ieraksta CSDD reģistrā — profilā redzams, vai visas notikušās nodarbības tiešām ir atzīmētas.",
    },
    {
      title: "Salīdzini ar savu atmiņu",
      note: "Ja profilā redzamais neatbilst reāli notikušajām nodarbībām, tas ir iemesls sazināties ar autoskolu.",
    },
  ],
  ru: [
    {
      title: "Открой официальный портал e-CSDD",
      note: "Адрес — e.csdd.lv — убедись, что находишься именно на этом адресе, а не на похожей мошеннической странице.",
    },
    {
      title: "Войди через единый портал авторизации",
      note: "Авторизация через Latvija.lv (интернет-банк, eParaksts, eID) или указав данные водительского удостоверения.",
    },
    {
      title: "Найди свой профиль обучения",
      note: "В разделе об обучении в автошколе видна информация о твоём прогрессе.",
    },
    {
      title: "Проверь пройденные занятия по вождению",
      note: "Инструктор вносит каждое занятие в реестр CSDD — в профиле видно, действительно ли все прошедшие занятия отмечены.",
    },
    {
      title: "Сравни со своей памятью",
      note: "Если то, что видно в профиле, не соответствует реально прошедшим занятиям, это повод связаться с автошколой.",
    },
  ],
};
