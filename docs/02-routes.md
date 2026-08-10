# 02. Реестр маршрутов

Главный документ проекта. Любое изменение дерева сайта начинается здесь, а не
в коде. При добавлении/переименовании страницы — сначала правится эта таблица
(см. CLAUDE.md, раздел «Как добавить новую страницу»), потом код.

## Легенда колонок

| Колонка | Значение |
|---|---|
| `route_id` | Уникальный идентификатор маршрута, используется в коде (аналитика, тесты, компонент `RouteMeta`) — не меняется при переименовании URL |
| путь LV / путь RU | Путь **без** языкового префикса `/lv/` `/ru/` — префикс добавляется всегда, см. docs/07-i18n-seo.md |
| тип страницы | Смысловая категория (влияет на Schema.org-разметку, см. docs/07) |
| шаблон | Компонент верхнего уровня, см. docs/05-components.md |
| фаза | В какой фазе (Ф0–Ф5, см. docs/11-backlog.md) страница впервые выходит в прод |
| инструмент | ★ обычный / ★★ ключевой актив / — нет |
| источник данных | Ссылка на docs/03-data-model.md или `static-content` (Content Collections) |
| статус | На момент этого документа всё `план` — ничего не реализовано |

Правила, обязательные для каждой строки (из Модуля 7, раздел 7.3 и 7.1):

- языковой префикс обязателен: `/lv/...` и `/ru/...`;
- слаги — перевод по смыслу на языке раздела, не транслитерация;
- города и `/skola/{slug}/` — **одинаковый** слаг на обоих языках;
- максимум 3 клика от главной до любой страницы.

---

## Главная и визард

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `home` | `/` | `/` | главная | `HomeTemplate` | Ф0/Ф1 | — | `ratings`, `cost_model` (превью-блоки) | в проде (Ф0-заглушка, T-012; превью-блоки рейтинга/стоимости — T-026, Ф1) |
| `wizard` | `/tavs-cels/` | `/tvoj-put/` | инструмент | `ToolPageTemplate` | Ф1 | ★ | `cost_model` | в проде (T-032) |

> Примечание: LV-слаг визарда в дереве Модуля 7 дан как `/sakums-vizards/`.
> Меняю на `/tavs-cels/` («твой путь» дословно) для согласованности с RU
> `/tvoj-put/` и текстом кнопки на главной «Построить мой путь» — обе версии
> означают одно и то же понятие, а не разные. **[ДОПУЩЕНИЕ]** — если бренд-имя
> `sakums-vizards` уже используется во внешних материалах (реклама, УТМ-метки),
> вернуть исходный слаг.

## Pillar 1 — Как получить права (`/ka-iegut-tiesibas/` · `/kak-poluchit-prava/`)

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `p1-index` | `/ka-iegut-tiesibas/` | `/kak-poluchit-prava/` | pillar-хаб | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-051) |
| `p1-celvedis` | `/ka-iegut-tiesibas/celvedis/` | `/kak-poluchit-prava/rukovodstvo/` | cornerstone-гайд | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-038) |
| `p1-soli-pa-solim` | `/ka-iegut-tiesibas/soli-pa-solim/` | `/kak-poluchit-prava/9-shagov/` | статья + интерактивный чек-лист | `ArticleTemplate` | Ф1 | ★ | `user_state` (прогресс чек-листа) | в проде (T-037) |
| `p1-dokumenti` | `/ka-iegut-tiesibas/dokumenti/` | `/kak-poluchit-prava/dokumenty/` | справочная статья | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-038) |
| `p1-vecums` | `/ka-iegut-tiesibas/vecums/` | `/kak-poluchit-prava/vozrast/` | справочная статья | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-038) |
| `p1-medicina-index` | `/ka-iegut-tiesibas/medicina/` | `/kak-poluchit-prava/medicina/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф2 | — | static-content | план |
| `p1-medicina-izzina` | `/ka-iegut-tiesibas/medicina/izzina/` | `/kak-poluchit-prava/medicina/spravka/` | гайд | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-medicina-kur-iziet` | `/ka-iegut-tiesibas/medicina/kur-iziet/` | `/kak-poluchit-prava/medicina/gde-projti/` | каталог | `ToolPageTemplate` | Ф2 | ★ | `schools` (мед. учреждения, отдельная выборка) | план |
| `p1-medicina-veselibas-ierobezojumi` | `/ka-iegut-tiesibas/medicina/veselibas-ierobezojumi/` | `/kak-poluchit-prava/medicina/ogranicheniya-zdorovya/` | справочная статья | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-medicina-atteikums` | `/ka-iegut-tiesibas/medicina/atteikums/` | `/kak-poluchit-prava/medicina/otkaz/` | гайд | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-baltas-tiesibas-index` | `/ka-iegut-tiesibas/baltas-tiesibas/` | `/kak-poluchit-prava/belye-prava/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф2 | — | static-content | **см. дефект D-01** |
| `p1-baltas-ka-sanemt` | `/ka-iegut-tiesibas/baltas-tiesibas/ka-sanemt/` | `/kak-poluchit-prava/belye-prava/kak-poluchit/` | HowTo | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-baltas-macities-ar-vecakiem` | `/ka-iegut-tiesibas/baltas-tiesibas/macities-ar-vecakiem/` | `/kak-poluchit-prava/belye-prava/uchit-s-roditelyami/` | гайд | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-baltas-atbildiba` | `/ka-iegut-tiesibas/baltas-tiesibas/atbildiba/` | `/kak-poluchit-prava/belye-prava/otvetstvennost/` | справочная статья | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-pirma-palidziba-index` | `/ka-iegut-tiesibas/pirma-palidziba/` | `/kak-poluchit-prava/pervaya-pomoshch/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф2 | — | static-content | план |
| `p1-pirma-palidziba-kursi` | `/ka-iegut-tiesibas/pirma-palidziba/kursi-saraksts/` | `/kak-poluchit-prava/pervaya-pomoshch/spisok-kursov/` | каталог | `ToolPageTemplate` | Ф2 | ★ | `schools` (курсы первой помощи, отдельная выборка) | план |
| `p1-arzemniekiem-index` | `/ka-iegut-tiesibas/arzemniekiem/` | `/kak-poluchit-prava/inostrancam/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф2 | — | static-content | **см. дефект D-01** |
| `p1-arzemniekiem-apmaina` | `/ka-iegut-tiesibas/arzemniekiem/apmaina/` | `/kak-poluchit-prava/inostrancam/obmen-prav/` | гайд | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-arzemniekiem-ukrainai` | `/ka-iegut-tiesibas/arzemniekiem/ukrainai/` | `/kak-poluchit-prava/inostrancam/dlya-grazhdan-ukrainy/` | гайд | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p1-arzemniekiem-english` | `/ka-iegut-tiesibas/arzemniekiem/english/` | `/kak-poluchit-prava/inostrancam/english/` | EN-хаб (ссылка на `/en/`) | `LangHubStubTemplate` | Ф5 | — | static-content | план |

## Pillar 2 — Экзамены CSDD (`/csdd-eksameni/` · `/ekzameny-csdd/`)

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `p2-index` | `/csdd-eksameni/` | `/ekzameny-csdd/` | pillar-хаб | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-039) |
| `p2-teorija-index` | `/csdd-eksameni/teorija/` | `/ekzameny-csdd/teoriya/` | подраздел-хаб | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-039) |
| `p2-teorija-eksamens` | `/csdd-eksameni/teorija/eksamens/` | `/ekzameny-csdd/teoriya/ekzamen/` | разбор экзамена | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-040) |
| `p2-teorija-testi` | `/csdd-eksameni/teorija/testi/` | `/ekzameny-csdd/teoriya/testy/` | тренажёр | `ToolPageTemplate` | Ф1 | ★★ | `theory_questions`, `user_state` | в проде (T-047) |
| `p2-teorija-rezims` | `/csdd-eksameni/teorija/eksamena-rezims/` | `/ekzameny-csdd/teoriya/rezhim-ekzamena/` | симулятор экзамена | `ToolPageTemplate` | Ф2 | ★★ | `theory_questions`, `user_state` | план |
| `p2-teorija-video` | `/csdd-eksameni/teorija/video-jautajumi/` | `/ekzameny-csdd/teoriya/video-voprosy/` | тренажёр видео-вопросов | `ToolPageTemplate` | Ф2 | ★★ | `theory_questions` | план |
| `p2-teorija-kludas` | `/csdd-eksameni/teorija/biezakas-kludas/` | `/ekzameny-csdd/teoriya/chastye-oshibki/` | справочная статья | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-040) |
| `p2-teorija-pieteiksanas` | `/csdd-eksameni/teorija/pieteiksanas/` | `/ekzameny-csdd/teoriya/zapis-na-ekzamen/` | HowTo | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-040) |
| `p2-vadisana-index` | `/csdd-eksameni/vadisana/` | `/ekzameny-csdd/vozhdenie/` | подраздел-хаб | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-039) |
| `p2-vadisana-eksamens` | `/csdd-eksameni/vadisana/eksamens/` | `/ekzameny-csdd/vozhdenie/ekzamen/` | разбор процедуры | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-041) |
| `p2-vadisana-figuras` | `/csdd-eksameni/vadisana/figuras/` | `/ekzameny-csdd/vozhdenie/figury/` | справочная статья | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-041) |
| `p2-vadisana-patstaviga` | `/csdd-eksameni/vadisana/patstaviga-brauksana/` | `/ekzameny-csdd/vozhdenie/samostoyatelnyj-marshrut/` | справочная статья | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-041) |
| `p2-vadisana-zonas` | `/csdd-eksameni/vadisana/eksamena-zonas/` | `/ekzameny-csdd/vozhdenie/zony-ekzamena/` | карта зон (UGC) | `ToolPageTemplate` | Ф4 | ★★ | `exam_zones` | план |
| `p2-vadisana-centri` | `/csdd-eksameni/vadisana/centri/` | `/ekzameny-csdd/vozhdenie/centry/` | карта центров | `ToolPageTemplate` | Ф1 | ★ | `csdd_centers` (`source: placeholder`, см. `A-11`) | в проде (T-042, данные — плейсхолдер) |
| `p2-vadisana-ko-nemt` | `/csdd-eksameni/vadisana/ko-nemt-lidzi/` | `/ekzameny-csdd/vozhdenie/chto-vzyat-s-soboj/` | чек-лист | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-041) |
| `p2-kapec-67` | `/csdd-eksameni/kapec-67-nenokarto/` | `/ekzameny-csdd/pochemu-67-ne-sdayut/` | флагманская статья | `ArticleTemplate` | Ф1 | — | static-content, `ratings` (агрегат) | в проде (T-043) |
| `p2-nenokartoju-index` | `/csdd-eksameni/nenokartoju/` | `/ekzameny-csdd/ne-sdal/` | «Не сдал» — экран | `NotPassedTemplate` | Ф1 | ★★ | static-content, `theory_questions` (дедлайн-подсчёт) | в проде (T-049b) |
| `p2-nenokartoju-protokols` | `/csdd-eksameni/nenokartoju/protokola-analize/` | `/ekzameny-csdd/ne-sdal/razbor-protokola/` | разбор протокола | `ToolPageTemplate` | Ф4 | ★★ | static-content (справочник кодов нарушений) | план |
| `p2-nenokartoju-atgriezties` | `/csdd-eksameni/nenokartoju/ka-atgriezties/` | `/ekzameny-csdd/ne-sdal/kak-vernutsya/` | гайд | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-049) |
| `p2-nenokartoju-tresa` | `/csdd-eksameni/nenokartoju/tresa-reize/` | `/ekzameny-csdd/ne-sdal/tretya-popytka/` | гайд | `ArticleTemplate` | Ф1 | — | static-content | в проде (T-049) |
| `p2-cenas` | `/csdd-eksameni/cenas/` | `/ekzameny-csdd/ceny/` | тарифы (из JSON) | `ArticleTemplate` + таблица | Ф1 | — | `csdd_tariffs` | в проде (T-050) |

## Pillar 3 — Автошколы (`/autoskolas/` · `/avtoshkoly/`)

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `p3-index` | `/autoskolas/` | `/avtoshkoly/` | pillar-хаб | `PillarIndexTemplate` | Ф2 | — | static-content | план |
| `p3-katalogs` | `/autoskolas/katalogs/` | `/avtoshkoly/katalog/` | каталог + фильтры | `CatalogTemplate` | Ф2 | ★★ | `schools` | в проде (T-054) |
| `p3-reitings` | `/autoskolas/reitings/` | `/avtoshkoly/rejting/` | рейтинг школ | `RatingTemplate` | Ф2 | ★★ | `ratings`, `schools` | план |
| `p3-instruktori` | `/autoskolas/instruktori/` | `/avtoshkoly/instruktory/` | рейтинг инструкторов | `RatingTemplate` | Ф2 | ★★ | `ratings`, `instructors` | план |
| `p3-metodologija` | `/autoskolas/metodologija/` | `/avtoshkoly/metodologiya/` | методика (открытая) | `ArticleTemplate` | Ф2 | — | static-content | план — см. `A-06`, дублируется ссылкой из подвала |
| `p3-ka-izveleties` | `/autoskolas/ka-izveleties/` | `/avtoshkoly/kak-vybrat/` | справочная статья | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p3-slepti-maksajumi` | `/autoskolas/slepti-maksajumi/` | `/avtoshkoly/skrytye-platezhi/` | справочная статья | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p3-cenu-atsifretajs` | `/autoskolas/cenu-atsifretajs/` | `/avtoshkoly/rasshifrovka-cen/` | дешифратор прайса | `ToolPageTemplate` | Ф2 | ★★ | `cost_model`, `csdd_tariffs` | план |
| `p3-kalkulators` | `/autoskolas/kalkulators/` | `/avtoshkoly/kalkulyator/` | калькулятор цены | `ToolPageTemplate` | Ф1 | ★★ | `cost_model` | в проде (T-035) |
| `p3-ligums` | `/autoskolas/ligums/` | `/avtoshkoly/dogovor/` | справочная статья | `ArticleTemplate` | Ф2 | — | static-content | план |
| `p3-city-riga` | `/autoskolas/riga/` | `/avtoshkoly/riga/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` (фильтр по городу) | план |
| `p3-city-daugavpils` | `/autoskolas/daugavpils/` | `/avtoshkoly/daugavpils/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-liepaja` | `/autoskolas/liepaja/` | `/avtoshkoly/liepaja/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-jelgava` | `/autoskolas/jelgava/` | `/avtoshkoly/jelgava/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-jurmala` | `/autoskolas/jurmala/` | `/avtoshkoly/jurmala/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-ventspils` | `/autoskolas/ventspils/` | `/avtoshkoly/ventspils/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-valmiera` | `/autoskolas/valmiera/` | `/avtoshkoly/valmiera/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-rezekne` | `/autoskolas/rezekne/` | `/avtoshkoly/rezekne/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `p3-city-ogre` | `/autoskolas/ogre/` | `/avtoshkoly/ogre/` | city-хаб | `CityHubTemplate` | Ф2 | ★ | `schools`, `ratings` | план |
| `school-card` | `/skola/{slug}/` | `/skola/{slug}/` | карточка школы (шаблон, вне пилларного префикса) | `SchoolCardTemplate` | Ф2 (каталог, все школы LV) / Ф3 (запись — только `is_partner`) | — | `schools`, `instructors`, `ratings` | план — см. `A-05` |
| `school-card-fors` | `/skola/fors/` | `/skola/fors/` | карточка школы — экземпляр `school-card` | `SchoolCardTemplate` | Ф3 | — | `schools` (`is_partner: true`) | план |

## Pillar 4 — Учусь водить (`/macos-braukt/` · `/uchus-vodit/`)

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `p4-index` | `/macos-braukt/` | `/uchus-vodit/` | pillar-хаб | `PillarIndexTemplate` | Ф4 | — | static-content | план |
| `p4-trakeris` | `/macos-braukt/nodarbibu-trakeris/` | `/uchus-vodit/treker-zanyatij/` | трекер занятий | `ToolPageTemplate` (account) | Ф4 | ★★ | `user_state` | план |
| `p4-prasmju-karte` | `/macos-braukt/prasmju-karte/` | `/uchus-vodit/karta-navykov/` | карта навыков | `ToolPageTemplate` | Ф4 | ★ | `user_state` | план |
| `p4-iemanas-index` | `/macos-braukt/iemanas/` | `/uchus-vodit/navyki/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-parkinga` | `/macos-braukt/iemanas/parallela-stavvieta/` | `/uchus-vodit/navyki/parallelnaya-parkovka/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-atpakalgaita` | `/macos-braukt/iemanas/atpakalgaita/` | `/uchus-vodit/navyki/zadnim-hodom/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-aplis` | `/macos-braukt/iemanas/aplis/` | `/uchus-vodit/navyki/krugovoe-dvizhenie/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-parbuve` | `/macos-braukt/iemanas/parbuve/` | `/uchus-vodit/navyki/perestroenie/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-kalns` | `/macos-braukt/iemanas/kalns/` | `/uchus-vodit/navyki/podyom-v-gorku/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-sajugs` | `/macos-braukt/iemanas/sajugs/` | `/uchus-vodit/navyki/sceplenie/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-iemanas-ziema` | `/macos-braukt/iemanas/ziema/` | `/uchus-vodit/navyki/zimnee-vozhdenie/` | гайд-навык | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-instruktors-index` | `/macos-braukt/instruktors/` | `/uchus-vodit/instruktor/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф4 | — | static-content | план |
| `p4-instruktors-tavas-tiesibas` | `/macos-braukt/instruktors/tavas-tiesibas/` | `/uchus-vodit/instruktor/tvoi-prava/` | права ученика | `ToolPageTemplate` | Ф4 | ★★ | static-content | план |
| `p4-instruktors-mainit` | `/macos-braukt/instruktors/mainit-instruktoru/` | `/uchus-vodit/instruktor/smenit-instruktora/` | смена + генератор заявления | `ToolPageTemplate` | Ф4 | ★ | static-content (шаблон заявления) | план |
| `p4-instruktors-e-csdd` | `/macos-braukt/instruktors/e-csdd-parbaude/` | `/uchus-vodit/instruktor/proverka-v-e-csdd/` | проверка регистрации | `ToolPageTemplate` | Ф4 | ★ | static-content (HowTo, внешняя проверка) | план |
| `p4-instruktors-karogi` | `/macos-braukt/instruktors/sarkanie-karogi/` | `/uchus-vodit/instruktor/krasnye-flagi/` | справочная статья | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-bailes-index` | `/macos-braukt/bailes/` | `/uchus-vodit/strahi/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф4 | — | static-content | план |
| `p4-bailes-brauksanas` | `/macos-braukt/bailes/brauksanas-bailes/` | `/uchus-vodit/strahi/strah-vozhdeniya/` | cornerstone-гайд | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-bailes-panika` | `/macos-braukt/bailes/panika/` | `/uchus-vodit/strahi/panika/` | скрипт-гайд | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-bailes-signale` | `/macos-braukt/bailes/signale-no-aizmugures/` | `/uchus-vodit/strahi/signalyat-szadi/` | скрипт-гайд | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-bailes-eksamena` | `/macos-braukt/bailes/eksamena-bailes/` | `/uchus-vodit/strahi/strah-ekzamena/` | гайд | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-bailes-kauns` | `/macos-braukt/bailes/kauns-pec-neveiksmes/` | `/uchus-vodit/strahi/styd-posle-neudachi/` | гайд | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-automats-manuala` | `/macos-braukt/automats-vai-manuala/` | `/uchus-vodit/avtomat-ili-mehanika/` | справочная статья | `ArticleTemplate` | Ф4 | — | static-content | план |
| `p4-zimes` | `/macos-braukt/zimes/` | `/uchus-vodit/znaki/` | справочник знаков | `ToolPageTemplate` | Ф4 | ★ | static-content (структурированный справочник) | план |
| `p4-termini` | `/macos-braukt/termini/` | `/uchus-vodit/sroki/` | таймлайн и дедлайны | `ToolPageTemplate` | Ф4 | ★ | `user_state` | план |

## Pillar 5 — Я водитель (`/esmu-vaditajs/` · `/ya-voditel/`)

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `p5-index` | `/esmu-vaditajs/` | `/ya-voditel/` | pillar-хаб | `PillarIndexTemplate` | Ф3 | — | static-content | план |
| `p5-jaunais-vaditajs` | `/esmu-vaditajs/jaunais-vaditajs/` | `/ya-voditel/novyj-voditel/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-pirmie-10` | `/esmu-vaditajs/pirmie-10-braucieni/` | `/ya-voditel/pervye-10-poezdok/` | план-чек-лист | `ToolPageTemplate` | Ф3 | ★ | static-content | план |
| `p5-sodi` | `/esmu-vaditajs/sodi/` | `/ya-voditel/shtrafy/` | справочник штрафов | `ToolPageTemplate` | Ф3 | ★★ | static-content (реестр штрафов, версионируемый) | план |
| `p5-punkti` | `/esmu-vaditajs/punkti/` | `/ya-voditel/punkty/` | пункты + калькулятор | `ToolPageTemplate` | Ф3 | ★ | static-content | план |
| `p5-csn-negadijums` | `/esmu-vaditajs/csn-negadijums/` | `/ya-voditel/dtp/` | что делать при ДТП + PDF | `ToolPageTemplate` | Ф3 | ★★ | static-content (PDF-актив) | план |
| `p5-policija` | `/esmu-vaditajs/policija/` | `/ya-voditel/policiya/` | скрипт-гайд | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-pirma-masina-index` | `/esmu-vaditajs/pirma-masina/` | `/ya-voditel/pervaya-mashina/` | подраздел-хаб | `SubsectionIndexTemplate` | Ф3 | — | static-content | план |
| `p5-pirma-masina-ka-izveleties` | `/esmu-vaditajs/pirma-masina/ka-izveleties/` | `/ya-voditel/pervaya-mashina/kak-vybrat/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-pirma-masina-parbaude` | `/esmu-vaditajs/pirma-masina/parbaude-pirms-pirksanas/` | `/ya-voditel/pervaya-mashina/proverka-pered-pokupkoj/` | чек-лист | `ToolPageTemplate` | Ф3 | ★ | static-content | план |
| `p5-pirma-masina-kalkulators` | `/esmu-vaditajs/pirma-masina/uzturesanas-kalkulators/` | `/ya-voditel/pervaya-mashina/kalkulyator-soderzhaniya/` | калькулятор содержания | `ToolPageTemplate` | Ф3 | ★ | `cost_model` (отдельный набор коэффициентов) | план |
| `p5-pirma-masina-octa` | `/esmu-vaditajs/pirma-masina/octa/` | `/ya-voditel/pervaya-mashina/octa/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-pirma-masina-kasko` | `/esmu-vaditajs/pirma-masina/kasko/` | `/ya-voditel/pervaya-mashina/kasko/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-pirma-masina-tehapskate` | `/esmu-vaditajs/pirma-masina/tehniska-apskate/` | `/ya-voditel/pervaya-mashina/tehosmotr/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-pirma-masina-registracija` | `/esmu-vaditajs/pirma-masina/registracija/` | `/ya-voditel/pervaya-mashina/registraciya/` | HowTo | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-ziemas-riepas` | `/esmu-vaditajs/ziemas-riepas/` | `/ya-voditel/zimnie-shiny/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-vinjete` | `/esmu-vaditajs/vinjete/` | `/ya-voditel/vinjetka/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |
| `p5-stavvietas` | `/esmu-vaditajs/stavvietas/` | `/ya-voditel/stoyanki/` | справочная статья | `ArticleTemplate` | Ф3 | — | static-content | план |

## Категории (масштабирование)

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `cat-index` | `/kategorijas/` | `/kategorii/` | хаб категорий | `CategoryHubTemplate` | Ф5 | — | static-content | план |
| `cat-a` … `cat-95-kods` | `/kategorijas/a/` … `/kategorijas/95-kods/` (12 кодов: a, a1, a2, am, b1, be, b96, c, c1, ce, d, 95-kods) | те же слаги (коды категорий не переводятся) | категория-хаб | `CategoryHubTemplate` | Ф5 | — | static-content | план — **см. дефект D-04**, `noindex` до наполнения |

## Конверсия

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `apply-index` | `/pieteikties/` | `/zapisatsya/` | форма записи (маршрутизация) | `FormTemplate` | Ф3 | ★★ | `schools` (`is_partner: true`) | план — **БЛОКИРУЮЩЕЕ**, см. docs/09-legal-gdpr.md |
| `apply-fors` | `/pieteikties/fors/` | `/zapisatsya/fors/` | форма записи, предзаполнена FORS | `FormTemplate` | Ф3 | ★★ | `schools` | план — **БЛОКИРУЮЩЕЕ** |

## Служебные и футер

| route_id | путь LV | путь RU | тип | шаблон | фаза | инстр. | источник | статус |
|---|---|---|---|---|---|---|---|---|
| `about` | `/par-mums/` | `/o-nas/` | статичная страница | `ArticleTemplate` | Ф0 | — | static-content | в проде (T-016) |
| `contacts` | `/kontakti/` | `/kontakty/` | статичная страница | `ArticleTemplate` | Ф0 | — | static-content | в проде (T-024, плейсхолдер) |
| `privacy` | `/privatuma-politika/` | `/politika-konfidencialnosti/` | юридическая страница | `ArticleTemplate` | Ф0 | — | static-content | в проде (T-024, плейсхолдер) — контент **БЛОКИРУЮЩЕЕ** для `apply-*` до финального текста (T-075), см. docs/09 |
| `blog-index` | `/blogs/` | `/blog/` | новости изменений в правилах | `BlogIndexTemplate` | Ф5 | — | static-content (Content Collections) | план |
| `blog-post` | `/blogs/{slug}/` | `/blog/{slug}/` | пост | `BlogPostTemplate` | Ф5 | — | static-content | план |

---

## Итог по объёму

126 уникальных `route_id` (без учёта динамических инстансов `/skola/{slug}/`,
которых столько же, сколько школ в открытых данных CSDD, и постов блога) ×
2 языка ≈ **250+ реальных URL** на момент полного разворачивания дерева до
Ф5. Число «~150 URL» из брифа, видимо, считает route_id без удвоения на язык
и без учёта поздних Ф5-категорий — порядок величины совпадает.

---

## Найденные проблемы дерева и предложенные исправления

### D-01. Два подраздела Pillar 1 — тупики без инструмента
`/baltas-tiesibas/` (`ka-sanemt`, `macities-ar-vecakiem`, `atbildiba`) и
`/arzemniekiem/` (`apmaina`, `ukrainai`, `english`) не имеют ни одного
инструмента внутри подраздела — нарушение принципа 7.1 «текст без инструмента
— тупик» (в интерпретации «на уровне подраздела», см. `A-04` в
docs/00-assumptions.md).

**Исправление (без добавления нового инструмента с нуля, чтобы не раздувать
Ф2):**
- `/baltas-tiesibas/ka-sanemt/` получает `Callout`-блок со ссылкой на
  `p1-soli-pa-solim` (интерактивный чек-лист 9 шагов) — белые права там уже
  шаг №2 результата визарда, естественная точка входа.
- `/arzemniekiem/apmaina/` и `/arzemniekiem/ukrainai/` получают `Callout` со
  ссылкой на `wizard` (визард «Твой путь») — оба сценария («меняю права»,
  «гражданин Украины») можно закрыть отдельной веткой в визарде на будущее,
  а сейчас — явным переходом к нему.

### D-02. Слаг `/eksamens/` используется дважды с разным смыслом
`/csdd-eksameni/teorija/eksamens/` («разбор экзамена теории») и
`/csdd-eksameni/vadisana/eksamens/` («разбор процедуры вождения») — разные
родители, поэтому URL технически не коллизируют, но одинаковый слаг создаёт
риск путаницы в: аналитике (события по `route_id` спасают, но не по «человеческому»
имени), тестах (`data-testid`, если по слагу), поисковой выдаче (оба фрагмента
могут называться «Экзамен» в сниппете). **Исправление:** оставить URL как
есть (он корректен и соответствует правилу «слаг на языке раздела»), но
завести уникальные `route_id` (уже сделано в таблице выше — `p2-teorija-eksamens`
/ `p2-vadisana-eksamens`) и уникальные `<title>`/H1 («Экзамен теории: как
устроен» vs «Экзамен вождения: как устроена процедура»).

### D-03. `/skola/{slug}/` в дереве Модуля 7 нарисован вложенным, а в правилах — плоским
Разобрано как `A-05` в docs/00-assumptions.md. Принято решение: маршрут
плоский, вне `/autoskolas/`. Зафиксировано в таблице выше строкой `school-card`.

### D-04. `/kategorijas/*` — 12 страниц без контента до Ф5
Хаб категорий явно помечен в Модуле 7 как «масштабирование» — то есть эти 12
страниц не имеют наполнения до Ф5. Риск: если роуты будут задеплоены раньше
контента (например, как побочный эффект генерации sitemap на Ф0), пустые
страницы попадут в индекс и получат сигнал низкого качества от поисковика.
**Исправление:** маршруты физически не существуют до Ф5 (не 404, а просто
отсутствуют в роутинге) — это проще и безопаснее, чем городить `noindex` на
заглушку, которую всё равно никто не должен видеть раньше времени.

### D-05. Инструменты на границе 3 кликов не имеют запаса на breadcrumbs
Все инструменты внутри подразделов 3-го уровня (`p2-teorija-testi`,
`p2-vadisana-zonas`, `p2-nenokartoju-protokols`, `p5-pirma-masina-*`,
`p4-iemanas-*`, `p4-instruktors-*`, `p4-bailes-*`) уже используют весь лимит
«максимум 3 клика». **Следствие для дизайна навигации (см. docs/05):**
хлебные крошки — это HTML-разметка для SEO/доступности (Schema.org
`BreadcrumbList`), не дополнительный уровень кликабельной вложенности;
подраздел-хаб (`SubsectionIndexTemplate`) не должен требовать отдельного
клика «Далее» перед тем, как показать список инструментов/статей — все
дочерние ссылки видны на самой хаб-странице.

### D-06. Методика рейтинга — потенциальный дубль (`A-06`)
`/autoskolas/metodologija/` и упоминание «методика рейтинга» в подвале (7.4)
трактуются как одна и та же страница; в реестре нет отдельного `route_id` для
общесайтовой страницы `/metodologija/`. Если заказчик имел в виду отдельную
страницу — завести `route_id: methodology-global` и развести контент (общая
философия честности портала vs формула конкретного рейтинга).
