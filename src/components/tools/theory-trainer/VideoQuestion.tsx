/*
 * VideoQuestion — рендер видео-вопроса (T-067, расширение Trainer.tsx,
 * T-046). Реальных видео-вопросов в банке пока нет (media_url: null у
 * всех 25 вопросов src/content/theory-questions/b.json) — компонент
 * готов к использованию, маршрут p2-teorija-video не подключён (см.
 * docs/11-backlog.md, T-067). `media_url` — просто ссылка (string), без
 * допущений про конкретный видеохостинг — нативный <video>, не
 * YouTube/Vimeo-специфичный iframe.
 */

export interface VideoQuestionProps {
  mediaUrl: string;
}

export default function VideoQuestion({ mediaUrl }: VideoQuestionProps) {
  return (
    <video
      controls
      className="bg-neutral-900 mb-4 w-full rounded-md"
      src={mediaUrl}
    >
      Tavs pārlūks neatbalsta video atskaņošanu. / Ваш браузер не поддерживает
      воспроизведение видео.
    </video>
  );
}
