const resultsRoot = document.querySelector("[data-tri-results]");

if (resultsRoot) {
  const productsHost = resultsRoot.querySelector("[data-results-products]");
  const cartCount = resultsRoot.querySelector(".tri-home-header__cart-count");
  const sortToggle = resultsRoot.querySelector("[data-results-sort-toggle]");
  const sortMenu = resultsRoot.querySelector("[data-results-sort-menu]");
  const searchForm = resultsRoot.querySelector("[data-results-search]");
  const searchInput = searchForm?.querySelector("input");
  const resetButton = resultsRoot.querySelector("[data-results-reset]");
  const moreButton = resultsRoot.querySelector("[data-results-more]");
  const productData = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: "Суппорт тормозной для автомобилей Лада",
    code: `LRAC ${1980 + index * 10}`,
    price: 2710 + index * 70,
    oldPrice: 3710 + index * 90,
    sale: index % 3 !== 1,
    group: index % 4 === 0 ? "Амортизаторы и опоры" : "Тормозная система",
  }));
  const minPriceInput = resultsRoot.querySelector("[data-results-price-min]");
  const maxPriceInput = resultsRoot.querySelector("[data-results-price-max]");
  const priceRange = resultsRoot.querySelector("[data-results-range]");

  const money = (value) =>
    `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

  const renderProducts = () => {
    if (!productsHost) return;
    productsHost.innerHTML = productData
      .map(
        (product, index) => `
          <article class="tri-results-card" data-results-card data-price="${product.price}" data-sale="${product.sale}" data-group="${product.group}"${index > 8 ? " hidden" : ""}>
            <div class="tri-results-card__media">
              <span class="tri-results-card__badge" aria-label="TRIALLI">T</span>
              <img class="tri-results-card__main-image" src="/assets/trialli-catalog/result-product.png" alt="${product.title}" loading="${index > 2 ? "lazy" : "eager"}" />
              <div class="tri-results-card__thumbs" aria-label="Изображения товара">
                ${[0, 1, 2]
                  .map(
                    (_, thumbIndex) => `
                      <button class="tri-results-card__thumb${thumbIndex === 0 ? " is-active" : ""}" type="button" data-results-thumb aria-label="Фото ${thumbIndex + 1}">
                        <img src="/assets/trialli-catalog/result-product.png" alt="" />
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
            <div class="tri-results-card__body">
              <a class="tri-results-card__title" href="#">Суппорт тормозной<br />для автомобилей Лада</a>
              <div class="tri-results-card__code">
                <span>${product.code}</span>
                <button type="button" data-results-copy="${product.code}" aria-label="Скопировать артикул">▱</button>
              </div>
              <div class="tri-results-card__footer">
                <strong class="tri-results-card__price">${money(product.price)}</strong>
                <span class="tri-results-card__old">${money(product.oldPrice)}</span>
                <button class="tri-results-card__add" type="button" data-results-add aria-label="Добавить в корзину">+</button>
              </div>
            </div>
          </article>
        `,
      )
      .join("");
  };

  const currentCards = () =>
    Array.from(resultsRoot.querySelectorAll("[data-results-card]"));

  const updateResetState = () => {
    const dirty =
      Array.from(resultsRoot.querySelectorAll("[data-results-filter]")).some(
        (input) => input.checked,
      ) ||
      Boolean(resultsRoot.querySelector("[data-results-sale]")?.checked) ||
      Number(minPriceInput?.value) !== 459 ||
      Number(maxPriceInput?.value) !== 9999999 ||
      Boolean(searchInput?.value.trim());
    if (resetButton) resetButton.disabled = !dirty;
  };

  const filterProducts = () => {
    const query = searchInput?.value.trim().toLowerCase() || "";
    const saleOnly = Boolean(
      resultsRoot.querySelector("[data-results-sale]")?.checked,
    );
    const selectedGroups = Array.from(
      resultsRoot.querySelectorAll("[data-results-filter]:checked"),
      (input) => input.value,
    );
    const minPrice = Number(minPriceInput?.value) || 0;
    const maxPrice = Number(maxPriceInput?.value) || Number.POSITIVE_INFINITY;
    currentCards().forEach((card, index) => {
      const matchesQuery = card.textContent.toLowerCase().includes(query);
      const matchesSale = !saleOnly || card.dataset.sale === "true";
      const matchesGroup =
        !selectedGroups.length || selectedGroups.includes(card.dataset.group);
      const price = Number(card.dataset.price);
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const initialLimit = window.matchMedia("(max-width: 767px)").matches ? 8 : 9;
      const withinInitialPage =
        moreButton?.dataset.expanded === "true" || index < initialLimit;
      card.hidden = !(
        matchesQuery &&
        matchesSale &&
        matchesGroup &&
        matchesPrice &&
        withinInitialPage
      );
    });
    updateResetState();
  };

  renderProducts();
  filterProducts();

  resultsRoot.addEventListener("click", async (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.matches("[data-results-sort-toggle]")) {
      const open = sortMenu.hidden;
      sortMenu.hidden = !open;
      sortToggle.setAttribute("aria-expanded", String(open));
      return;
    }

    if (target.matches("[data-sort-value]")) {
      const mode = target.dataset.sortValue;
      productData.sort((a, b) => {
        if (mode === "price-asc") return a.price - b.price;
        if (mode === "price-desc") return b.price - a.price;
        return b.oldPrice - b.price - (a.oldPrice - a.price);
      });
      sortToggle.querySelector("span").textContent = target.textContent.trim();
      sortMenu.hidden = true;
      renderProducts();
      filterProducts();
      return;
    }

    if (target.matches("[data-results-more]")) {
      const expanded = target.dataset.expanded !== "true";
      target.dataset.expanded = String(expanded);
      target.textContent = expanded ? "▱  Свернуть" : "▱  Показать еще";
      filterProducts();
      return;
    }

    if (target.matches("[data-results-add]")) {
      const added = target.classList.toggle("is-added");
      target.textContent = added ? "✓" : "+";
      if (cartCount) {
        cartCount.textContent = String(
          Math.max(0, Number(cartCount.textContent) + (added ? 1 : -1)),
        );
      }
      return;
    }

    if (target.matches("[data-results-copy]")) {
      try {
        await navigator.clipboard.writeText(target.dataset.resultsCopy);
      } catch {
        // В локальном file:// режиме Clipboard API может быть недоступен.
      }
      target.textContent = "✓";
      window.setTimeout(() => {
        target.textContent = "▱";
      }, 1200);
      return;
    }

    if (target.matches("[data-results-thumb]")) {
      target
        .closest(".tri-results-card")
        ?.querySelectorAll("[data-results-thumb]")
        .forEach((thumb) => thumb.classList.toggle("is-active", thumb === target));
      return;
    }

    if (target.matches("[data-results-more-filters]")) {
      target.textContent =
        target.textContent.trim() === "Еще 6⌄" ? "Свернуть⌃" : "Еще 6⌄";
      return;
    }

    if (target.matches("[data-mobile-filters]")) {
      const sidebar = resultsRoot.querySelector(".tri-results-sidebar");
      const open = sidebar?.classList.toggle("is-mobile-open");
      target.setAttribute("aria-expanded", String(Boolean(open)));
      return;
    }

    if (target.matches("[data-view]")) {
      resultsRoot.querySelectorAll("[data-view]").forEach((button) => {
        button.classList.toggle("is-active", button === target);
      });
      productsHost?.classList.toggle("is-list", target.dataset.view === "list");
      return;
    }

    if (target.closest("[data-save-notice]") && target.tagName === "BUTTON") {
      target.closest("[data-save-notice]").hidden = true;
      return;
    }

    if (target.matches("[data-results-reset]")) {
      resultsRoot
        .querySelectorAll("[data-results-filter], [data-results-sale]")
        .forEach((input) => {
          input.checked = false;
        });
      if (searchInput) searchInput.value = "";
      if (minPriceInput) minPriceInput.value = "459";
      if (maxPriceInput) maxPriceInput.value = "9999999";
      if (priceRange) priceRange.value = "9999999";
      filterProducts();
    }
  });

  resultsRoot.addEventListener("change", (event) => {
    if (
      event.target.matches(
        "[data-results-filter], [data-results-sale], [data-results-price-min], [data-results-price-max], [data-results-range]",
      )
    ) {
      if (event.target.matches("[data-results-range]") && maxPriceInput) {
        maxPriceInput.value = event.target.value;
      }
      filterProducts();
    }
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    filterProducts();
  });

  searchInput?.addEventListener("input", filterProducts);

  document.addEventListener("click", (event) => {
    if (
      !sortMenu?.hidden &&
      !event.target.closest(".tri-results-sort")
    ) {
      sortMenu.hidden = true;
      sortToggle?.setAttribute("aria-expanded", "false");
    }
  });
}
