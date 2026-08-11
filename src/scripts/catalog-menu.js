const catalogRoots = document.querySelectorAll("[data-tri-home]");

const assetRoot = "/assets/trialli-catalog";

const leaf = (title, href = "/catalogue/") => ({ title, href });

const catalog = [
  {
    title: "Тормозная система",
    href: "/catalogue/tormoznaya-sistema/",
    icon: `${assetRoot}/category-brakes.svg`,
    count: "3 456",
    model: {
      src: `${assetRoot}/models/brakes.glb`,
      orbit: "-677.6deg 86.24deg 0.4901m",
      fieldOfView: "30deg",
    },
    children: [
      {
        title: "Дисковая тормозная система",
        href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/",
        count: "2 456",
        children: [
          leaf("Диски тормозные", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/diski-tormoznye/"),
          {
            title: "Колодки тормозные дисковые",
            href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/kolodki-tormoznye-diskovye/",
            children: [
              leaf("Колодки для легковых автомобилей"),
              leaf("Колодки для грузовых автомобилей"),
            ],
          },
          leaf("Датчики износа", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/datchiki-iznosa/"),
          {
            title: "Кожухи тормозные",
            href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/kozhukhi-tormoznye/",
            children: [leaf("Кожухи передние"), leaf("Кожухи задние")],
          },
          leaf("Суппорты тормозные", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/supporty-tormoznye/"),
          leaf("Суппорты тормозные RACE"),
          {
            title: "Скобы суппорта",
            href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/skoby-supporta/",
            children: [leaf("Скобы переднего суппорта"), leaf("Скобы заднего суппорта")],
          },
          leaf("Комплекты тормозов"),
          {
            title: "Цилиндры дискового тормоза",
            href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/cilindry/",
            children: [leaf("Цилиндры переднего тормоза"), leaf("Цилиндры заднего тормоза")],
          },
        ],
      },
      {
        title: "Элементы гидравлической системы",
        href: "/catalogue/tormoznaya-sistema/egsistemy/",
        count: "87",
        children: [
          leaf("Цилиндры тормозные"),
          leaf("Шланги тормозные"),
          leaf("Главные тормозные цилиндры"),
          leaf("Регуляторы давления"),
        ],
      },
      {
        title: "Барабанная тормозная система",
        href: "/catalogue/tormoznaya-sistema/barabannaya-tormoznaya-sistema/",
        count: "96",
        children: [
          leaf("Барабаны тормозные"),
          leaf("Колодки тормозные барабанные"),
          leaf("Цилиндры заднего тормоза"),
          leaf("Комплекты пружин"),
        ],
      },
      {
        title: "Ассортимент для грузовых автомобилей",
        href: "/catalogue/tormoznaya-sistema/adgruza/",
        count: "74",
        children: [
          leaf("Диски и барабаны"),
          leaf("Колодки"),
          leaf("Ремкомплекты"),
        ],
      },
    ],
  },
  {
    title: "Амортизаторы и опоры",
    href: "/catalogue/amortizatory-i-opory/",
    icon: `${assetRoot}/category-shock-absorbers.svg`,
    count: "842",
    model: { src: `${assetRoot}/models/shock-absorbers.glb` },
    children: [
      leaf("Амортизаторы подвески", "/catalogue/amortizatory-i-opory/amortizatory/"),
      leaf("Ремонтные комплекты амортизаторов", "/catalogue/amortizatory-i-opory/remontnye-komplekty-amortizatorov/"),
      leaf("Опоры передних стоек", "/catalogue/amortizatory-i-opory/opory-perednikh-stoek/"),
      leaf("Пневмобаллоны и пневмостойки", "/catalogue/amortizatory-i-opory/pnevmoballony-i-pnevmostoyki/"),
    ],
  },
  {
    title: "Ремни и ролики",
    href: "/catalogue/remni-i-roliki/",
    icon: `${assetRoot}/category-belts.svg`,
    count: "764",
    model: {
      src: `${assetRoot}/models/belts.glb`,
      orbit: "-36.98deg 77.9deg 0.8413m",
      fieldOfView: "30deg",
    },
    children: [
      {
        title: "Система ГРМ",
        href: "/catalogue/remni-i-roliki/sistema-grm/",
        count: "236",
        children: [leaf("Ремни ГРМ"), leaf("Ролики ГРМ"), leaf("Комплекты ГРМ")],
      },
      {
        title: "Система привода навесного оборудования",
        href: "/catalogue/remni-i-roliki/sistema-privoda-navesnogo-oborudovaniya/",
        count: "528",
        children: [leaf("Ремни приводные"), leaf("Ролики приводного ремня"), leaf("Натяжители")],
      },
    ],
  },
  {
    title: "Система выпуска отработавших газов",
    href: "/catalogue/sistema-vypuska-otrabotavshikh-gazov/",
    icon: `${assetRoot}/category-exhaust.svg`,
    count: "318",
    model: {
      src: `${assetRoot}/models/exhaust.glb`,
      orbit: "-420.9deg 77.9deg 6.504m",
      fieldOfView: "20.11deg",
    },
    children: [
      leaf("Элементы выхлопной системы", "/catalogue/sistema-vypuska-otrabotavshikh-gazov/evs/"),
      leaf("Ремонтные элементы выхлопной системы", "/catalogue/sistema-vypuska-otrabotavshikh-gazov/revs/"),
    ],
  },
  {
    title: "Ступицы и подшипники ступиц",
    href: "/catalogue/stupicy-i-remkomplekty/",
    icon: `${assetRoot}/category-hubs.svg`,
    count: "692",
    model: {
      src: `${assetRoot}/models/hubs.glb`,
      orbit: "-114.2deg 75deg 0.8768m",
      fieldOfView: "22.98deg",
    },
    children: [
      leaf("Ремонтные комплекты полуоси"),
      leaf("Подшипники полуоси"),
      leaf("Ступицы", "/catalogue/stupicy-i-remkomplekty/stupitsy/"),
      leaf("Ремонтные комплекты ступицы"),
      leaf("Подшипники ступицы"),
    ],
  },
  {
    title: "Сцепление",
    href: "/catalogue/sceplenie/",
    icon: `${assetRoot}/category-clutch.svg`,
    count: "584",
    model: {
      src: `${assetRoot}/models/clutch.glb`,
      orbit: "-503.9deg 75.36deg 0.9732m",
      fieldOfView: "30deg",
    },
    children: [
      leaf("Диски и корзины", "/catalogue/sceplenie/diski-i-korziny/"),
      leaf("Маховики", "/catalogue/sceplenie/mahoviki/"),
      leaf("Муфты и цилиндры", "/catalogue/sceplenie/mufty-i-cilindry/"),
    ],
  },
  {
    title: "ШРУСы и приводы",
    href: "/catalogue/sruhsy-i-privody/",
    icon: `${assetRoot}/category-cv-joints.svg`,
    count: "731",
    model: { src: `${assetRoot}/models/cv-joints.glb` },
    children: [
      leaf("Приводы", "/catalogue/sruhsy-i-privody/privody/"),
      leaf("Карданы", "/catalogue/sruhsy-i-privody/kardannyy-val-v-sbore/"),
      leaf("ШРУСы", "/catalogue/sruhsy-i-privody/shrusy/"),
      leaf("Ремонтные комплекты ШРУСов"),
      leaf("Крестовины"),
      leaf("Муфты карданного вала"),
      leaf("Опоры карданных валов"),
    ],
  },
  {
    title: "Газовые упоры",
    href: "/catalogue/gazovye-upory/",
    icon: `${assetRoot}/category-gas-struts.svg`,
  },
  {
    title: "Подшипники",
    href: "/catalogue/podshipniki/",
    icon: `${assetRoot}/category-bearings.svg`,
    count: "406",
    children: [leaf("Подшипники генератора"), leaf("Подшипники коленвала"), leaf("Подшипники КПП"), leaf("Ремонтные комплекты КПП")],
  },
  {
    title: "Прокладки",
    href: "/catalogue/prokladki/",
    icon: `${assetRoot}/category-gaskets.svg`,
    count: "512",
    children: [leaf("Прокладки ГБЦ"), leaf("Комплекты прокладок двигателя"), leaf("Прокладки поддона"), leaf("Прокладки клапанной крышки")],
  },
  {
    title: "Резинотехнические изделия",
    href: "/catalogue/rezinotekhnicheskie-izdeliya/",
    icon: `${assetRoot}/category-rubber.svg`,
    count: "267",
    children: [leaf("Маслосъёмные колпачки"), leaf("Сальники"), leaf("Пыльники"), leaf("Втулки")],
  },
  {
    title: "Рулевое управление и подвеска",
    href: "/catalogue/rulevoe-upravlenie-i-podveska/",
    icon: `${assetRoot}/category-steering-suspension.svg`,
    count: "1 028",
    children: [leaf("Рычаги подвески"), leaf("Шаровые опоры"), leaf("Наконечники рулевые"), leaf("Тяги стабилизатора")],
  },
  {
    title: "Снято с производства",
    href: "/catalogue/?discontinued=Y",
    icon: `${assetRoot}/category-discontinued.svg`,
  },
];

const collections = [
  { title: "Акции", href: "/catalogue/?sale=Y", icon: `${assetRoot}/collection-sale.svg` },
  { title: "Новинки", href: "/catalogue/?news=Y", icon: `${assetRoot}/collection-new.svg` },
  {
    title: "Запчасти для китайских авто",
    href: "/catalogue/?china=Y",
    icon: `${assetRoot}/collection-china.svg`,
  },
];

const mobileCategoryTitles = [
  "Тормозная система",
  "Амортизаторы и опоры",
  "Ремни и ролики",
  "Система выпуска отработавших газов",
  "Ступицы и ремкомплекты",
  "Сцепление",
  "ШРУСы и приводы",
  "Газовые упоры и электроприводы",
  "Подшипники",
  "Прокладки",
  "Резинотехнические изделия",
  "Рулевое управление и подвеска",
  "Амортизаторы кабин",
  "Оси ступицы заднего колеса",
  "Пружины",
  "Реклама TRIALLI",
];

const mobileCategoryExtras = [
  leaf("Амортизаторы кабин", "/catalogue/amortizatory-kabin/"),
  leaf("Оси ступицы заднего колеса", "/catalogue/osi-stupitsy/"),
  leaf("Пружины", "/catalogue/pruzhiny/"),
  leaf("Реклама TRIALLI", "/catalogue/reklama-trialli/"),
];

const mobileCatalog = [...catalog.slice(0, 12), ...mobileCategoryExtras].map(
  (item, index) => ({
    ...item,
    title: mobileCategoryTitles[index],
    mobileCount: "2040",
    mobileArt: `/assets/trialli-home/category-card-art-${String(index + 1).padStart(2, "0")}.webp`,
  }),
);

const mobileCollections = [
  { title: "Акции", href: "/catalogue/?sale=Y", icon: `${assetRoot}/mobile-sale.svg` },
  { title: "Новинки", href: "/catalogue/?news=Y", icon: `${assetRoot}/mobile-new.svg` },
  { title: "Запчасти для китайских авто", href: "/catalogue/?china=Y", icon: `${assetRoot}/mobile-china.svg` },
  { title: "Снято с производства", href: "/catalogue/?discontinued=Y", icon: `${assetRoot}/mobile-discontinued.svg` },
];

function arrowMarkup() {
  return '<span class="tri-catalog-menu__arrow" aria-hidden="true"></span>';
}

function mobileRightArrowMarkup() {
  return `<svg class="tri-catalog-mobile__arrow" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6.1952 3.52818C6.45551 3.26793 6.87724 3.26797 7.13758 3.52818L11.1376 7.52818C11.3979 7.78851 11.3979 8.21021 11.1376 8.47057L7.13758 12.4706C6.87723 12.7309 6.45555 12.7309 6.1952 12.4706C5.93497 12.2102 5.93489 11.7885 6.1952 11.5282L9.72352 7.99986L6.1952 4.47057C5.93497 4.21021 5.93489 3.78849 6.1952 3.52818Z" />
  </svg>`;
}

function mobileDownArrowMarkup() {
  return `<svg class="tri-catalog-mobile__arrow tri-catalog-mobile__arrow--down" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M12.1949 5.52925C12.4553 5.2689 12.877 5.2689 13.1373 5.52925C13.3975 5.78961 13.3976 6.21133 13.1373 6.47163L8.47033 11.1386C8.21 11.3984 7.78815 11.3986 7.52795 11.1386L2.86096 6.47163C2.60093 6.21143 2.60114 5.78958 2.86096 5.52925C3.12131 5.2689 3.54397 5.2689 3.80432 5.52925L7.99963 9.72456L12.1949 5.52925Z" />
  </svg>`;
}

function mobileBackArrowMarkup() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9.59473 18.4785C9.32957 18.4785 9.07522 18.373 8.8877 18.1855L3.23047 12.5283C3.04309 12.3408 2.9375 12.0864 2.9375 11.8213C2.93754 11.5562 3.04302 11.3017 3.23047 11.1143L8.8877 5.45703C9.0752 5.26968 9.32965 5.16504 9.59473 5.16504C9.85981 5.16505 10.1143 5.26966 10.3018 5.45703C10.4893 5.64457 10.5947 5.89982 10.5947 6.16504C10.5946 6.4301 10.4892 6.68464 10.3018 6.87207L6.35156 10.8213L20.4229 10.8213C20.6849 10.8258 20.9354 10.9332 21.1191 11.1201C21.3029 11.3071 21.4062 11.5591 21.4063 11.8213C21.4063 12.0835 21.3029 12.3354 21.1191 12.5225C20.9354 12.7094 20.685 12.8167 20.4229 12.8213L6.35156 12.8213L10.3018 16.7715C10.4892 16.959 10.5947 17.2134 10.5947 17.4785C10.5947 17.7437 10.4892 17.9981 10.3018 18.1855C10.1142 18.373 9.85989 18.4785 9.59473 18.4785Z" />
  </svg>`;
}

function categoryMarkup(item, index) {
  return `
    <a
      class="tri-catalog-menu__category${index === 0 ? " is-active" : ""}${item.children?.length ? " has-children" : ""}"
      href="${item.href}"
      data-catalog-category="${index}"
      aria-current="${index === 0 ? "true" : "false"}"
    >
      ${
        item.icon
          ? `<img src="${item.icon}" width="40" height="40" alt="" />`
          : `<span class="tri-catalog-menu__category-badge" aria-hidden="true">${item.badge}</span>`
      }
      <span>${item.title}</span>
      ${item.children?.length ? arrowMarkup() : ""}
    </a>
  `;
}

function collectionMarkup(item) {
  return `
    <a class="tri-catalog-menu__collection" href="${item.href}">
      <span class="tri-catalog-menu__collection-icon" aria-hidden="true">
        <span><img src="${item.icon}" width="24" height="24" alt="" /></span>
      </span>
      <span>${item.title}</span>
    </a>
  `;
}

function template() {
  return `
    <section class="tri-catalog-menu" hidden data-catalog-menu aria-label="Каталог товаров">
      <button class="tri-catalog-menu__backdrop" type="button" aria-label="Закрыть каталог" data-catalog-close></button>
      <div class="tri-catalog-menu__panel" role="dialog" aria-modal="true" aria-label="Каталог товаров">
        <div class="tri-catalog-menu__tree" data-catalog-tree>
          <div class="tri-catalog-menu__rail-content">
            <div class="tri-catalog-menu__categories">
              ${catalog.map(categoryMarkup).join("")}
            </div>
            <p class="tri-catalog-menu__group-label">Подборки</p>
            <div class="tri-catalog-menu__collections">
              ${collections.map(collectionMarkup).join("")}
            </div>
          </div>
        </div>
        <div class="tri-catalog-menu__columns" data-catalog-columns></div>
        <div class="tri-catalog-menu__preview" data-catalog-preview>
          <div class="tri-catalog-menu__glow" aria-hidden="true"></div>
          <div class="tri-catalog-menu__loader" data-catalog-loader>
            <span class="tri-catalog-menu__spinner" aria-hidden="true"></span>
            <span>Загружается превью товара</span>
          </div>
          <model-viewer
            class="tri-catalog-menu__model"
            data-catalog-model
            alt="3D-модель товара TRIALLI"
            camera-controls
            auto-rotate
            ar
            enable-pan
            interaction-prompt="none"
            tone-mapping="commerce"
            shadow-intensity="0"
            shadow-softness="0"
            loading="eager"
            reveal="auto"
            touch-action="none"
          ></model-viewer>
        </div>
      </div>
    </section>
  `;
}

function mobileTemplate() {
  return `
    <section
      class="tri-catalog-mobile"
      hidden
      role="dialog"
      aria-modal="true"
      aria-label="Каталог товаров"
      data-catalog-mobile
    >
      <img class="tri-catalog-mobile__blur" src="${assetRoot}/mobile-blur.svg" alt="" aria-hidden="true" />
      <div class="tri-catalog-mobile__scroller" data-catalog-mobile-scroller>
        <div class="tri-catalog-mobile__content" data-catalog-mobile-content></div>
      </div>
    </section>
  `;
}

function mobilePageHeaderMarkup(title) {
  return `
    <header class="tri-catalog-mobile__page-header">
      <button class="tri-catalog-mobile__back" type="button" aria-label="Назад" data-catalog-mobile-back>
        ${mobileBackArrowMarkup()}
      </button>
      <h2>${title}</h2>
    </header>
  `;
}

function mobileFirstLevelMarkup() {
  return `
    ${mobilePageHeaderMarkup("Каталог товаров")}
    <div class="tri-catalog-mobile__cards">
      ${mobileCatalog
        .map(
          (item, index) => `
            <a class="tri-catalog-mobile__card" href="${item.href}" data-catalog-mobile-category="${index}">
              <span class="tri-catalog-mobile__card-title">${item.title}</span>
              <img class="tri-catalog-mobile__card-shadow" src="/assets/trialli-home/category-card-shadow.webp" alt="" aria-hidden="true" />
              <img class="tri-catalog-mobile__card-art" src="${item.mobileArt}" alt="" ${index > 5 ? 'loading="lazy"' : ""} />
              <span class="tri-catalog-mobile__card-count">&gt;${item.mobileCount} SKU</span>
            </a>
          `,
        )
        .join("")}
    </div>
    <nav class="tri-catalog-mobile__collections" aria-label="Подборки каталога">
      ${mobileCollections
        .map(
          (item) => `
            <a class="tri-catalog-mobile__collection" href="${item.href}">
              <span class="tri-catalog-mobile__collection-icon"><img src="${item.icon}" width="24" height="24" alt="" /></span>
              <span>${item.title}</span>
              ${mobileRightArrowMarkup()}
            </a>
          `,
        )
        .join("")}
    </nav>
  `;
}

function mobileAllProductsMarkup(item) {
  return `
    <a class="tri-catalog-mobile__all" href="${item.href}">
      <span>Все товары</span>
      ${item.count ? `<span class="tri-catalog-mobile__count">${item.count}</span>` : ""}
      ${mobileRightArrowMarkup()}
    </a>
  `;
}

function mobileSecondLevelMarkup(item) {
  return `
    ${mobilePageHeaderMarkup(item.title)}
    <div class="tri-catalog-mobile__level-body">
      ${mobileAllProductsMarkup(item)}
      <nav class="tri-catalog-mobile__list" aria-label="${item.title}">
        ${(item.children ?? [])
          .map(
            (child, index) => `
              <a class="tri-catalog-mobile__list-item" href="${child.href}" data-catalog-mobile-item="${index}">
                <span>${child.title}</span>
                ${child.children?.length ? mobileRightArrowMarkup() : ""}
              </a>
            `,
          )
          .join("")}
      </nav>
    </div>
  `;
}

function mobileAccordionMarkup(item, index) {
  if (!item.children?.length) {
    return `<a class="tri-catalog-mobile__list-item" href="${item.href}"><span>${item.title}</span></a>`;
  }

  return `
    <div class="tri-catalog-mobile__accordion" data-catalog-mobile-accordion>
      <button
        class="tri-catalog-mobile__list-item tri-catalog-mobile__accordion-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="tri-catalog-mobile-accordion-${index}"
        data-catalog-mobile-accordion-toggle
      >
        <span>${item.title}</span>
        ${mobileDownArrowMarkup()}
      </button>
      <div class="tri-catalog-mobile__accordion-panel" id="tri-catalog-mobile-accordion-${index}">
        <div class="tri-catalog-mobile__accordion-inner">
          <a href="${item.href}">Все товары</a>
          ${item.children.map((child) => `<a href="${child.href}">${child.title}</a>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function mobileThirdLevelMarkup(item) {
  return `
    ${mobilePageHeaderMarkup(item.title)}
    <div class="tri-catalog-mobile__level-body">
      ${mobileAllProductsMarkup(item)}
      <nav class="tri-catalog-mobile__list tri-catalog-mobile__list--accordions" aria-label="${item.title}">
        ${(item.children ?? []).map(mobileAccordionMarkup).join("")}
      </nav>
    </div>
  `;
}

catalogRoots.forEach((root, rootIndex) => {
  root.insertAdjacentHTML("beforeend", template());
  root.insertAdjacentHTML("beforeend", mobileTemplate());

  const menu = root.querySelector("[data-catalog-menu]");
  const mobileMenu = root.querySelector("[data-catalog-mobile]");
  const mobileContent = mobileMenu.querySelector("[data-catalog-mobile-content]");
  const mobileScroller = mobileMenu.querySelector("[data-catalog-mobile-scroller]");
  const header = root.querySelector("[data-tri-home-header]");
  const stickyHeader = root.querySelector("[data-tri-home-header-sticky]");
  (stickyHeader ?? header)?.append(menu);
  const panel = menu.querySelector(".tri-catalog-menu__panel");
  const columnsRoot = menu.querySelector("[data-catalog-columns]");
  const model = menu.querySelector("[data-catalog-model]");
  const preview = menu.querySelector("[data-catalog-preview]");
  const loader = menu.querySelector("[data-catalog-loader]");
  const toggles = root.querySelectorAll("[data-catalog-toggle]");
  const bottomNav = root.querySelector(".tri-home-bottom-nav");
  const bottomCatalogToggle = bottomNav?.querySelector('[data-site-nav="catalog"]');
  const columnState = [];
  let activeCategory = 0;
  let closeTimer;
  let modelRequest = 0;
  let mobileCloseTimer;
  let mobilePath = [];
  let mobileTrigger = null;
  let mobileNavActive = [];
  let mobileHeaderWasScrolled = false;
  let mobileInertState = [];

  menu.id = `tri-catalog-menu-${rootIndex + 1}`;
  mobileMenu.id = `tri-catalog-mobile-${rootIndex + 1}`;
  toggles.forEach((toggle) => toggle.setAttribute("aria-controls", `${menu.id} ${mobileMenu.id}`));

  const syncPanelPosition = () => {
    const stickyHeaderRect = stickyHeader?.getBoundingClientRect();
    const headerRect = stickyHeaderRect?.height
      ? stickyHeaderRect
      : header?.getBoundingClientRect();
    const headerBottom = headerRect
      ? header.classList.contains("is-stuck")
        ? headerRect.top + 96
        : headerRect.bottom
      : 0;
    const availableHeight = Math.max(320, window.innerHeight - headerBottom - 16);
    menu.style.setProperty("--tri-catalog-available-height", `${Math.round(availableHeight)}px`);
  };

  const syncConnectors = () => {
    const panelRect = panel.getBoundingClientRect();
    columnsRoot.querySelectorAll("[data-catalog-connector]").forEach((connector) => {
      const depth = Number(connector.dataset.catalogConnector);
      const trigger = columnsRoot.querySelector(
        `[data-catalog-column="${depth - 1}"] [data-catalog-depth="${depth - 1}"].is-active`,
      );
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      connector.style.setProperty(
        "--tri-connector-top",
        `${triggerRect.top - panelRect.top + triggerRect.height / 2}px`,
      );
    });
  };

  const updateScrollLock = () => {
    const catalogOpen = !menu.hidden || !mobileMenu.hidden;
    const modalOpen = Boolean(root.querySelector(".tri-home-modal:not([hidden])"));
    const mobileMenuOpen = Boolean(root.querySelector("[data-header-menu].is-open"));
    const locked = catalogOpen || modalOpen || mobileMenuOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };

  const renderMobileLevel = () => {
    if (mobilePath.length === 0) {
      mobileContent.innerHTML = mobileFirstLevelMarkup();
    } else if (mobilePath.length === 1) {
      mobileContent.innerHTML = mobileSecondLevelMarkup(mobilePath[0]);
    } else {
      mobileContent.innerHTML = mobileThirdLevelMarkup(mobilePath[1]);
    }

    mobileScroller.scrollTop = 0;
    mobileContent.classList.remove("is-entering");
    requestAnimationFrame(() => mobileContent.classList.add("is-entering"));
  };

  const restoreMobileNavigation = () => {
    bottomNav?.querySelectorAll(".is-active").forEach((item) => item.classList.remove("is-active"));
    mobileNavActive.forEach((item) => item.classList.add("is-active"));
    mobileNavActive = [];
  };

  const setMobileOpen = (open) => {
    window.clearTimeout(mobileCloseTimer);
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(open)));

    if (open) {
      mobileNavActive = [...(bottomNav?.querySelectorAll(".is-active") ?? [])];
      bottomNav?.querySelectorAll(".is-active").forEach((item) => item.classList.remove("is-active"));
      bottomCatalogToggle?.classList.add("is-active");
      bottomNav?.classList.remove("is-scroll-hidden");

      root.querySelector("[data-header-menu]")?.classList.remove("is-open");
      root.querySelector("[data-header-menu-backdrop]")?.classList.remove("is-open");
      header?.classList.remove("is-menu-open");
      mobileHeaderWasScrolled = Boolean(header?.classList.contains("is-mobile-scrolled"));
      header?.classList.add("is-mobile-scrolled");

      mobilePath = [];
      renderMobileLevel();
      mobileInertState = [...root.children]
        .filter(
          (element) =>
            element !== mobileMenu &&
            element !== bottomNav &&
            !element.matches(".tri-home-header__slot"),
        )
        .map((element) => [element, element.inert]);
      mobileInertState.forEach(([element]) => {
        element.inert = true;
      });
      root.classList.add("tri-catalog-mobile-open");
      document.body.classList.add("tri-catalog-mobile-open");
      mobileMenu.hidden = false;
      requestAnimationFrame(() => {
        mobileMenu.classList.add("is-open");
        mobileMenu.querySelector("[data-catalog-mobile-back]")?.focus();
      });
      updateScrollLock();
      return;
    }

    mobileMenu.classList.remove("is-open");
    mobileCloseTimer = window.setTimeout(() => {
      mobileMenu.hidden = true;
      root.classList.remove("tri-catalog-mobile-open");
      document.body.classList.remove("tri-catalog-mobile-open");
      if (!mobileHeaderWasScrolled) header?.classList.remove("is-mobile-scrolled");
      mobileInertState.forEach(([element, inert]) => {
        element.inert = inert;
      });
      mobileInertState = [];
      restoreMobileNavigation();
      updateScrollLock();
      mobileTrigger?.focus();
      mobileTrigger = null;
    }, 180);
  };

  const setOpen = (open) => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileOpen(open);
      return;
    }

    window.clearTimeout(closeTimer);
    toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(open)));

    if (open) {
      syncPanelPosition();
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
      updateModel(catalog[activeCategory]);
      updateScrollLock();
      return;
    }

    menu.classList.remove("is-open");
    closeTimer = window.setTimeout(() => {
      menu.hidden = true;
      updateScrollLock();
    }, 180);
  };

  const renderColumn = (items, depth, parent, trigger = null) => {
    columnState.splice(depth - 2);
    columnState.push({ items, parent });

    columnsRoot.querySelectorAll("[data-catalog-column], [data-catalog-connector]").forEach((element) => {
      const elementDepth = Number(element.dataset.catalogColumn ?? element.dataset.catalogConnector);
      if (elementDepth >= depth) element.remove();
    });

    if (!items?.length || depth > 4) return;

    const column = document.createElement("div");
    column.className = "tri-catalog-menu__column";
    column.dataset.catalogColumn = String(depth);
    column.style.setProperty("--tri-column-index", String(depth - 2));
    column.innerHTML = `
      <a class="tri-catalog-menu__all" href="${parent.href}">Все товары <span>•</span> ${parent.count ?? ""}</a>
      <div class="tri-catalog-menu__items">
        ${items
          .map(
            (item, index) => `
              <a
                class="tri-catalog-menu__item"
                href="${item.href}"
                data-catalog-depth="${depth}"
                data-catalog-item="${index}"
                aria-current="false"
              >
                <span>${item.title}</span>
                ${item.children?.length ? arrowMarkup() : ""}
              </a>
            `,
          )
          .join("")}
      </div>
    `;

    if (trigger) {
      const connector = document.createElement("span");
      connector.className = "tri-catalog-menu__connector";
      connector.dataset.catalogConnector = String(depth);
      connector.setAttribute("aria-hidden", "true");
      connector.style.setProperty("--tri-column-index", String(depth - 2));
      columnsRoot.append(connector);
    }

    columnsRoot.append(column);
    syncConnectors();
  };

  const setActiveItem = (target, item, depth) => {
    const column = target.closest("[data-catalog-column]");
    column.querySelectorAll("[data-catalog-item]").forEach((link) => {
      const active = link === target;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-current", String(active));
    });

    columnsRoot.querySelectorAll("[data-catalog-column], [data-catalog-connector]").forEach((element) => {
      const elementDepth = Number(element.dataset.catalogColumn ?? element.dataset.catalogConnector);
      if (elementDepth > depth) element.remove();
    });

    if (item.children?.length) renderColumn(item.children, depth + 1, item, target);
  };

  const updateModel = (category) => {
    modelRequest += 1;
    const request = modelRequest;
    const config = category.model;

    preview.classList.toggle("has-model", Boolean(config));
    if (!config) {
      model.removeAttribute("src");
      loader.hidden = true;
      return;
    }

    loader.hidden = false;
    model.classList.remove("is-loaded");
    model.setAttribute("camera-orbit", config.orbit ?? "0deg 75deg auto");
    model.setAttribute("field-of-view", config.fieldOfView ?? "30deg");

    if (model.getAttribute("src") === config.src && model.loaded) {
      loader.hidden = true;
      model.classList.add("is-loaded");
      return;
    }

    model.setAttribute("src", config.src);
    const prepareMaterials = () => {
      // Повторяем обработку материалов с trialli.ru для корректных декалей
      // и прозрачных частей, но применяем её к каждой подгруженной модели.
      model.model?.materials?.forEach((material) => {
        if (material.name !== "Material") material.setAlphaMode("MASK");
        if (material.name?.includes("DECAL") && material.isLoaded) {
          material.setAlphaMode("MASK");
        }
      });
    };

    const onLoad = () => {
      if (request !== modelRequest) return;
      prepareMaterials();
      loader.hidden = true;
      model.classList.add("is-loaded");
    };
    model.addEventListener("load", onLoad, { once: true });
  };

  model.addEventListener("progress", (event) => {
    if (event.detail.totalProgress >= 1 && model.loaded) {
      loader.hidden = true;
      model.classList.add("is-loaded");
    }
  });

  const setActiveCategory = (index) => {
    const item = catalog[index];
    activeCategory = index;
    menu.querySelectorAll("[data-catalog-category]").forEach((link) => {
      const active = Number(link.dataset.catalogCategory) === index;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-current", String(active));
    });
    columnsRoot.replaceChildren();
    if (item.children?.length) renderColumn(item.children, 2, item);
    updateModel(item);
  };

  setActiveCategory(0);

  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-catalog-toggle]");
    if (toggle && root.contains(toggle)) {
      event.preventDefault();
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      mobileTrigger = mobile ? toggle : null;
      setOpen(
        mobile
          ? mobileMenu.hidden || !mobileMenu.classList.contains("is-open")
          : menu.hidden || !menu.classList.contains("is-open"),
      );
      return;
    }

    const mobileBack = event.target.closest("[data-catalog-mobile-back]");
    if (mobileBack && mobileMenu.contains(mobileBack)) {
      if (mobilePath.length === 0) {
        setMobileOpen(false);
      } else {
        mobilePath.pop();
        renderMobileLevel();
        mobileMenu.querySelector("[data-catalog-mobile-back]")?.focus();
      }
      return;
    }

    const mobileCategory = event.target.closest("[data-catalog-mobile-category]");
    if (mobileCategory && mobileMenu.contains(mobileCategory)) {
      const item = mobileCatalog[Number(mobileCategory.dataset.catalogMobileCategory)];
      if (item?.children?.length) {
        event.preventDefault();
        mobilePath = [item];
        renderMobileLevel();
      }
      return;
    }

    const mobileItem = event.target.closest("[data-catalog-mobile-item]");
    if (mobileItem && mobileMenu.contains(mobileItem)) {
      const parent = mobilePath[0];
      const item = parent?.children?.[Number(mobileItem.dataset.catalogMobileItem)];
      if (item?.children?.length) {
        event.preventDefault();
        mobilePath = [parent, item];
        renderMobileLevel();
      }
      return;
    }

    const accordionToggle = event.target.closest("[data-catalog-mobile-accordion-toggle]");
    if (accordionToggle && mobileMenu.contains(accordionToggle)) {
      const accordion = accordionToggle.closest("[data-catalog-mobile-accordion]");
      const open = !accordion.classList.contains("is-open");
      accordion.classList.toggle("is-open", open);
      accordionToggle.setAttribute("aria-expanded", String(open));
      return;
    }

    if (event.target.closest("[data-catalog-close]")) {
      setOpen(false);
      return;
    }

    const categoryLink = event.target.closest("[data-catalog-category]");
    if (categoryLink?.querySelector(".tri-catalog-menu__arrow")) {
      event.preventDefault();
      setActiveCategory(Number(categoryLink.dataset.catalogCategory));
      return;
    }

    const itemLink = event.target.closest("[data-catalog-item]");
    if (itemLink?.querySelector(".tri-catalog-menu__arrow")) {
      event.preventDefault();
      const depth = Number(itemLink.dataset.catalogDepth);
      const state = columnState[depth - 2];
      const item = state?.items[Number(itemLink.dataset.catalogItem)];
      if (item) setActiveItem(itemLink, item, depth);
    }
  });

  panel.addEventListener("pointerover", (event) => {
    if (event.pointerType === "touch") return;

    const categoryLink = event.target.closest("[data-catalog-category]");
    if (categoryLink && categoryLink !== event.relatedTarget?.closest?.("[data-catalog-category]")) {
      setActiveCategory(Number(categoryLink.dataset.catalogCategory));
      return;
    }

    const itemLink = event.target.closest("[data-catalog-item]");
    if (!itemLink || itemLink === event.relatedTarget?.closest?.("[data-catalog-item]")) return;
    const depth = Number(itemLink.dataset.catalogDepth);
    const state = columnState[depth - 2];
    const item = state?.items[Number(itemLink.dataset.catalogItem)];
    if (item) setActiveItem(itemLink, item, depth);
  });

  columnsRoot.addEventListener("scroll", syncConnectors, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!mobileMenu.hidden) setMobileOpen(false);
    else if (!menu.hidden) setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && !mobileMenu.hidden) setMobileOpen(false);
    if (!menu.hidden) {
      syncPanelPosition();
      syncConnectors();
    }
  });

});
