import {
  bindProductCardInteractions,
  initProductCardGalleries,
  productCardTemplate,
} from "./components/product-card.js";

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

  const categoryTrack = root.querySelector("[data-categories-track]");
  const weeklyTrack = root.querySelector("[data-weekly-track]");
  const productsRoot = root.querySelector("[data-products]");
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
    productsRoot.innerHTML = products
      .map(
        (product, index) =>
          `<li class="tri-home-products__item">${productCardTemplate(product, index)}</li>`,
      )
      .join("");
    initProductCardGalleries(productsRoot);
  }

  bindProductCardInteractions(root);

  const sliderState = { categories: 0 };
  const sliderStep = { categories: 390 };

  root.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.matches("[data-open-parts-finder]")) {
      document.dispatchEvent(
        new CustomEvent("parts-finder:open-mobile", { bubbles: true }),
      );
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

  });

  document.documentElement.dataset.triHomeReady = "true";
}
