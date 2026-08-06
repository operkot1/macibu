/*
 * Список городов для форм выбора (визард, калькулятор) — единый источник,
 * чтобы список и подписи LV/RU не расходились между инструментами.
 * Полный перечень city-хабов — docs/02-routes.md, Pillar 3.
 */

export const CITY_IDS = [
  "riga",
  "daugavpils",
  "liepaja",
  "jelgava",
  "jurmala",
  "ventspils",
  "valmiera",
  "rezekne",
  "ogre",
] as const;

export type CityId = (typeof CITY_IDS)[number];

export const cityLabels: Record<"lv" | "ru", Record<CityId, string>> = {
  lv: {
    riga: "Rīga",
    daugavpils: "Daugavpils",
    liepaja: "Liepāja",
    jelgava: "Jelgava",
    jurmala: "Jūrmala",
    ventspils: "Ventspils",
    valmiera: "Valmiera",
    rezekne: "Rēzekne",
    ogre: "Ogre",
  },
  ru: {
    riga: "Рига",
    daugavpils: "Даугавпилс",
    liepaja: "Лиепая",
    jelgava: "Елгава",
    jurmala: "Юрмала",
    ventspils: "Вентспилс",
    valmiera: "Валмиера",
    rezekne: "Резекне",
    ogre: "Огре",
  },
};
