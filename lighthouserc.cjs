// Lighthouse CI — docs/10-quality-gates.md §1.
//
// INP (docs/10) — полевая метрика (реальные взаимодействия пользователя за
// время), синтетический Lighthouse-прогон физически не может её измерить.
// Стандартная лабораторная замена, которую использует сам Lighthouse/Google
// для approximating responsiveness, — Total Blocking Time (total-blocking-time).
// Используется здесь вместо буквального INP, порог 200ms сохранён.
//
// Настройки не переопределяют preset — Lighthouse по умолчанию использует
// mobile form factor + симулированный троттлинг (примерно соответствует
// "throttled Slow 4G" из docs/10, отдельного mobile-специфичного пресета не
// задаю, чтобы не переопределить дефолт на нечто менее строгое).

module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview",
      // "preview" — `wrangler pages dev` (T-005, адаптер Cloudflare
      // отключает `astro preview` целиком: "does not support the preview
      // command"), не Vite dev-сервер — паттерн готовности другой.
      startServerReadyPattern: "Ready on",
      url: ["http://localhost:4321/lv/", "http://localhost:4321/lv/par-mums/"],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
