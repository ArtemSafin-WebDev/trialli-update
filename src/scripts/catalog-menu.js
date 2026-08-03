const catalogRoots = document.querySelectorAll("[data-tri-home]");

if (catalogRoots.length) {
  const assetRoot = "/assets/trialli-catalog";
  const categories = [
    "Тормозная система",
    "Амортизаторы и опоры",
    "Ремни и ролики",
    "Система выпуска отработавших газов",
    "Ступицы и подшипники ступиц",
    "Сцепление",
    "ШРУСы и приводы",
    "Газовые упоры",
    "Подшипники",
    "Прокладки",
  ];
  const levelTwo = [
    "Дисковая тормозная система",
    "Элементы гидравлической системы",
    "Барабанная тормозная система",
    "Ассортимент для грузовых автомобилей",
  ];
  const levelThree = [
    "Диски тормозные",
    "Колодки тормозные дисковые",
    "Датчики износа",
    "Кожухи тормозные",
    "Суппорты тормозные",
  ];
  const levelFour = [
    "Диски тормозные",
    "Колодки тормозные дисковые",
    "Датчики износа",
    "Кожухи тормозные",
    "Суппорты тормозные",
  ];

  const itemTemplate = (items, level, activeIndex = -1) =>
    items
      .map(
        (item, index) => `
          <button
            class="tri-catalog-menu__item${index === activeIndex ? " is-active" : ""}"
            type="button"
            data-catalog-level="${level}"
            data-catalog-index="${index}"
          >
            <span>${item}</span>
            ${level < 4 ? "<span aria-hidden=\"true\">›</span>" : ""}
          </button>
        `,
      )
      .join("");

  const template = () => `
    <section class="tri-catalog-menu" hidden data-catalog-menu aria-label="Каталог товаров">
      <button class="tri-catalog-menu__backdrop" type="button" aria-label="Закрыть каталог" data-catalog-close></button>
      <div class="tri-catalog-menu__shell">
        <header class="tri-catalog-menu__header">
          <a class="tri-catalog-menu__logo" href="/" aria-label="TRIALLI">
            <img src="/assets/trialli-home/logo.svg" alt="" />
          </a>
          <button class="tri-catalog-menu__close" type="button" data-catalog-close><span>Каталог</span></button>
          <form class="tri-catalog-menu__search" action="/" role="search">
            <input type="search" name="q" placeholder="Искать на сайте..." autocomplete="off" />
            <button type="submit" aria-label="Найти">⌕</button>
          </form>
          <a class="tri-catalog-menu__cart" href="/#popular" aria-label="Корзина">
            <span aria-hidden="true">⌑</span><b>3</b>
          </a>
        </header>
        <div class="tri-catalog-menu__body">
          <div class="tri-catalog-menu__tree">
            ${categories
              .map(
                (name, index) => `
                  <button
                    class="tri-catalog-menu__category${index === 0 ? " is-active" : ""}"
                    type="button"
                    data-catalog-category="${index}"
                  >
                    <img src="${assetRoot}/icon-${String(Math.min(index + 1, 7)).padStart(2, "0")}.svg" alt="" />
                    <span>${name}</span>
                    ${index === 0 ? '<i aria-hidden="true">›</i>' : ""}
                  </button>
                `,
              )
              .join("")}
          </div>
          <div class="tri-catalog-menu__column" data-catalog-column="2">
            <a class="tri-catalog-menu__all" href="/#categories">Все товары · 1 123</a>
            <div class="tri-catalog-menu__items">${itemTemplate(levelTwo, 2)}</div>
          </div>
          <div class="tri-catalog-menu__column" data-catalog-column="3" hidden>
            <a class="tri-catalog-menu__all" href="/#categories">Все товары · 123</a>
            <div class="tri-catalog-menu__items">${itemTemplate(levelThree, 3)}</div>
          </div>
          <div class="tri-catalog-menu__column" data-catalog-column="4" hidden>
            <a class="tri-catalog-menu__all" href="/#categories">Все товары · 56</a>
            <div class="tri-catalog-menu__items">${itemTemplate(levelFour, 4)}</div>
          </div>
        </div>
      </div>
    </section>
  `;

  catalogRoots.forEach((root) => {
    root.insertAdjacentHTML("beforeend", template());
    const modal = root.querySelector("[data-catalog-menu]");
    const columns = {
      2: root.querySelector('[data-catalog-column="2"]'),
      3: root.querySelector('[data-catalog-column="3"]'),
      4: root.querySelector('[data-catalog-column="4"]'),
    };

    const setOpen = (open) => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        if (open) window.location.href = "/#categories";
        return;
      }
      modal.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
      root.querySelectorAll("[data-catalog-toggle]").forEach((toggle) => {
        toggle.setAttribute("aria-expanded", String(open));
      });
      if (open) modal.querySelector(".tri-catalog-menu__close")?.focus();
    };

    const resetChildren = () => {
      columns[3].hidden = true;
      columns[4].hidden = true;
      columns[2].querySelectorAll(".tri-catalog-menu__item").forEach((item) => {
        item.classList.remove("is-active", "is-subtle-active");
      });
    };

    root.addEventListener("click", (event) => {
      const target = event.target.closest(
        "[data-catalog-toggle], [data-catalog-close], [data-catalog-category], [data-catalog-level]",
      );
      if (!target) return;

      if (target.matches("[data-catalog-toggle]")) {
        event.preventDefault();
        setOpen(modal.hidden);
        return;
      }

      if (target.matches("[data-catalog-close]")) {
        setOpen(false);
        return;
      }

      if (target.matches("[data-catalog-category]")) {
        root.querySelectorAll("[data-catalog-category]").forEach((button) => {
          button.classList.toggle("is-active", button === target);
          const arrow = button.querySelector("i");
          if (arrow) arrow.remove();
          if (button === target) button.insertAdjacentHTML("beforeend", '<i aria-hidden="true">›</i>');
        });
        resetChildren();
        return;
      }

      const level = Number(target.dataset.catalogLevel);
      target.parentElement.querySelectorAll(".tri-catalog-menu__item").forEach((item) => {
        item.classList.toggle("is-active", item === target);
      });

      if (level === 2) {
        columns[3].hidden = false;
        columns[4].hidden = true;
      } else if (level === 3) {
        target.classList.add("is-subtle-active");
        columns[4].hidden = false;
      } else if (level === 4) {
        window.location.href = "/#categories";
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) setOpen(false);
    });
  });
}
