import { getCollection } from "astro:content";
import { getSchools } from "../data";
import { CITY_IDS } from "../cities";
import { blogSlug } from "../blog/blogSlug";

export interface SitemapEntry {
  routeId: string;
  lv: string | null;
  ru: string | null;
}

/*
 * Список статичных маршрутов (T-117, ревизия Ф5). Заменяет список из
 * T-023, который так и не пополнялся с момента создания (найдено в
 * T-059, оставлено как отдельный, более крупный вопрос — теперь решён
 * здесь). Нет единого машиночитаемого источника "route_id → путь" —
 * docs/02-routes.md не парсится в рантайме, Content Collection entries
 * не хранят путь, а LV/RU-слаги переводятся по смыслу (about →
 * par-mums/o-nas), формулой не выводятся.
 *
 * Список сгенерирован не вручную — временным скриптом, который прошёл
 * рекурсивно по всем .astro-файлам под src/pages/lv/ и src/pages/ru/
 * (кроме динамических [slug]/[city])
 * и вычитал реальные canonicalPath/routeId пропы прямо из кода route-
 * обёрток, чтобы исключить риск опечатки при переносе ~100 путей вручную.
 * HomeTemplate/NotPassedTemplate — два файла без внешнего canonicalPath-
 * пропа (шаблон хранит путь внутри себя) — добавлены отдельно, тоже
 * сверены с исходником шаблона, не угаданы.
 */
export const staticSitemapEntries: SitemapEntry[] = [
  { routeId: "about", lv: "/lv/par-mums/", ru: "/ru/o-nas/" },
  { routeId: "blog-index", lv: "/lv/blogs/", ru: "/ru/blog/" },
  {
    routeId: "cat-95-kods",
    lv: "/lv/kategorijas/95-kods/",
    ru: "/ru/kategorii/95-kods/",
  },
  { routeId: "cat-a", lv: "/lv/kategorijas/a/", ru: "/ru/kategorii/a/" },
  { routeId: "cat-a1", lv: "/lv/kategorijas/a1/", ru: "/ru/kategorii/a1/" },
  { routeId: "cat-a2", lv: "/lv/kategorijas/a2/", ru: "/ru/kategorii/a2/" },
  { routeId: "cat-am", lv: "/lv/kategorijas/am/", ru: "/ru/kategorii/am/" },
  { routeId: "cat-b1", lv: "/lv/kategorijas/b1/", ru: "/ru/kategorii/b1/" },
  {
    routeId: "cat-b96",
    lv: "/lv/kategorijas/b96/",
    ru: "/ru/kategorii/b96/",
  },
  { routeId: "cat-be", lv: "/lv/kategorijas/be/", ru: "/ru/kategorii/be/" },
  { routeId: "cat-c", lv: "/lv/kategorijas/c/", ru: "/ru/kategorii/c/" },
  { routeId: "cat-c1", lv: "/lv/kategorijas/c1/", ru: "/ru/kategorii/c1/" },
  { routeId: "cat-ce", lv: "/lv/kategorijas/ce/", ru: "/ru/kategorii/ce/" },
  { routeId: "cat-d", lv: "/lv/kategorijas/d/", ru: "/ru/kategorii/d/" },
  { routeId: "cat-index", lv: "/lv/kategorijas/", ru: "/ru/kategorii/" },
  { routeId: "contacts", lv: "/lv/kontakti/", ru: "/ru/kontakty/" },
  { routeId: "home", lv: "/lv/", ru: "/ru/" },
  {
    routeId: "p1-arzemniekiem-apmaina",
    lv: "/lv/ka-iegut-tiesibas/arzemniekiem/apmaina/",
    ru: "/ru/kak-poluchit-prava/inostrancam/obmen-prav/",
  },
  {
    routeId: "p1-arzemniekiem-english",
    lv: "/lv/ka-iegut-tiesibas/arzemniekiem/english/",
    ru: "/ru/kak-poluchit-prava/inostrancam/english/",
  },
  {
    routeId: "p1-arzemniekiem-index",
    lv: "/lv/ka-iegut-tiesibas/arzemniekiem/",
    ru: "/ru/kak-poluchit-prava/inostrancam/",
  },
  {
    routeId: "p1-arzemniekiem-ukrainai",
    lv: "/lv/ka-iegut-tiesibas/arzemniekiem/ukrainai/",
    ru: "/ru/kak-poluchit-prava/inostrancam/dlya-grazhdan-ukrainy/",
  },
  {
    routeId: "p1-baltas-atbildiba",
    lv: "/lv/ka-iegut-tiesibas/baltas-tiesibas/atbildiba/",
    ru: "/ru/kak-poluchit-prava/belye-prava/otvetstvennost/",
  },
  {
    routeId: "p1-baltas-ka-sanemt",
    lv: "/lv/ka-iegut-tiesibas/baltas-tiesibas/ka-sanemt/",
    ru: "/ru/kak-poluchit-prava/belye-prava/kak-poluchit/",
  },
  {
    routeId: "p1-baltas-macities-ar-vecakiem",
    lv: "/lv/ka-iegut-tiesibas/baltas-tiesibas/macities-ar-vecakiem/",
    ru: "/ru/kak-poluchit-prava/belye-prava/uchit-s-roditelyami/",
  },
  {
    routeId: "p1-baltas-tiesibas-index",
    lv: "/lv/ka-iegut-tiesibas/baltas-tiesibas/",
    ru: "/ru/kak-poluchit-prava/belye-prava/",
  },
  {
    routeId: "p1-celvedis",
    lv: "/lv/ka-iegut-tiesibas/celvedis/",
    ru: "/ru/kak-poluchit-prava/rukovodstvo/",
  },
  {
    routeId: "p1-dokumenti",
    lv: "/lv/ka-iegut-tiesibas/dokumenti/",
    ru: "/ru/kak-poluchit-prava/dokumenty/",
  },
  {
    routeId: "p1-index",
    lv: "/lv/ka-iegut-tiesibas/",
    ru: "/ru/kak-poluchit-prava/",
  },
  {
    routeId: "p1-medicina-atteikums",
    lv: "/lv/ka-iegut-tiesibas/medicina/atteikums/",
    ru: "/ru/kak-poluchit-prava/medicina/otkaz/",
  },
  {
    routeId: "p1-medicina-index",
    lv: "/lv/ka-iegut-tiesibas/medicina/",
    ru: "/ru/kak-poluchit-prava/medicina/",
  },
  {
    routeId: "p1-medicina-izzina",
    lv: "/lv/ka-iegut-tiesibas/medicina/izzina/",
    ru: "/ru/kak-poluchit-prava/medicina/spravka/",
  },
  {
    routeId: "p1-medicina-kur-iziet",
    lv: "/lv/ka-iegut-tiesibas/medicina/kur-iziet/",
    ru: "/ru/kak-poluchit-prava/medicina/gde-projti/",
  },
  {
    routeId: "p1-medicina-veselibas-ierobezojumi",
    lv: "/lv/ka-iegut-tiesibas/medicina/veselibas-ierobezojumi/",
    ru: "/ru/kak-poluchit-prava/medicina/ogranicheniya-zdorovya/",
  },
  {
    routeId: "p1-pirma-palidziba-index",
    lv: "/lv/ka-iegut-tiesibas/pirma-palidziba/",
    ru: "/ru/kak-poluchit-prava/pervaya-pomoshch/",
  },
  {
    routeId: "p1-pirma-palidziba-kursi",
    lv: "/lv/ka-iegut-tiesibas/pirma-palidziba/kursi-saraksts/",
    ru: "/ru/kak-poluchit-prava/pervaya-pomoshch/spisok-kursov/",
  },
  {
    routeId: "p1-soli-pa-solim",
    lv: "/lv/ka-iegut-tiesibas/soli-pa-solim/",
    ru: "/ru/kak-poluchit-prava/9-shagov/",
  },
  {
    routeId: "p1-vecums",
    lv: "/lv/ka-iegut-tiesibas/vecums/",
    ru: "/ru/kak-poluchit-prava/vozrast/",
  },
  {
    routeId: "p2-cenas",
    lv: "/lv/csdd-eksameni/cenas/",
    ru: "/ru/ekzameny-csdd/ceny/",
  },
  { routeId: "p2-index", lv: "/lv/csdd-eksameni/", ru: "/ru/ekzameny-csdd/" },
  {
    routeId: "p2-kapec-67",
    lv: "/lv/csdd-eksameni/kapec-67-nenokarto/",
    ru: "/ru/ekzameny-csdd/pochemu-67-ne-sdayut/",
  },
  {
    routeId: "p2-nenokartoju-atgriezties",
    lv: "/lv/csdd-eksameni/nenokartoju/ka-atgriezties/",
    ru: "/ru/ekzameny-csdd/ne-sdal/kak-vernutsya/",
  },
  {
    routeId: "p2-nenokartoju-index",
    lv: "/lv/csdd-eksameni/nenokartoju/",
    ru: "/ru/ekzameny-csdd/ne-sdal/",
  },
  {
    routeId: "p2-nenokartoju-tresa",
    lv: "/lv/csdd-eksameni/nenokartoju/tresa-reize/",
    ru: "/ru/ekzameny-csdd/ne-sdal/tretya-popytka/",
  },
  {
    routeId: "p2-teorija-eksamens",
    lv: "/lv/csdd-eksameni/teorija/eksamens/",
    ru: "/ru/ekzameny-csdd/teoriya/ekzamen/",
  },
  {
    routeId: "p2-teorija-index",
    lv: "/lv/csdd-eksameni/teorija/",
    ru: "/ru/ekzameny-csdd/teoriya/",
  },
  {
    routeId: "p2-teorija-kludas",
    lv: "/lv/csdd-eksameni/teorija/biezakas-kludas/",
    ru: "/ru/ekzameny-csdd/teoriya/chastye-oshibki/",
  },
  {
    routeId: "p2-teorija-pieteiksanas",
    lv: "/lv/csdd-eksameni/teorija/pieteiksanas/",
    ru: "/ru/ekzameny-csdd/teoriya/zapis-na-ekzamen/",
  },
  {
    routeId: "p2-teorija-testi",
    lv: "/lv/csdd-eksameni/teorija/testi/",
    ru: "/ru/ekzameny-csdd/teoriya/testy/",
  },
  {
    routeId: "p2-vadisana-centri",
    lv: "/lv/csdd-eksameni/vadisana/centri/",
    ru: "/ru/ekzameny-csdd/vozhdenie/centry/",
  },
  {
    routeId: "p2-vadisana-eksamens",
    lv: "/lv/csdd-eksameni/vadisana/eksamens/",
    ru: "/ru/ekzameny-csdd/vozhdenie/ekzamen/",
  },
  {
    routeId: "p2-vadisana-figuras",
    lv: "/lv/csdd-eksameni/vadisana/figuras/",
    ru: "/ru/ekzameny-csdd/vozhdenie/figury/",
  },
  {
    routeId: "p2-vadisana-index",
    lv: "/lv/csdd-eksameni/vadisana/",
    ru: "/ru/ekzameny-csdd/vozhdenie/",
  },
  {
    routeId: "p2-vadisana-ko-nemt",
    lv: "/lv/csdd-eksameni/vadisana/ko-nemt-lidzi/",
    ru: "/ru/ekzameny-csdd/vozhdenie/chto-vzyat-s-soboj/",
  },
  {
    routeId: "p2-vadisana-patstaviga",
    lv: "/lv/csdd-eksameni/vadisana/patstaviga-brauksana/",
    ru: "/ru/ekzameny-csdd/vozhdenie/samostoyatelnyj-marshrut/",
  },
  {
    routeId: "p3-cenu-atsifretajs",
    lv: "/lv/autoskolas/cenu-atsifretajs/",
    ru: "/ru/avtoshkoly/rasshifrovka-cen/",
  },
  { routeId: "p3-index", lv: "/lv/autoskolas/", ru: "/ru/avtoshkoly/" },
  {
    routeId: "p3-instruktori",
    lv: "/lv/autoskolas/instruktori/",
    ru: "/ru/avtoshkoly/instruktory/",
  },
  {
    routeId: "p3-ka-izveleties",
    lv: "/lv/autoskolas/ka-izveleties/",
    ru: "/ru/avtoshkoly/kak-vybrat/",
  },
  {
    routeId: "p3-kalkulators",
    lv: "/lv/autoskolas/kalkulators/",
    ru: "/ru/avtoshkoly/kalkulyator/",
  },
  {
    routeId: "p3-katalogs",
    lv: "/lv/autoskolas/katalogs/",
    ru: "/ru/avtoshkoly/katalog/",
  },
  {
    routeId: "p3-ligums",
    lv: "/lv/autoskolas/ligums/",
    ru: "/ru/avtoshkoly/dogovor/",
  },
  {
    routeId: "p3-metodologija",
    lv: "/lv/autoskolas/metodologija/",
    ru: "/ru/avtoshkoly/metodologiya/",
  },
  {
    routeId: "p3-reitings",
    lv: "/lv/autoskolas/reitings/",
    ru: "/ru/avtoshkoly/rejting/",
  },
  {
    routeId: "p3-slepti-maksajumi",
    lv: "/lv/autoskolas/slepti-maksajumi/",
    ru: "/ru/avtoshkoly/skrytye-platezhi/",
  },
  {
    routeId: "p4-automats-manuala",
    lv: "/lv/macos-braukt/automats-vai-manuala/",
    ru: "/ru/uchus-vodit/avtomat-ili-mehanika/",
  },
  {
    routeId: "p4-bailes-brauksanas",
    lv: "/lv/macos-braukt/bailes/brauksanas-bailes/",
    ru: "/ru/uchus-vodit/strahi/strah-vozhdeniya/",
  },
  {
    routeId: "p4-bailes-eksamena",
    lv: "/lv/macos-braukt/bailes/eksamena-bailes/",
    ru: "/ru/uchus-vodit/strahi/strah-ekzamena/",
  },
  {
    routeId: "p4-bailes-index",
    lv: "/lv/macos-braukt/bailes/",
    ru: "/ru/uchus-vodit/strahi/",
  },
  {
    routeId: "p4-bailes-kauns",
    lv: "/lv/macos-braukt/bailes/kauns-pec-neveiksmes/",
    ru: "/ru/uchus-vodit/strahi/styd-posle-neudachi/",
  },
  {
    routeId: "p4-bailes-panika",
    lv: "/lv/macos-braukt/bailes/panika/",
    ru: "/ru/uchus-vodit/strahi/panika/",
  },
  {
    routeId: "p4-bailes-signale",
    lv: "/lv/macos-braukt/bailes/signale-no-aizmugures/",
    ru: "/ru/uchus-vodit/strahi/signalyat-szadi/",
  },
  {
    routeId: "p4-iemanas-aplis",
    lv: "/lv/macos-braukt/iemanas/aplis/",
    ru: "/ru/uchus-vodit/navyki/krugovoe-dvizhenie/",
  },
  {
    routeId: "p4-iemanas-atpakalgaita",
    lv: "/lv/macos-braukt/iemanas/atpakalgaita/",
    ru: "/ru/uchus-vodit/navyki/zadnim-hodom/",
  },
  {
    routeId: "p4-iemanas-index",
    lv: "/lv/macos-braukt/iemanas/",
    ru: "/ru/uchus-vodit/navyki/",
  },
  {
    routeId: "p4-iemanas-kalns",
    lv: "/lv/macos-braukt/iemanas/kalns/",
    ru: "/ru/uchus-vodit/navyki/podyom-v-gorku/",
  },
  {
    routeId: "p4-iemanas-parbuve",
    lv: "/lv/macos-braukt/iemanas/parbuve/",
    ru: "/ru/uchus-vodit/navyki/perestroenie/",
  },
  {
    routeId: "p4-iemanas-parkinga",
    lv: "/lv/macos-braukt/iemanas/parallela-stavvieta/",
    ru: "/ru/uchus-vodit/navyki/parallelnaya-parkovka/",
  },
  {
    routeId: "p4-iemanas-sajugs",
    lv: "/lv/macos-braukt/iemanas/sajugs/",
    ru: "/ru/uchus-vodit/navyki/sceplenie/",
  },
  {
    routeId: "p4-iemanas-ziema",
    lv: "/lv/macos-braukt/iemanas/ziema/",
    ru: "/ru/uchus-vodit/navyki/zimnee-vozhdenie/",
  },
  { routeId: "p4-index", lv: "/lv/macos-braukt/", ru: "/ru/uchus-vodit/" },
  {
    routeId: "p4-instruktors-e-csdd",
    lv: "/lv/macos-braukt/instruktors/e-csdd-parbaude/",
    ru: "/ru/uchus-vodit/instruktor/proverka-v-e-csdd/",
  },
  {
    routeId: "p4-instruktors-index",
    lv: "/lv/macos-braukt/instruktors/",
    ru: "/ru/uchus-vodit/instruktor/",
  },
  {
    routeId: "p4-instruktors-karogi",
    lv: "/lv/macos-braukt/instruktors/sarkanie-karogi/",
    ru: "/ru/uchus-vodit/instruktor/krasnye-flagi/",
  },
  {
    routeId: "p4-instruktors-mainit",
    lv: "/lv/macos-braukt/instruktors/mainit-instruktoru/",
    ru: "/ru/uchus-vodit/instruktor/smenit-instruktora/",
  },
  {
    routeId: "p4-instruktors-tavas-tiesibas",
    lv: "/lv/macos-braukt/instruktors/tavas-tiesibas/",
    ru: "/ru/uchus-vodit/instruktor/tvoi-prava/",
  },
  {
    routeId: "p5-csn-negadijums",
    lv: "/lv/esmu-vaditajs/csn-negadijums/",
    ru: "/ru/ya-voditel/dtp/",
  },
  { routeId: "p5-index", lv: "/lv/esmu-vaditajs/", ru: "/ru/ya-voditel/" },
  {
    routeId: "p5-jaunais-vaditajs",
    lv: "/lv/esmu-vaditajs/jaunais-vaditajs/",
    ru: "/ru/ya-voditel/novyj-voditel/",
  },
  {
    routeId: "p5-pirma-masina-index",
    lv: "/lv/esmu-vaditajs/pirma-masina/",
    ru: "/ru/ya-voditel/pervaya-mashina/",
  },
  {
    routeId: "p5-pirma-masina-ka-izveleties",
    lv: "/lv/esmu-vaditajs/pirma-masina/ka-izveleties/",
    ru: "/ru/ya-voditel/pervaya-mashina/kak-vybrat/",
  },
  {
    routeId: "p5-pirma-masina-kalkulators",
    lv: "/lv/esmu-vaditajs/pirma-masina/uzturesanas-kalkulators/",
    ru: "/ru/ya-voditel/pervaya-mashina/kalkulyator-soderzhaniya/",
  },
  {
    routeId: "p5-pirma-masina-kasko",
    lv: "/lv/esmu-vaditajs/pirma-masina/kasko/",
    ru: "/ru/ya-voditel/pervaya-mashina/kasko/",
  },
  {
    routeId: "p5-pirma-masina-octa",
    lv: "/lv/esmu-vaditajs/pirma-masina/octa/",
    ru: "/ru/ya-voditel/pervaya-mashina/octa/",
  },
  {
    routeId: "p5-pirma-masina-parbaude",
    lv: "/lv/esmu-vaditajs/pirma-masina/parbaude-pirms-pirksanas/",
    ru: "/ru/ya-voditel/pervaya-mashina/proverka-pered-pokupkoj/",
  },
  {
    routeId: "p5-pirma-masina-registracija",
    lv: "/lv/esmu-vaditajs/pirma-masina/registracija/",
    ru: "/ru/ya-voditel/pervaya-mashina/registraciya/",
  },
  {
    routeId: "p5-pirma-masina-tehapskate",
    lv: "/lv/esmu-vaditajs/pirma-masina/tehniska-apskate/",
    ru: "/ru/ya-voditel/pervaya-mashina/tehosmotr/",
  },
  {
    routeId: "p5-pirmie-10",
    lv: "/lv/esmu-vaditajs/pirmie-10-braucieni/",
    ru: "/ru/ya-voditel/pervye-10-poezdok/",
  },
  {
    routeId: "p5-policija",
    lv: "/lv/esmu-vaditajs/policija/",
    ru: "/ru/ya-voditel/policiya/",
  },
  {
    routeId: "p5-punkti",
    lv: "/lv/esmu-vaditajs/punkti/",
    ru: "/ru/ya-voditel/punkty/",
  },
  {
    routeId: "p5-sodi",
    lv: "/lv/esmu-vaditajs/sodi/",
    ru: "/ru/ya-voditel/shtrafy/",
  },
  {
    routeId: "p5-stavvietas",
    lv: "/lv/esmu-vaditajs/stavvietas/",
    ru: "/ru/ya-voditel/stoyanki/",
  },
  {
    routeId: "p5-vinjete",
    lv: "/lv/esmu-vaditajs/vinjete/",
    ru: "/ru/ya-voditel/vinjetka/",
  },
  {
    routeId: "p5-ziemas-riepas",
    lv: "/lv/esmu-vaditajs/ziemas-riepas/",
    ru: "/ru/ya-voditel/zimnie-shiny/",
  },
  {
    routeId: "privacy",
    lv: "/lv/privatuma-politika/",
    ru: "/ru/politika-konfidencialnosti/",
  },
  { routeId: "wizard", lv: "/lv/tavs-cels/", ru: "/ru/tvoj-put/" },
];

/*
 * Динамические маршруты — по данным, не по одному шаблонному URL
 * (docs/07-i18n-seo.md §5).
 */
function dynamicEntries(): SitemapEntry[] {
  return [
    ...getSchools().schools.map((school) => ({
      routeId: `school-card-${school.slug}`,
      lv: `/lv/skola/${school.slug}/`,
      ru: `/ru/skola/${school.slug}/`,
    })),
    ...CITY_IDS.map((cityId) => ({
      routeId: `p3-city-${cityId}`,
      lv: `/lv/autoskolas/${cityId}/`,
      ru: `/ru/avtoshkoly/${cityId}/`,
    })),
  ];
}

/*
 * blog-post (T-115/T-116) — тоже динамический маршрут по §5, но источник
 * данных — Content Collection, не JSON-фикстура, поэтому запрос
 * асинхронный (astro:content). Группируем по route_id, чтобы пара
 * lv/ru у одного поста оказалась в одной записи sitemap, даже если один
 * из языков ещё не переведён (см. правило 7.3 — тогда соответствующее
 * поле остаётся null и запись не попадёт в sitemap этого языка).
 */
async function blogEntries(): Promise<SitemapEntry[]> {
  const posts = await getCollection("blogPosts");
  const byRouteId = new Map<string, SitemapEntry>();
  for (const post of posts) {
    const routeId = post.data.route_id;
    const slug = blogSlug(routeId);
    const existing = byRouteId.get(routeId) ?? { routeId, lv: null, ru: null };
    if (post.data.lang === "lv") existing.lv = `/lv/blogs/${slug}/`;
    else existing.ru = `/ru/blog/${slug}/`;
    byRouteId.set(routeId, existing);
  }
  return [...byRouteId.values()];
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  return [
    ...staticSitemapEntries,
    ...dynamicEntries(),
    ...(await blogEntries()),
  ];
}
