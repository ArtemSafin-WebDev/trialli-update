import "./page.js";
import {
  bindProductCardInteractions,
  initProductCardGalleries,
  productCardTemplate,
} from "./components/product-card.js";
import { setProductsMoreButtonExpanded } from "./components/products-more-button.js";

const root = document.querySelector("[data-catalog-results]");

if (root) {
  const PRICE_MIN = 459;
  const PRICE_MAX = 9999999;
  const PRICE_STEP = 100;

  const productSeed = [
    ["lrac-1980", "LRAC 1980", 2710, 3710, true],
    ["lrac-1920", "LRAC 1920", 2880, 3880, false],
    ["lrac-1750", "LRAC 1750", 3040, 4040, false],
    ["lrac-2160", "LRAC 2160", 2490, 3490, false],
    ["lrac-1810", "LRAC 1810", 3190, 4190, true],
    ["lrac-2240", "LRAC 2240", 2650, 3650, false],
    ["lrac-1990", "LRAC 1990", 2790, 3790, false],
    ["lrac-2010", "LRAC 2010", 2960, 3960, false],
    ["lrac-2090", "LRAC 2090", 3120, 4120, false],
    ["lrac-2180", "LRAC 2180", 3350, 4350, true],
    ["lrac-2210", "LRAC 2210", 3480, 4480, false],
    ["lrac-2300", "LRAC 2300", 3590, 4590, false],
  ].map(([id, code, price, oldPrice, isNew], popularity) => ({
    id,
    code,
    price,
    oldPrice,
    isNew,
    popularity,
    name: "Суппорт тормозной<br />для автомобилей Лада",
    imageAlt: "Суппорт тормозной для автомобилей Лада",
    images: Array(3).fill("/assets/trialli-catalog/result-product.png"),
  }));

  const state = {
    selected: new Map(),
    query: "",
    sort: "popular",
    sortDraft: "popular",
    sortOpen: false,
    filterOpen: false,
    showAll: false,
    view: "grid",
    draggingPrice: "",
    price: {
      min: PRICE_MIN,
      max: PRICE_MAX,
      currentMin: PRICE_MIN,
      currentMax: PRICE_MAX,
    },
  };

  const productsHost = root.querySelector("[data-products]");
  const sort = root.querySelector("[data-sort]");
  const filters = root.querySelector(".tri-results-filters");
  const search = root.querySelector("[data-catalog-search]");
  const desktopSortParent = sort?.parentElement;
  const mobileSortHost = root.querySelector("[data-mobile-sort-host]");
  const mobileMedia = window.matchMedia("(max-width: 767px)");

  const icons = {
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.47 3.53 3.53 3.53 3.53-3.53.94.94L8.94 8l3.53 3.53-.94.94L8 8.94l-3.53 3.53-.94-.94L7.06 8 3.53 4.47z"/></svg>',
  };

  const formatPrice = (price) => new Intl.NumberFormat("ru-RU").format(price);
  const parsePrice = (price) => Number(String(price).replace(/\D/g, ""));

  function hasActivePriceFilter() {
    return state.price.currentMin !== state.price.min || state.price.currentMax !== state.price.max;
  }

  function updatePriceControls() {
    const price = filters.querySelector("[data-price]");
    if (!price) return;

    const span = state.price.max - state.price.min;
    const minPercent = ((state.price.currentMin - state.price.min) / span) * 100;
    const maxPercent = ((state.price.currentMax - state.price.min) / span) * 100;
    const minInput = price.querySelector('[data-price-input="min"]');
    const maxInput = price.querySelector('[data-price-input="max"]');
    const minRange = price.querySelector('[data-price-range="min"]');
    const maxRange = price.querySelector('[data-price-range="max"]');
    const minHandle = price.querySelector('[data-price-handle="min"]');
    const maxHandle = price.querySelector('[data-price-handle="max"]');

    price.style.setProperty("--range-min", `${minPercent}%`);
    price.style.setProperty("--range-max", `${maxPercent}%`);
    minInput.value = formatPrice(state.price.currentMin);
    maxInput.value = formatPrice(state.price.currentMax);
    minRange.value = String(state.price.currentMin);
    maxRange.value = String(state.price.currentMax);
    minHandle.setAttribute("aria-valuenow", String(state.price.currentMin));
    minHandle.setAttribute("aria-valuetext", `${formatPrice(state.price.currentMin)} ₽`);
    minHandle.setAttribute("aria-valuemax", String(state.price.currentMax));
    maxHandle.setAttribute("aria-valuenow", String(state.price.currentMax));
    maxHandle.setAttribute("aria-valuetext", `${formatPrice(state.price.currentMax)} ₽`);
    maxHandle.setAttribute("aria-valuemin", String(state.price.currentMin));
  }

  function clampPrice(type, value) {
    const parsed = parsePrice(value);
    if (!Number.isFinite(parsed)) return;

    const next = Math.min(Math.max(parsed, state.price.min), state.price.max);
    if (type === "min") state.price.currentMin = Math.min(next, state.price.currentMax);
    else state.price.currentMax = Math.max(next, state.price.currentMin);
  }

  function setPriceFromPointer(type, clientX) {
    const slider = filters.querySelector(".tri-results-price__slider");
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const rawValue = state.price.min + percent * (state.price.max - state.price.min);
    clampPrice(type, Math.round(rawValue / PRICE_STEP) * PRICE_STEP);
    updatePriceControls();
    collectFilters();
  }

  function getHandleCenter(slider, type) {
    const handle = slider.querySelector(`[data-price-handle="${type}"]`);
    const rect = handle.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  function getVisibleProducts() {
    return [...productSeed];
  }

  function renderProducts() {
    const products = getVisibleProducts();
    productsHost.innerHTML = products.length
      ? products.map(productCardTemplate).join("")
      : '<p class="tri-results-empty">По вашему запросу ничего не найдено</p>';
    initProductCardGalleries(productsHost);
    productsHost.classList.toggle("is-list", state.view === "list");
    productsHost.classList.toggle("is-expanded", state.showAll);
    root.querySelector("[data-products-more]").hidden = products.length <= (mobileMedia.matches ? 8 : 9);
    syncTotals(products.length);
  }

  function collectFilters() {
    state.selected.clear();
    filters.querySelectorAll("input:checked").forEach((input) => {
      if (input.matches("[data-sale]")) {
        state.selected.set("sale", "Товары со скидкой");
        return;
      }
      const section = input.closest("[data-filter]");
      if (!section) return;
      const label = input.closest("label")?.textContent.trim();
      state.selected.set(`${section.dataset.filter}:${input.value}`, label);
    });
    if (hasActivePriceFilter()) {
      state.selected.set(
        "price",
        `Цена: ${formatPrice(state.price.currentMin)}–${formatPrice(state.price.currentMax)} ₽`,
      );
    }
    syncActiveFilters();
  }

  function syncTotals() {
    const factor = Math.max(1, 106 - Math.max(0, state.selected.size - 2) * 11);
    root.querySelectorAll("[data-total], [data-mobile-total]").forEach((node) => {
      node.textContent = String(factor);
    });
  }

  function syncActiveFilters() {
    const active = root.querySelector("[data-active-filters]");
    const tags = root.querySelector("[data-active-tags]");
    const values = Array.from(state.selected.entries());
    active.hidden = values.length === 0;
    tags.innerHTML = values
      .map(([key, label]) => `<button type="button" data-clear-filter="${key}"><span>${label}</span>${icons.close}</button>`)
      .join("");
    const count = root.querySelector("[data-filter-count]");
    count.textContent = String(values.length);
    count.hidden = values.length === 0;
    root.querySelectorAll("[data-reset-filters]").forEach((button) => {
      button.disabled = values.length === 0;
    });
    syncTotals();
  }

  function clearFilter(key) {
    if (key === "price") {
      state.price.currentMin = state.price.min;
      state.price.currentMax = state.price.max;
      updatePriceControls();
    } else if (key === "sale") {
      const sale = filters.querySelector("[data-sale]");
      if (sale) sale.checked = false;
    } else {
      const [group, value] = key.split(":");
      const input = Array.from(filters.querySelectorAll(`[data-filter="${group}"] input`)).find((item) => item.value === value);
      if (input) input.checked = false;
    }
    collectFilters();
  }

  function resetFilters() {
    filters.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach((input) => {
      input.checked = false;
    });
    state.price.currentMin = state.price.min;
    state.price.currentMax = state.price.max;
    updatePriceControls();
    collectFilters();
  }

  function setSortOpen(open) {
    state.sortOpen = open;
    root.classList.toggle("is-sort-open", open);
    sort.classList.toggle("is-open", open);
    sort.querySelector("[data-sort-toggle]").setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("tri-results-modal-open", open || state.filterOpen);
  }

  function applySort() {
    state.sort = state.sortDraft;
    const active = sort.querySelector(`[data-sort-value="${state.sort}"]`);
    sort.querySelector("[data-sort-label]").textContent = active?.textContent.trim() || "По популярности";
    sort.querySelectorAll("[data-sort-value]").forEach((option) => {
      const selected = option === active;
      option.classList.toggle("is-active", selected);
      option.setAttribute("aria-selected", String(selected));
    });
    setSortOpen(false);
  }

  function setFilterOpen(open) {
    state.filterOpen = open;
    root.classList.toggle("is-filter-open", open);
    root.querySelector("[data-filter-open]").setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("tri-results-modal-open", open || state.sortOpen);
  }

  function updateFilterSearch(filter) {
    const input = filter?.querySelector("[data-filter-search]");
    if (!input) return;

    const query = input.value.trim().toLocaleLowerCase("ru-RU");
    let visibleOptions = 0;
    filter.querySelectorAll(".tri-results-filter__options label").forEach((option) => {
      const label = option.querySelector("span")?.textContent.trim().toLocaleLowerCase("ru-RU") || "";
      const filtered = Boolean(query) && !label.includes(query);
      option.classList.toggle("is-filtered", filtered);
      if (!filtered) visibleOptions += 1;
    });

    filter.classList.toggle("is-search-empty", Boolean(query) && visibleOptions === 0);
    const clear = filter.querySelector("[data-filter-search-clear]");
    if (clear) clear.hidden = !query;
  }

  function setFilterExpanded(filter, expanded) {
    const button = filter?.querySelector("[data-filter-more]");
    if (!filter || !button) return;

    filter.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.querySelector("span").textContent = expanded ? "Свернуть" : button.dataset.moreLabel;

    if (!expanded) {
      const input = filter.querySelector("[data-filter-search]");
      if (input) input.value = "";
    }
    updateFilterSearch(filter);
  }

  function moveSortForViewport() {
    if (!sort || !desktopSortParent || !mobileSortHost) return;
    if (mobileMedia.matches) mobileSortHost.append(sort);
    else desktopSortParent.append(sort);
    setFilterOpen(false);
    setSortOpen(false);
    renderProducts();
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button, a");
    if (!button) return;

    if (button.matches("[data-sort-toggle]")) setSortOpen(!state.sortOpen);
    if (button.matches("[data-sort-close]")) setSortOpen(false);
    if (button.matches("[data-sort-value]")) {
      state.sortDraft = button.dataset.sortValue;
      sort.querySelectorAll("[data-sort-value]").forEach((option) => option.classList.toggle("is-active", option === button));
      if (!mobileMedia.matches) applySort();
    }
    if (button.matches("[data-sort-apply]")) applySort();
    if (button.matches("[data-filter-open]")) setFilterOpen(true);
    if (button.matches("[data-filter-close], [data-filter-apply]")) setFilterOpen(false);
    if (button.matches("[data-filter-more]")) {
      const filter = button.closest("[data-filter]");
      const expanded = !filter.classList.contains("is-expanded");
      setFilterExpanded(filter, expanded);
    }
    if (button.matches("[data-filter-search-clear]")) {
      const filter = button.closest("[data-filter]");
      const input = filter?.querySelector("[data-filter-search]");
      if (input) {
        input.value = "";
        updateFilterSearch(filter);
        input.focus();
      }
    }
    if (button.matches("[data-filter-search-submit]")) {
      const filter = button.closest("[data-filter]");
      const input = filter?.querySelector("[data-filter-search]");
      updateFilterSearch(filter);
      input?.focus();
    }
    if (button.matches("[data-reset-filters]")) resetFilters();
    if (button.matches("[data-clear-filter]")) clearFilter(button.dataset.clearFilter);
    if (button.matches("[data-products-more]")) {
      state.showAll = !state.showAll;
      productsHost.classList.toggle("is-expanded", state.showAll);
      setProductsMoreButtonExpanded(button, state.showAll);
    }
    if (button.matches("[data-view]")) {
      state.view = button.dataset.view;
      root.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("is-active", item === button));
      renderProducts();
    }
  });

  filters.addEventListener("change", (event) => {
    const priceInput = event.target.closest("[data-price-input]");
    const priceRange = event.target.closest("[data-price-range]");
    if (priceInput || priceRange) {
      const control = priceInput || priceRange;
      clampPrice(control.dataset.priceInput || control.dataset.priceRange, control.value);
      updatePriceControls();
    }
    collectFilters();
  });

  filters.addEventListener("input", (event) => {
    const input = event.target.closest("[data-filter-search]");
    if (input) updateFilterSearch(input.closest("[data-filter]"));
  });

  filters.addEventListener("wheel", (event) => {
    const options = event.target.closest(".tri-results-filter.is-expanded .tri-results-filter__options");
    if (!options || !event.deltaY) return;

    const scrollingUp = event.deltaY < 0;
    const optionsAtStart = options.scrollTop <= 0;
    const optionsAtEnd = Math.ceil(options.scrollTop + options.clientHeight) >= options.scrollHeight;
    if ((!scrollingUp && !optionsAtEnd) || (scrollingUp && !optionsAtStart)) return;

    const panelAtStart = filters.scrollTop <= 0;
    const panelAtEnd = Math.ceil(filters.scrollTop + filters.clientHeight) >= filters.scrollHeight;
    if ((scrollingUp && panelAtStart) || (!scrollingUp && panelAtEnd)) return;

    event.preventDefault();
    filters.scrollTop += event.deltaY;
  }, { passive: false });

  filters.addEventListener("pointerdown", (event) => {
    const slider = event.target.closest(".tri-results-price__slider");
    if (!slider) return;

    const handle = event.target.closest("[data-price-handle]");
    const type = handle?.dataset.priceHandle || (
      Math.abs(event.clientX - getHandleCenter(slider, "min")) <
      Math.abs(event.clientX - getHandleCenter(slider, "max"))
        ? "min"
        : "max"
    );

    event.preventDefault();
    handle?.focus();
    state.draggingPrice = type;
    filters.querySelector(`[data-price-handle="${type}"]`).classList.add("is-dragging");
    setPriceFromPointer(type, event.clientX);
  });

  filters.addEventListener("keydown", (event) => {
    const handle = event.target.closest("[data-price-handle]");
    if (!handle) return;

    const direction = event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "PageUp"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "PageDown"
        ? -1
        : 0;
    if (!direction) return;

    event.preventDefault();
    const type = handle.dataset.priceHandle;
    const current = type === "min" ? state.price.currentMin : state.price.currentMax;
    const step = event.key === "PageUp" || event.key === "PageDown" ? PRICE_STEP * 10 : PRICE_STEP;
    clampPrice(type, current + direction * step);
    updatePriceControls();
    collectFilters();
    handle.focus();
  });

  document.addEventListener("pointermove", (event) => {
    if (!state.draggingPrice) return;

    event.preventDefault();
    setPriceFromPointer(state.draggingPrice, event.clientX);
  });

  function finishPriceDrag() {
    if (!state.draggingPrice) return;

    state.draggingPrice = "";
    filters.querySelectorAll("[data-price-handle]").forEach((handle) => {
      handle.classList.remove("is-dragging");
    });
  }

  document.addEventListener("pointerup", finishPriceDrag);
  document.addEventListener("pointercancel", finishPriceDrag);

  search.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = search.querySelector("input").value;
  });

  search.querySelector("input").addEventListener("input", (event) => {
    const clear = search.querySelector("[data-search-clear]");
    clear.hidden = !event.target.value;
    search.classList.toggle("is-filled", Boolean(event.target.value));
    state.query = event.target.value;
  });

  search.querySelector("[data-search-clear]").addEventListener("click", () => {
    search.querySelector("input").value = "";
    state.query = "";
    search.querySelector("[data-search-clear]").hidden = true;
    search.classList.remove("is-filled");
    search.querySelector("input").focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setSortOpen(false);
    setFilterOpen(false);
  });

  mobileMedia.addEventListener("change", moveSortForViewport);
  bindProductCardInteractions(root);
  updatePriceControls();
  collectFilters();
  moveSortForViewport();
}
