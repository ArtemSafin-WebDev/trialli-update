const catalogRoots = document.querySelectorAll("[data-tri-home]");

const assetRoot = "/assets/trialli-catalog";

const leaf = (title, href = "/catalogue/") => ({ title, href });

const catalog = [
  {
    title: "Тормозная система",
    href: "/catalogue/tormoznaya-sistema/",
    icon: `${assetRoot}/category-brakes.svg`,
    count: "1 123",
    model: {
      src: `${assetRoot}/models/brakes.glb`,
      orbit: "-677.6deg 86.24deg 0.4901m",
      fieldOfView: "30deg",
    },
    children: [
      {
        title: "Дисковая тормозная система",
        href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/",
        count: "123",
        children: [
          leaf("Диски тормозные", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/diski-tormoznye/"),
          leaf("Колодки тормозные дисковые", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/kolodki-tormoznye-diskovye/"),
          {
            title: "Датчики износа",
            href: "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/datchiki-iznosa/",
            count: "56",
            children: [
              leaf("Датчики передних колодок"),
              leaf("Датчики задних колодок"),
              leaf("Универсальные датчики"),
            ],
          },
          leaf("Кожухи тормозные", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/kozhukhi-tormoznye/"),
          leaf("Суппорты тормозные", "/catalogue/tormoznaya-sistema/diskovaya-tormoznaya-sistema/supporty-tormoznye/"),
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

function arrowMarkup() {
  return '<span class="tri-catalog-menu__arrow" aria-hidden="true"></span>';
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

catalogRoots.forEach((root, rootIndex) => {
  root.insertAdjacentHTML("beforeend", template());

  const menu = root.querySelector("[data-catalog-menu]");
  const header = root.querySelector("[data-tri-home-header]");
  header?.append(menu);
  const panel = menu.querySelector(".tri-catalog-menu__panel");
  const columnsRoot = menu.querySelector("[data-catalog-columns]");
  const model = menu.querySelector("[data-catalog-model]");
  const preview = menu.querySelector("[data-catalog-preview]");
  const loader = menu.querySelector("[data-catalog-loader]");
  const toggles = root.querySelectorAll("[data-catalog-toggle]");
  const columnState = [];
  let activeCategory = 0;
  let closeTimer;
  let modelRequest = 0;

  menu.id = `tri-catalog-menu-${rootIndex + 1}`;
  toggles.forEach((toggle) => toggle.setAttribute("aria-controls", menu.id));

  const syncPanelPosition = () => {
    const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
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
    const catalogOpen = !menu.hidden;
    const modalOpen = Boolean(root.querySelector(".tri-home-modal:not([hidden])"));
    const mobileMenuOpen = Boolean(root.querySelector("[data-header-menu].is-open"));
    const locked = catalogOpen || modalOpen || mobileMenuOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };

  const setOpen = (open) => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      if (open) window.location.href = "/catalogue/";
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
      setOpen(menu.hidden || !menu.classList.contains("is-open"));
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
    if (event.key === "Escape" && !menu.hidden) setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (!menu.hidden) {
      syncPanelPosition();
      syncConnectors();
    }
  });

});
