/*
 * prePurchaseChecklist — pārbaudes čeklists pirms auto pirkšanas
 * (p5-pirma-masina-parbaude, T-089). Tas pats paraugs, kas nineSteps.ts/
 * tenTrips.ts: kopīgi LV/RU dati priekš StepListInteractive (T-036) —
 * trešais reālais patērētājs pēc "9 soļi" (T-037) un "Pirmie 10 braucieni"
 * (T-084). Vispārzināma auto pirkšanas prakse, nevis izdomāta secība.
 */

export interface PrePurchaseChecklistStep {
  title: string;
  note: string;
}

export const prePurchaseChecklist: Record<
  "lv" | "ru",
  PrePurchaseChecklistStep[]
> = {
  lv: [
    {
      title: "Salīdzini VIN kodu ar dokumentiem",
      note: "VIN uz auto virsbūves/dzinēja jāsakrīt ar reģistrācijas apliecību.",
    },
    {
      title: "Pārbaudi apkopes vēsturi",
      note: "Servisa grāmatiņa vai elektroniskie servisa ieraksti parāda, vai auto kopts regulāri.",
    },
    {
      title: "Apskati virsbūvi dienasgaismā",
      note: "Meklē rūsu, krāsas toņu atšķirības (pazīme par remontētu bojājumu) un nevienmērīgas spraugas.",
    },
    {
      title: "Pārbaudi riepas un bremzes",
      note: "Nevienmērīgs riepu nodilums var norādīt uz skrejceļa problēmām.",
    },
    {
      title: "Izbrauc ar testa braucienu",
      note: "Klausies svešas skaņas, pārbaudi bremzēšanu un stūrēšanu dažādos ātrumos.",
    },
    {
      title: "Ņem līdzi neatkarīgu mehāniķi",
      note: "Neatkarīga pārbaude izmaksā, bet var atklāt to, ko nepamana pircējs pats.",
    },
    {
      title: "Pārbaudi negadījumu vēsturi",
      note: "CSDD un citi pakalpojumi ļauj pārbaudīt transportlīdzekļa vēsturi pēc VIN vai reģistrācijas numura.",
    },
    {
      title: "Salīdzini cenu ar tirgu",
      note: "Neparasti zema cena bieži nozīmē slēptu problēmu, ne veiksmīgu darījumu.",
    },
  ],
  ru: [
    {
      title: "Сравни VIN-код с документами",
      note: "VIN на кузове/двигателе должен совпадать с регистрационным удостоверением.",
    },
    {
      title: "Проверь историю обслуживания",
      note: "Сервисная книжка или электронные записи сервиса показывают, ухаживали ли за машиной регулярно.",
    },
    {
      title: "Осмотри кузов при дневном свете",
      note: "Ищи ржавчину, разницу в оттенках краски (признак ремонта после повреждения) и неровные зазоры.",
    },
    {
      title: "Проверь шины и тормоза",
      note: "Неравномерный износ шин может указывать на проблемы с ходовой частью.",
    },
    {
      title: "Съезди на тест-драйв",
      note: "Прислушайся к посторонним звукам, проверь торможение и руление на разных скоростях.",
    },
    {
      title: "Возьми с собой независимого механика",
      note: "Независимая проверка стоит денег, но может выявить то, что покупатель сам не заметит.",
    },
    {
      title: "Проверь историю ДТП",
      note: "CSDD и другие сервисы позволяют проверить историю транспортного средства по VIN или номеру.",
    },
    {
      title: "Сравни цену с рынком",
      note: "Необычно низкая цена чаще означает скрытую проблему, а не удачную сделку.",
    },
  ],
};
