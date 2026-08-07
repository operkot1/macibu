/*
 * nineSteps — единый источник данных для 9-шагового пути к правам,
 * используется и в p1-soli-pa-solim.mdx (интерактивный чек-лист,
 * StepListInteractive), и в p1-celvedis.mdx (HowTo-разметка cornerstone-
 * гайда, docs/07-i18n-seo.md §8 — там `p1-celvedis` назван явно, не
 * только "любая страница с StepList interactive"). Порядок и формулировки
 * дословно совпадают с computeWizardPath (T-027) — не придуманы заново.
 */

export interface NineStep {
  title: string;
  duration?: string;
  text: string;
}

export const nineSteps: Record<"lv" | "ru", NineStep[]> = {
  lv: [
    {
      title: "Medicīnas izziņa",
      duration: "1-7д",
      text: "Apmeklē ģimenes ārstu (un, ja nepieciešams, psihiatru/narkologu) un saņem izziņu par piemērotību vadīt transportlīdzekli — tā vajadzīga, lai sāktu teorijas kursu.",
    },
    {
      title: "Baltā apliecība",
      duration: "1д",
      text: "Noformē pagaidu vadītāja apliecību CSDD — ar to drīkst legāli praktizēties uz ceļa jau pirms gala eksāmenu kārtošanas.",
    },
    {
      title: "Skolas izvēle",
      duration: "1-2н",
      text: "Salīdzini savas pilsētas autoskolas: mācību valoda, kārba, atsauksmes un cena — no šīs izvēles atkarīga visa turpmākā programma.",
    },
    {
      title: "Teorijas kurss (11 moduļi)",
      duration: "4-8н",
      text: "Pabeidz 11 moduļu kursu par ceļu satiksmes noteikumiem un drošu braukšanu — parasti aizņem 4-8 nedēļas atkarībā no nodarbību intensitātes.",
    },
    {
      title: "Pirmās palīdzības kurss",
      duration: "1д",
      text: "Atsevišķs obligāts pirmās palīdzības kurss — bez tā neielaidīs uz CSDD teorijas eksāmenu.",
    },
    {
      title: "CSDD teorijas eksāmens",
      text: "Nokārto teorijas eksāmenu CSDD — var pārkārtot pēc neveiksmes, bet katru reizi par atsevišķu samaksu.",
    },
    {
      title: "Braukšanas prakse",
      duration: "2-4м",
      text: "Ilgākais posms: 2-4 mēneši praktisko nodarbību ar instruktoru, stundu skaits atkarīgs no tava progresa.",
    },
    {
      title: "CSDD braukšanas eksāmens",
      text: "Noslēguma praktiskais eksāmens CSDD uz koplietošanas ceļiem.",
    },
    {
      title: "Plastikāta kartes saņemšana",
      text: "Pēc visu eksāmenu sekmīgas nokārtošanas tiek noformēta pastāvīgā plastikāta vadītāja apliecība.",
    },
  ],
  ru: [
    {
      title: "Медицинская справка",
      duration: "1-7д",
      text: "Пройди осмотр у семейного врача (и, при необходимости, у психиатра/нарколога) и получи справку о пригодности к вождению — она нужна для допуска к теоретическому курсу.",
    },
    {
      title: "Белые (временные) права",
      duration: "1д",
      text: "Оформи временное водительское удостоверение в CSDD — с ним можно легально практиковаться на дорогах ещё до сдачи финальных экзаменов.",
    },
    {
      title: "Выбор автошколы",
      duration: "1-2н",
      text: "Сравни автошколы своего города: язык обучения, коробку передач, отзывы и цену — от этого выбора зависит вся дальнейшая программа.",
    },
    {
      title: "Теоретический курс (11 модулей)",
      duration: "4-8н",
      text: "Пройди курс из 11 модулей ПДД и основ безопасного вождения — обычно занимает от 4 до 8 недель в зависимости от интенсивности занятий.",
    },
    {
      title: "Курс первой помощи",
      duration: "1д",
      text: "Отдельный обязательный курс оказания первой помощи — без него не допустят к теоретическому экзамену CSDD.",
    },
    {
      title: "Экзамен теории CSDD",
      text: "Сдай теоретический экзамен в CSDD — можно пересдавать при неудаче, но за отдельную плату каждый раз.",
    },
    {
      title: "Практика вождения",
      duration: "2-4м",
      text: "Основной по длительности этап: 2-4 месяца практических занятий с инструктором, количество часов зависит от твоего прогресса.",
    },
    {
      title: "Экзамен вождения CSDD",
      text: "Финальный практический экзамен CSDD на дорогах общего пользования.",
    },
    {
      title: "Получение пластиковой карты",
      text: "После успешной сдачи всех экзаменов оформляется постоянное пластиковое водительское удостоверение.",
    },
  ],
};
