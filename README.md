# TRIALLI — локальная многостраничная верстка

Минимальный Vite-проект для разработки новых страниц, совместимых с текущими
общими стилями и скриптами [trialli.ru](https://trialli.ru/).

## Команды

```bash
npm install
npm run dev
npm run build
```

В dev-режиме Vite локально отвечает пустой корзиной на автоматический запрос
`cart.js` к `/ajax/getCart.php`. Остальные Bitrix AJAX-обработчики намеренно не
подменяются.

Повторно забрать актуальные ресурсы с главной страницы:

```bash
npm run sync:trialli
```

## Структура

- `public/vendor/trialli/` — локальная копия CSS, JS и зависимостей из CSS;
- `public/vendor/trialli/manifest.json` — источник, размер и SHA-256 каждого файла;
- `public/assets/trialli-home/` — изображения и SVG новой главной из Figma;
- `public/assets/trialli-catalog/` — изображения и SVG каталога и выдачи;
- `src/partials/` — единственная разметка общих компонентов сайта;
- `src/styles/site-components.css` — единая точка входа общих стилей;
- `src/scripts/site.js` — общая логика шапки, меню и модальных окон;
- `src/scripts/components/parts-finder.js` — точка входа общего подборщика;
- `src/styles/home.css` — изолированные стили новой главной;
- `src/scripts/home.js` — только слайдеры и карточки главной;
- `src/styles/catalog-menu.css` / `src/scripts/catalog-menu.js` — четырёхуровневое
  меню каталога;
- `src/styles/page.css` — стили новой верстки;
- `src/scripts/page.js` — скрипты новой верстки;
- `pages/` — дополнительные HTML-страницы.

## Готовые страницы

- `/` — новая главная.
- `/auto-not-found.html` — VIN/госномер не найден, открыта форма запроса на подбор.
- `/pages/example.html` — пример второй страницы на общем каркасе.

## Общие компоненты

Vite раскрывает директивы `@include` на этапе dev-сервера и production-сборки.
В браузере и в собранном HTML никакого шаблонизатора нет.

```html
<head>
  <!-- @include /src/partials/site-head.html -->
  <link rel="stylesheet" href="/src/styles/my-page.css" />
</head>
<body class="tri-home-body">
  <div class="tri-home" data-tri-home data-site-shell>
    <!-- @include /src/partials/site-header.html -->
    <main>
      <!-- @include /src/partials/parts-finder.html -->
      <!-- уникальная разметка страницы -->
    </main>
    <!-- @include /src/partials/site-footer.html -->
    <!-- @include /src/partials/site-bottom-nav.html -->
    <!-- @include /src/partials/request-modal.html -->
  </div>
  <!-- @include /src/partials/site-scripts.html -->
  <script type="module" src="/src/scripts/my-page.js"></script>
</body>
```

Если нужно изменить шапку, подборщик, футер или общую модалку, меняется
соответствующий файл в `src/partials/`, а не копии на отдельных страницах.
Partial подборщика сам подключает его общую JS-точку входа.

Механизм include разрешает файлы только внутри `src/partials/`, поддерживает
вложенные partial-файлы и останавливает сборку при отсутствующем или циклическом
include. Изменения partial-файлов вызывают полную перезагрузку dev-страницы.

## Граница с существующим сайтом

`public/vendor/trialli/` — это снимок уже существующего сайта, а не исходники
новой верстки. Vite использует его только как внешнюю локальную зависимость:

- vendor-файлы не импортируются в наши JS/CSS;
- не минифицируются и не переименовываются;
- не копируются в `dist`;
- ссылки `/vendor/trialli/...` в собранном HTML остаются без изменений.

В `dist` попадают раскрытый HTML, новые проектные ассеты и два типа JS/CSS:
общий chunk `site-components` и страничные entry-файлы. Точные имена с хешами
записываются в `dist/.vite/manifest.json`. При переносе на готовый сайт общий
chunk подключается один раз в шаблоне сайта, а страничный entry — только на
нужной странице.

Скачанные файлы поставщика не редактируем вручную. При синхронизации абсолютные
ссылки `url(...)` внутри CSS автоматически переводятся на локальный
`/vendor/trialli/`, чтобы шрифты и изображения работали без исходного сервера.
Собственные CSS и JS подключаем после vendor-файлов. Для новых классов используем
свой префикс, чтобы не пересекаться с классами действующего сайта.

Главная страница использует префикс `tri-home-` и корневой контейнер
`[data-tri-home]`. Новые шапка, мобильная навигация и футер собраны по макетам
Figma и не зависят от старых классов `.header` и `.footer`.

Каталог дополнительно изолирован префиксом `tri-catalog-menu-`.

Скрипт синхронизации делит найденные на главной ресурсы на общие и
страничные. Все они сохраняются локально, но в стартовых HTML подключены только
общие. Страничные ресурсы можно добавить из `manifest.json` по необходимости.
