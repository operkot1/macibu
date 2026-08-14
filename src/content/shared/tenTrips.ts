/*
 * tenTrips — единый источник данных для чек-листа "Pirmie 10 braucieni"
 * (p5-pirmie-10, T-084). Тот же паттерн, что nineSteps.ts (T-036/T-037):
 * общие LV/RU данные, используемые в StepListInteractive. В отличие от
 * nineSteps — нет отдельного длинного `text` (страница на ToolPageTemplate,
 * не MDX-статья), только короткая практическая подсказка `note`,
 * рендерящаяся прямо в строке чек-листа.
 *
 * Порядок — от простого к сложному (знакомый маршрут → погода/видимость →
 * шоссе → интенсивный трафик → точная парковка → незнакомый маршрут →
 * ночь), не выдуманная последовательность, а общепринятая логика
 * постепенного усложнения самостоятельной практики.
 */

export interface TenTripsStep {
  title: string;
  note: string;
}

export const tenTrips: Record<"lv" | "ru", TenTripsStep[]> = {
  lv: [
    {
      title: "Aplis ap kvartālu pazīstamā vietā",
      note: "Izvēlies mierīgu ielu dienas laikā — mērķis ir pierast pie automašīnas bez instruktora, ne nobraukt tālu.",
    },
    {
      title: "Jau zināms maršruts",
      note: "Brauc uz vietu, kur biji ar instruktoru vairākas reizes — bez laika spiediena.",
    },
    {
      title: "Parkošanās tukšā stāvlaukumā",
      note: "Pamēģini vairākus leņķus tukšā vietā, pirms dari to aizņemtā stāvlaukumā.",
    },
    {
      title: "Brauciens lietū",
      note: "Sāc ar vieglu lietu, ne stipru lietusgāzi — pieradini sevi pie slapja ceļa un sliktākas redzamības.",
    },
    {
      title: "Brauciens krēslā",
      note: "Pievērs uzmanību lukturu ieslēgšanai laikā un samazinātai redzamībai.",
    },
    {
      title: "Pirmā iebraukšana ātrgaitas ceļā",
      note: "Izvēlies mazāk noslogotu laiku, koncentrējies uz iebraukšanu un joslu maiņu.",
    },
    {
      title: "Brauciens pilsētas centrā",
      note: "Vairāk krustojumu, gājēju un velosipēdistu — brauc lēnāk, nekā šķiet vajadzīgs.",
    },
    {
      title: "Paralēlā parkošanās uz ielas",
      note: "Šoreiz ar reālām automašīnām apkārt, ne tukšā laukumā.",
    },
    {
      title: "Brauciens uz nezināmu galamērķi",
      note: "Izmanto navigāciju un pieņem, ka kaut kas var noiet ne pēc plāna — tā ir daļa no mācīšanās.",
    },
    {
      title: "Nakts brauciens",
      note: "Tikai pēc tam, kad jūties brīvi dienas gaismā — samazināta redzamība maina visu.",
    },
  ],
  ru: [
    {
      title: "Круг по кварталу в знакомом месте",
      note: "Выбери спокойную улицу днём — цель привыкнуть к машине одному, а не проехать далеко.",
    },
    {
      title: "Уже знакомый маршрут",
      note: "Поезжай туда, куда ездил с инструктором несколько раз — без спешки.",
    },
    {
      title: "Парковка на пустой стоянке",
      note: "Потренируй разные углы на пустом месте, прежде чем делать это на занятой стоянке.",
    },
    {
      title: "Поездка в дождь",
      note: "Начни с лёгкого дождя, не с ливня — привыкни к мокрой дороге и худшей видимости.",
    },
    {
      title: "Поездка в сумерках",
      note: "Обрати внимание на своевременное включение фар и сниженную видимость.",
    },
    {
      title: "Первый выезд на скоростную дорогу",
      note: "Выбери менее загруженное время, сосредоточься на въезде и перестроении.",
    },
    {
      title: "Поездка в центре города",
      note: "Больше перекрёстков, пешеходов и велосипедистов — езжай медленнее, чем кажется нужным.",
    },
    {
      title: "Параллельная парковка на улице",
      note: "На этот раз с реальными машинами вокруг, не на пустой площадке.",
    },
    {
      title: "Поездка в незнакомое место",
      note: "Используй навигацию и будь готов, что что-то пойдёт не по плану — это часть обучения.",
    },
    {
      title: "Ночная поездка",
      note: "Только после того, как чувствуешь себя уверенно днём — сниженная видимость меняет всё.",
    },
  ],
};
