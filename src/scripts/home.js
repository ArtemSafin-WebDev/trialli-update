const root = document.querySelector("[data-tri-home]");

if (root) {
  const assetRoot = "/assets/trialli-home";

  const categories = [
    ["Тормозная система", 2040],
    ["Амортизаторы и опоры", 2040],
    ["Ремни и ролики", 2040],
    ["Система выпуска отработавших газов", 2040],
    ["Ступицы и ремкомплекты", 2040],
    ["Сцепление", 2040],
    ["ШРУСы и приводы", 2040],
    ["Газовые упоры и электроприводы", 2040],
    ["Подшипники", 2040],
    ["Прокладки", 2040],
    ["Резинотехнические изделия", 2040],
    ["Рулевое управление и подвеска", 2040],
    ["Амортизаторы кабин", 2040],
    ["Оси ступицы заднего колеса", 2040],
    ["Пружины", 2040],
    ["Реклама TRIALLI", 2040],
  ];

  const weekly = [
    ["Тормозная система", 67],
    ["Амортизаторы и опоры", 25],
    ["Ремни и ролики", 200],
    ["Система выпуска отработавших газов", 200],
    ["Подшипники", 200],
    ["Прокладки", 200],
    ["Прокладки", 200],
    ["Рулевое управление и подвеска", 200],
    ["Рулевое управление и подвеска", 200],
    ["Рулевое управление и подвеска", 200],
    ["Рулевое управление и подвеска", 200],
  ];

  const pickerFields = [
    {
      id: "brand",
      label: "Марка",
      options: () => ["LADA", "Volkswagen", "KIA", "Hyundai", "ГАЗ"],
    },
    {
      id: "model",
      label: "Модель",
      options: (state) => {
        const models = {
          LADA: ["Vesta", "Granta", "Niva Travel"],
          Volkswagen: ["Tiguan", "Polo", "Passat"],
          KIA: ["Rio", "Sportage", "Ceed"],
          Hyundai: ["Solaris", "Creta", "Tucson"],
          "ГАЗ": ["Газель Next", "Соболь", "Валдай"],
        };
        return models[state.brand] || [];
      },
    },
    {
      id: "year",
      label: "Год",
      options: () => ["2024", "2023", "2022", "2021", "2020", "2019", "2018"],
    },
    {
      id: "engine",
      label: "Объем двигателя",
      options: () => ["1.4 л", "1.6 л", "2.0 л", "2.4 л", "2.8 л"],
    },
    {
      id: "modification",
      label: "Модификация",
      options: () => ["Бензин, АКПП", "Бензин, МКПП", "Дизель, АКПП"],
    },
    {
      id: "group",
      label: "Группа товаров",
      options: () => categories.slice(0, 10).map(([name]) => name),
    },
  ];

  const pickerState = {
    mode: "vehicle",
    brand: "",
    model: "",
    year: "",
    engine: "",
    modification: "",
    group: "",
    openedField: "",
    vin: "",
  };

  const categoryTrack = root.querySelector("[data-categories-track]");
  const weeklyTrack = root.querySelector("[data-weekly-track]");
  const productsRoot = root.querySelector("[data-products]");
  const productIcons = {
    discount: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="12" fill="#203840"></rect>
        <path d="M15.7482 7.01584C16.0751 7.01895 16.3885 7.15032 16.6197 7.38147C16.8506 7.61278 16.9825 7.92604 16.9854 8.25289C16.9881 8.57988 16.8615 8.89517 16.6343 9.1304L9.14533 16.6185C9.03026 16.7376 8.89281 16.8334 8.74065 16.8988C8.58867 16.9641 8.42457 16.9984 8.25918 17C8.09376 17.0014 7.92842 16.9698 7.77527 16.9073C7.62222 16.8447 7.48274 16.7511 7.36572 16.6343C7.2488 16.5174 7.15543 16.3778 7.09268 16.2248C7.03 16.0716 6.99868 15.9065 7.00004 15.741C7.00148 15.5755 7.03594 15.4117 7.10121 15.2596C7.16662 15.1073 7.26115 14.9688 7.38034 14.8537L14.8693 7.36563C15.1047 7.1383 15.4209 7.013 15.7482 7.01584Z" fill="white"></path>
        <path d="M15.1278 13.2401C15.6239 13.2402 16.1005 13.4378 16.4515 13.7885C16.8022 14.1394 16.9999 14.616 17 15.1121C16.9998 15.6084 16.8024 16.0847 16.4515 16.4357C16.1005 16.7866 15.6241 16.984 15.1278 16.9841C14.6316 16.984 14.155 16.7863 13.804 16.4357C13.4533 16.0848 13.2557 15.6082 13.2555 15.1121C13.2556 14.6158 13.453 14.1395 13.804 13.7885C14.155 13.4375 14.6313 13.2402 15.1278 13.2401Z" fill="white"></path>
        <path d="M8.88692 7C9.3831 7.00014 9.8597 7.19773 10.2107 7.54844C10.5613 7.89937 10.7591 8.37594 10.7592 8.87202C10.759 9.36828 10.5616 9.84467 10.2107 10.1956C9.85967 10.5465 9.38326 10.7439 8.88692 10.744C8.39077 10.7439 7.91416 10.5462 7.56318 10.1956C7.21245 9.84471 7.01483 9.36811 7.01467 8.87202C7.01477 8.37569 7.21218 7.89942 7.56318 7.54844C7.91421 7.19747 8.39051 7.0001 8.88692 7Z" fill="white"></path>
      </svg>
    `,
    plus: `
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 2C8.17681 2 8.34666 2.07029 8.47168 2.19531C8.5966 2.32032 8.66699 2.49026 8.66699 2.66699V7.33301L13.333 7.33301C13.5097 7.33301 13.6797 7.4034 13.8047 7.52832C13.9297 7.65334 14 7.82319 14 8C14 8.17681 13.9297 8.34666 13.8047 8.47168C13.6797 8.5966 13.5097 8.66699 13.333 8.66699L8.66699 8.66699L8.66699 13.333C8.66699 13.5097 8.5966 13.6797 8.47168 13.8047C8.34666 13.9297 8.17681 14 8 14C7.82319 14 7.65334 13.9297 7.52832 13.8047C7.4034 13.6797 7.33301 13.5097 7.33301 13.333L7.33301 8.66699H2.66699C2.49026 8.66699 2.32032 8.5966 2.19531 8.47168C2.07029 8.34666 2 8.17681 2 8C2 7.82319 2.07029 7.65334 2.19531 7.52832C2.32032 7.4034 2.49026 7.33301 2.66699 7.33301L7.33301 7.33301L7.33301 2.66699C7.33301 2.49026 7.4034 2.32032 7.52832 2.19531C7.65334 2.07029 7.82319 2 8 2Z"></path>
      </svg>
    `,
    minus: `
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13.333 7.33301V8.66699H2.66699V7.33301H13.333Z"></path>
      </svg>
    `,
    copy: `
      <svg viewBox="0 0 10 10" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 3.5C8.82843 3.5 9.5 4.17157 9.5 5V8C9.5 8.82843 8.82843 9.5 8 9.5H5C4.17157 9.5 3.5 8.82843 3.5 8V5C3.5 4.17157 4.17157 3.5 5 3.5H8ZM5 4.5C4.72386 4.5 4.5 4.72386 4.5 5V8C4.5 8.27614 4.72386 8.5 5 8.5H8C8.27614 8.5 8.5 8.27614 8.5 8V5C8.5 4.72386 8.27614 4.5 8 4.5H5Z"></path>
        <path d="M5 0C6.10457 0 7 0.895431 7 2H5C3 2 2 3 2 5V7C0.895431 7 4.83199e-08 6.10457 0 5V2C0 0.895431 0.895431 4.83192e-08 2 0H5Z"></path>
      </svg>
    `,
  };
  const productImage = `${assetRoot}/product.png`;
  const products = Array.from({ length: 16 }, (_, index) => ({
    id: `lrac-${1980 + index}`,
    code: "LRAC 1980",
    name: "Суппорт тормозной<br />для автомобилей Лада",
    imageAlt: "Суппорт тормозной для автомобилей Лада",
    images: [productImage, productImage, productImage],
    price: "2 710 ₽",
    oldPrice: "3 710 ₽",
    isNew: [1, 2, 5, 6, 8, 9, 10, 13].includes(index),
    isLow: [4, 12].includes(index),
  }));

  if (categoryTrack) {
    const categoryOrder = categories.flatMap((_, index) =>
      index < 8 ? [index, index + 8] : [],
    );
    categoryTrack.innerHTML = categoryOrder
      .map((categoryIndex) => {
        const [name, count] = categories[categoryIndex];
        return `
          <a class="tri-home-category-card swiper-slide" href="#popular">
            <span class="tri-home-category-card__name">${name}</span>
            <img
              class="tri-home-category-card__shadow"
              src="${assetRoot}/category-card-shadow.webp"
              width="512"
              height="512"
              alt=""
              aria-hidden="true"
            />
            <img
              class="tri-home-category-card__art"
              src="${assetRoot}/category-card-art-${String(categoryIndex + 1).padStart(2, "0")}.webp"
              width="374"
              height="374"
              alt=""
              loading="${categoryIndex > 5 ? "lazy" : "eager"}"
            />
            <span class="tri-home-category-card__count">&gt;${count} SKU</span>
          </a>
        `;
      })
      .join("");

    const categoriesSliderElement = root.querySelector(
      "[data-categories-slider]",
    );
    if (categoriesSliderElement && typeof window.Swiper === "function") {
      const updateCategoriesEdges = (swiper) => {
        const shell = swiper.el.closest(
          ".tri-home-categories__slider-shell",
        );
        shell?.classList.toggle("is-at-start", swiper.isBeginning);
        shell?.classList.toggle("is-at-end", swiper.isEnd);
      };

      new window.Swiper(categoriesSliderElement, {
        slidesPerView: "auto",
        spaceBetween: window.innerWidth >= 768 ? 16 : 8,
        speed: 450,
        watchOverflow: true,
        grabCursor: true,
        grid: {
          rows: 2,
          fill: "column",
        },
        navigation: {
          prevEl: ".tri-home-categories__prev",
          nextEl: ".tri-home-categories__next",
        },
        pagination: {
          el: ".tri-home-categories__pagination",
          clickable: true,
        },
        on: {
          init: updateCategoriesEdges,
          beforeResize(swiper) {
            swiper.params.spaceBetween = window.innerWidth >= 768 ? 16 : 8;
          },
          resize: updateCategoriesEdges,
          slideChange: updateCategoriesEdges,
          transitionEnd: updateCategoriesEdges,
          reachBeginning: updateCategoriesEdges,
          reachEnd: updateCategoriesEdges,
          fromEdge: updateCategoriesEdges,
          paginationUpdate(swiper, paginationElement) {
            const bullets = [...paginationElement.children];
            const visibleCount = 5;
            const maxStart = Math.max(0, bullets.length - visibleCount);
            const start = Math.min(
              maxStart,
              Math.max(0, swiper.snapIndex - Math.floor(visibleCount / 2)),
            );

            bullets.forEach((bullet, index) => {
              bullet.classList.toggle(
                "is-visible",
                index >= start && index < start + visibleCount,
              );
            });
          },
        },
      });
    }
  }

  if (weeklyTrack) {
    weeklyTrack.innerHTML = weekly
      .map(
        ([name, count], index) => `
          <a class="tri-home-weekly-card swiper-slide" href="#popular">
            <span class="tri-home-weekly-card__media" aria-hidden="true">
              <img src="${assetRoot}/weekly-${index + 1}.webp" alt="" loading="${index < 4 ? "eager" : "lazy"}" />
            </span>
            <strong>${name}</strong>
            <span class="tri-home-weekly-card__actions">
              <span class="tri-home-weekly-card__sku">${count} SKU</span>
              <span class="tri-home-weekly-card__arrow" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M6.19529 3.52818C6.4556 3.26793 6.87733 3.26797 7.13767 3.52818L11.1377 7.52818C11.398 7.78851 11.398 8.21021 11.1377 8.47057L7.13767 12.4706C6.87733 12.7309 6.45564 12.7309 6.19529 12.4706C5.93507 12.2102 5.93498 11.7885 6.19529 11.5282L9.72361 7.99986L6.19529 4.47057C5.93507 4.21021 5.93498 3.78849 6.19529 3.52818Z"/>
                </svg>
              </span>
            </span>
          </a>
        `,
      )
      .join("");

    const weeklySliderElement = root.querySelector("[data-weekly-slider]");
    if (weeklySliderElement && typeof window.Swiper === "function") {
      const updateWeeklyEdges = (swiper) => {
        const shell = swiper.el.closest(".tri-home-weekly__slider-shell");
        shell?.classList.toggle("is-at-start", swiper.isBeginning);
        shell?.classList.toggle("is-at-end", swiper.isEnd);
      };

      new window.Swiper(weeklySliderElement, {
        slidesPerView: "auto",
        slidesPerGroup: 1,
        spaceBetween: 8,
        speed: 450,
        watchOverflow: true,
        grabCursor: true,
        navigation: {
          prevEl: ".tri-home-weekly__prev",
          nextEl: ".tri-home-weekly__next",
        },
        pagination: {
          el: ".tri-home-weekly__pagination",
          clickable: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            spaceBetween: 16,
          },
        },
        on: {
          init: updateWeeklyEdges,
          resize: updateWeeklyEdges,
          slideChange: updateWeeklyEdges,
        },
      });
    }
  }

  if (productsRoot) {
    /**
     * Единый HTML-шаблон товарной карточки. Данные можно заменить ответом API,
     * не дублируя разметку списка.
     */
    const productCardTemplate = (product, index) => `
      <li class="tri-home-products__item">
        <article class="tri-home-product-card" data-product-card data-product-id="${product.id}">
          <div class="tri-home-product-card__media">
            <div class="tri-home-product-card__tags">
              <span class="tri-home-product-card__discount" aria-label="Товар со скидкой">
                ${productIcons.discount}
              </span>
              ${product.isNew ? '<span class="tri-home-product-card__tag">Новинка</span>' : ""}
              ${product.isLow ? '<span class="tri-home-product-card__tag tri-home-product-card__tag--low">Скоро закончится</span>' : ""}
            </div>

            <div class="tri-home-product-card__gallery swiper" data-product-gallery aria-label="Галерея товара">
              <div class="swiper-wrapper">
                ${product.images
                  .map(
                    (image, imageIndex) => `
                      <div class="swiper-slide">
                        <img
                          class="tri-home-product-card__image"
                          src="${image}"
                          alt="${imageIndex === 0 ? product.imageAlt : ""}"
                          loading="${index > 3 || imageIndex > 0 ? "lazy" : "eager"}"
                        />
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>

            <div class="tri-home-product-card__thumbs swiper" data-product-thumbs aria-label="Миниатюры товара">
              <div class="swiper-wrapper">
                ${product.images
                  .map(
                    (image, imageIndex) => `
                      <button class="tri-home-product-card__thumb swiper-slide" type="button" aria-label="${imageIndex === 2 ? "Видео о товаре" : `Фото ${imageIndex + 1}`}">
                        <img src="${image}" alt="" loading="lazy" />
                        ${
                          imageIndex === 2
                            ? '<span class="tri-home-product-card__video"><img src="/assets/trialli-home/icon-play.svg" alt="" /></span>'
                            : ""
                        }
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div class="tri-home-product-card__body">
            <div class="tri-home-product-card__details">
              <a class="tri-home-product-card__title" href="#">${product.name}</a>
              <button class="tri-home-product-card__code" type="button" data-copy-code="${product.code}" aria-label="Скопировать артикул ${product.code}">
                <span>${product.code}</span>
                <span class="tri-home-product-card__copy">${productIcons.copy}</span>
              </button>
            </div>

            <span class="tri-home-product-card__divider" aria-hidden="true"></span>

            <div class="tri-home-product-card__price-row">
              <div class="tri-home-product-card__prices">
                <span class="tri-home-product-card__price">${product.price}</span>
                <span class="tri-home-product-card__old-price">${product.oldPrice}</span>
              </div>

              <form class="tri-home-product-card__cart" action="/cart/update/" method="post" data-product-cart data-quantity="0">
                <input type="hidden" name="id" value="${product.id}" />
                <button class="tri-home-product-card__add" type="submit" name="action" value="add" data-add-product aria-label="Добавить ${product.code} в корзину">
                  ${productIcons.plus}
                </button>
                <div class="tri-home-product-card__counter" data-product-counter hidden>
                  <button type="submit" name="action" value="decrease" aria-label="Уменьшить количество">
                    ${productIcons.minus}
                  </button>
                  <input class="tri-home-product-card__quantity" type="number" name="quantity" min="1" max="99" value="1" aria-label="Количество ${product.code}" />
                  <button type="submit" name="action" value="increase" aria-label="Увеличить количество">
                    ${productIcons.plus}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </article>
      </li>
    `;

    productsRoot.innerHTML = products.map(productCardTemplate).join("");

    if (typeof window.Swiper === "function") {
      productsRoot.querySelectorAll("[data-product-card]").forEach((card) => {
        const thumbsElement = card.querySelector("[data-product-thumbs]");
        const galleryElement = card.querySelector("[data-product-gallery]");
        const thumbs = new window.Swiper(thumbsElement, {
          slidesPerView: 3,
          spaceBetween: 5,
          watchSlidesProgress: true,
          slideToClickedSlide: true,
          observer: true,
          observeParents: true,
        });

        const gallery = new window.Swiper(galleryElement, {
          slidesPerView: 1,
          spaceBetween: 0,
          speed: 300,
          watchOverflow: true,
          observer: true,
          observeParents: true,
        });

        const syncThumbs = () => {
          thumbs.slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === gallery.activeIndex);
          });
          thumbs.slideTo(gallery.activeIndex);
        };

        thumbs.on("tap", () => {
          if (typeof thumbs.clickedIndex === "number") {
            gallery.slideTo(thumbs.clickedIndex);
          }
        });
        gallery.on("slideChange", syncThumbs);
        syncThumbs();
      });
    }
  }

  function isFieldEnabled(index) {
    if (index === 0) return true;
    return Boolean(pickerState[pickerFields[index - 1].id]);
  }

  function fieldTemplate(field, index) {
    const enabled = isFieldEnabled(index);
    const value = pickerState[field.id];
    const open = pickerState.openedField === field.id && enabled;
    const options = enabled ? field.options(pickerState) : [];

    return `
      <div class="tri-home-picker__field" data-picker-field="${field.id}">
        <button
          class="tri-home-picker__field-button${value ? " has-value" : ""}"
          type="button"
          ${enabled ? "" : "disabled"}
          aria-expanded="${open}"
          data-picker-field-toggle="${field.id}"
        >
          <span>${value || field.label}</span>
        </button>
        ${
          open
            ? `<div class="tri-home-picker__dropdown">
                ${options
                  .map(
                    (option) => `
                      <button type="button" data-picker-option="${field.id}" data-picker-value="${option}">${option}</button>
                    `,
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
    `;
  }

  function renderPickerFields() {
    root.querySelectorAll("[data-picker-fields]").forEach((host) => {
      host.innerHTML = pickerFields.map(fieldTemplate).join("");
    });

    const complete = pickerFields.every((field) => Boolean(pickerState[field.id]));
    root.querySelectorAll("[data-picker-submit]").forEach((button) => {
      button.disabled = !complete;
    });
  }

  function syncPickerMode() {
    root.querySelectorAll("[data-picker-mode]").forEach((button) => {
      button.setAttribute(
        "aria-selected",
        String(button.dataset.pickerMode === pickerState.mode),
      );
    });
    root.querySelectorAll("[data-picker-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.pickerPanel !== pickerState.mode;
    });
  }

  function syncVinState() {
    root.querySelectorAll("[data-picker-vin]").forEach((input) => {
      if (input.value !== pickerState.vin) input.value = pickerState.vin;
    });
    root.querySelectorAll("[data-picker-vin-submit]").forEach((button) => {
      button.disabled = pickerState.vin.trim().length < 5;
    });
  }

  function choosePickerValue(fieldId, value) {
    const fieldIndex = pickerFields.findIndex((field) => field.id === fieldId);
    if (fieldIndex < 0) return;

    pickerState[fieldId] = value;
    pickerFields.slice(fieldIndex + 1).forEach((field) => {
      pickerState[field.id] = "";
    });
    pickerState.openedField = "";
    renderPickerFields();
  }

  function createMobilePicker() {
    const host = root.querySelector("[data-mobile-picker-host]");
    const source = root.querySelector("[data-picker-form]");
    if (!host || !source) return;

    host.replaceChildren(source.cloneNode(true));
    renderPickerFields();
    syncPickerMode();
    syncVinState();
  }

  function setModal(modal, open) {
    if (!modal) return;
    modal.hidden = !open;
    root.classList.toggle(
      "is-modal-open",
      open || Boolean(root.querySelector(".tri-home-modal:not([hidden])")),
    );
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      requestAnimationFrame(() => {
        modal.querySelector("button, input")?.focus();
      });
    }
  }

  const pickerModal = root.querySelector("[data-picker-modal]");
  const requestModal = root.querySelector("[data-request-modal]");
  const homeHeader = root.querySelector("[data-tri-home-header]");
  const headerMenu = root.querySelector("[data-header-menu]");
  const headerMenuToggle = root.querySelector("[data-header-menu-toggle]");
  const historyPopover = root.querySelector("[data-picker-history-popover]");

  const sliderState = { categories: 0 };
  const sliderStep = { categories: 390 };

  function setHeaderMenu(open) {
    homeHeader?.classList.toggle("is-menu-open", open);
    headerMenu?.classList.toggle("is-open", open);
    headerMenu?.setAttribute("aria-hidden", String(!open));
    headerMenuToggle?.setAttribute("aria-expanded", String(open));
    headerMenuToggle?.setAttribute(
      "aria-label",
      open ? "Закрыть меню" : "Открыть меню",
    );
  }

  function clampProductQuantity(value) {
    return Math.max(1, Math.min(99, Number(value) || 1));
  }

  function setProductQuantity(cart, quantity) {
    const previous = Number(cart.dataset.quantity) || 0;
    const next = Math.max(0, Math.min(99, Number(quantity) || 0));
    const addButton = cart.querySelector("[data-add-product]");
    const counter = cart.querySelector("[data-product-counter]");
    const input = cart.querySelector(".tri-home-product-card__quantity");
    const headerCount = root.querySelector(".tri-home-header__cart-count");

    cart.dataset.quantity = String(next);
    if (addButton) addButton.hidden = next > 0;
    if (counter) counter.hidden = next === 0;
    if (input) input.value = String(next || 1);

    if (headerCount) {
      const current = Number(headerCount.textContent) || 0;
      headerCount.textContent = String(Math.max(0, current + next - previous));
    }

    return next;
  }

  root.addEventListener("click", async (event) => {
    const target = event.target.closest(
      "button, a, [data-picker-option], [data-history-vehicle]",
    );
    if (!target) return;

    if (target.matches("[data-header-menu-toggle]")) {
      const open = !headerMenu?.classList.contains("is-open");
      setHeaderMenu(open);
      return;
    }

    if (headerMenu?.contains(target) && target.matches("a")) {
      setHeaderMenu(false);
    }

    if (target.matches("[data-open-picker]")) {
      event.preventDefault();
      createMobilePicker();
      setModal(pickerModal, true);
      return;
    }

    if (target.matches("[data-close-picker]")) {
      setModal(pickerModal, false);
      return;
    }

    if (target.matches("[data-open-request]")) {
      setModal(requestModal, true);
      return;
    }

    if (target.matches("[data-close-request]")) {
      setModal(requestModal, false);
      return;
    }

    if (target.matches("[data-picker-mode]")) {
      pickerState.mode = target.dataset.pickerMode;
      pickerState.openedField = "";
      syncPickerMode();
      return;
    }

    if (target.matches("[data-picker-field-toggle]")) {
      const id = target.dataset.pickerFieldToggle;
      pickerState.openedField = pickerState.openedField === id ? "" : id;
      renderPickerFields();
      return;
    }

    if (target.matches("[data-picker-option]")) {
      choosePickerValue(
        target.dataset.pickerOption,
        target.dataset.pickerValue,
      );
      return;
    }

    if (target.matches("[data-picker-history]")) {
      const inModal = Boolean(target.closest("[data-picker-modal]"));
      if (inModal) {
        choosePickerValue("brand", "Volkswagen");
        choosePickerValue("model", "Tiguan");
        choosePickerValue("year", "2019");
      } else if (historyPopover) {
        const open = historyPopover.hidden;
        historyPopover.hidden = !open;
        target.setAttribute("aria-expanded", String(open));
      }
      return;
    }

    if (target.matches("[data-history-vehicle]")) {
      choosePickerValue("brand", target.dataset.brand);
      choosePickerValue("model", target.dataset.model);
      choosePickerValue("year", target.dataset.year);
      if (historyPopover) historyPopover.hidden = true;
      return;
    }

    const prev = target.dataset.sliderPrev;
    const next = target.dataset.sliderNext;
    const sliderName = prev || next;
    if (sliderName) {
      const track = root.querySelector(
        sliderName === "categories"
          ? "[data-categories-track]"
          : "[data-weekly-track]",
      );
      const max = 3;
      sliderState[sliderName] = Math.max(
        0,
        Math.min(
          max,
          sliderState[sliderName] + (next ? 1 : -1),
        ),
      );
      if (track) {
        track.style.transform = `translateX(-${sliderState[sliderName] * sliderStep[sliderName]}px)`;
      }
      return;
    }

    if (target.matches("[data-products-more]")) {
      const expanded = productsRoot?.classList.toggle("is-expanded");
      const label = target.querySelector("[data-products-more-label]");
      if (label) label.textContent = expanded ? "Свернуть" : "Показать еще";
      target.setAttribute("aria-expanded", String(Boolean(expanded)));
      return;
    }

    if (target.matches("[data-copy-code]")) {
      try {
        await navigator.clipboard.writeText(target.dataset.copyCode);
        showToast("Артикул скопирован");
      } catch {
        showToast(target.dataset.copyCode);
      }
      return;
    }
  });

  root.addEventListener("input", (event) => {
    if (event.target.matches(".tri-home-product-card__quantity")) {
      const cart = event.target.closest("[data-product-cart]");
      if (cart) setProductQuantity(cart, clampProductQuantity(event.target.value));
      return;
    }

    if (!event.target.matches("[data-picker-vin]")) return;
    pickerState.vin = event.target.value;
    syncVinState();
  });

  root.addEventListener("submit", (event) => {
    if (event.target.matches("[data-product-cart]")) {
      event.preventDefault();
      const cart = event.target;
      const action = event.submitter?.value || "update";
      const current = Number(cart.dataset.quantity) || 0;
      let next = current;

      if (action === "add") {
        next = 1;
      } else if (action === "increase") {
        next = Math.min(99, Math.max(1, current) + 1);
      } else if (action === "decrease") {
        next = current <= 1 ? 0 : current - 1;
      }

      setProductQuantity(cart, next);
      showToast(next > 0 ? `В корзине: ${next}` : "Товар удален из корзины");
      return;
    }

    if (event.target.matches("[data-picker-form]")) {
      event.preventDefault();
      showToast(
        pickerState.mode === "vin"
          ? `Ищем детали по запросу ${pickerState.vin}`
          : "Автомобиль выбран — переходим к каталогу",
      );
      setModal(pickerModal, false);
      const query =
        pickerState.mode === "vin"
          ? `?vin=${encodeURIComponent(pickerState.vin.trim())}`
          : "";
      window.setTimeout(() => {
        window.location.assign(`/pages/catalog-results.html${query}`);
      }, 250);
      return;
    }

    if (event.target.matches("[data-request-form]")) {
      event.preventDefault();
      if (!event.target.checkValidity()) {
        event.target.reportValidity();
        return;
      }
      event.target.reset();
      setModal(requestModal, false);
      showToast("Заявка отправлена");
    }
  });

  document.addEventListener("click", (event) => {
    if (
      historyPopover &&
      !historyPopover.hidden &&
      !historyPopover.contains(event.target) &&
      !event.target.closest("[data-picker-history]")
    ) {
      historyPopover.hidden = true;
    }

    if (
      pickerState.openedField &&
      !event.target.closest("[data-picker-field]")
    ) {
      pickerState.openedField = "";
      renderPickerFields();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setModal(pickerModal, false);
    setModal(requestModal, false);
    setHeaderMenu(false);
  });

  function showToast(message) {
    let toast = root.querySelector("[data-tri-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.dataset.triToast = "";
      Object.assign(toast.style, {
        position: "fixed",
        zIndex: "400",
        left: "50%",
        bottom: "100px",
        padding: "12px 18px",
        borderRadius: "24px",
        background: "#bed600",
        color: "#0d2026",
        fontWeight: "500",
        boxShadow: "0 16px 48px rgba(0,0,0,.3)",
        transform: "translateX(-50%)",
      });
      root.append(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  renderPickerFields();
  syncPickerMode();
  syncVinState();
  document.documentElement.dataset.triHomeReady = "true";
}
