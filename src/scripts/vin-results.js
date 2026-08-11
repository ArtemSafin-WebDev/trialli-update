import "./page.js";
import {
  bindProductCardInteractions,
  initProductCardGalleries,
  productCardTemplate,
} from "./components/product-card.js";

const root = document.querySelector("[data-catalog-results]");

if (root) {
  const PRICE_MIN = 459;
  const PRICE_MAX = 9999999;
  const PRICE_STEP = 100;
  const MOBILE_SCROLL_HEADER_THRESHOLD = 80;
  const MOBILE_STICKY_TOOLS_TOP = 68;

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
    mobileDetailFilter: "",
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
  const scrollHeader = root.querySelector("[data-results-scroll-header]");
  const siteSearch = root.querySelector("[data-results-site-search]");
  const siteSearchInput = siteSearch?.querySelector("input");
  const siteSearchClear = siteSearch?.querySelector(
    "[data-results-site-search-clear]",
  );
  const desktopSortParent = sort?.parentElement;
  const mobileSortHost = root.querySelector("[data-mobile-sort-host]");
  const mobileTools = root.querySelector("[data-mobile-tools]");
  const mobileToolsTrack = root.querySelector("[data-mobile-tools-track]");
  const mobileToolsSentinel = root.querySelector("[data-mobile-tools-sentinel]");
  const activeFilters = root.querySelector("[data-active-filters]");
  const desktopActiveFiltersParent = activeFilters?.parentElement;
  const desktopActiveFiltersNextSibling = activeFilters?.nextElementSibling;
  const carToast = root.querySelector("[data-car-toast]");
  const filterDetail = root.querySelector("[data-filter-detail]");
  const mobileMedia = window.matchMedia("(max-width: 767px)");
  const desktopExtraOptions = new WeakSet(filters.querySelectorAll(".tri-results-filter__options .is-extra"));
  let mobileMoreLayoutFrame = 0;
  let scrollHeaderFrame = 0;

  const icons = {
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.47 3.53 3.53 3.53 3.53-3.53.94.94L8.94 8l3.53 3.53-.94.94L8 8.94l-3.53 3.53-.94-.94L7.06 8 3.53 4.47z"/></svg>',
    reset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.27441 1.56147C7.6919 1.1817 9.19598 1.27919 10.5518 1.84076C11.3452 2.16945 12.0617 2.64755 12.667 3.24115V1.66693H14L13.999 5.00092L13.333 5.66693H10V4.33393H11.8711C11.3592 3.79349 10.7373 3.36162 10.041 3.07318C8.95656 2.62403 7.75394 2.54491 6.62012 2.84857C5.48612 3.15243 4.48326 3.82247 3.76855 4.75385C3.05393 5.68523 2.66701 6.82696 2.66699 8.00092C2.66706 9.17468 3.05411 10.3157 3.76855 11.247C4.48326 12.1784 5.4861 12.8484 6.62012 13.1523C7.75402 13.456 8.95649 13.3769 10.041 12.9277C11.1256 12.4784 12.0312 11.6836 12.6182 10.6669L13.7734 11.3339C13.0397 12.6047 11.9074 13.5985 10.5518 14.1601C9.19596 14.7217 7.69192 14.8202 6.27441 14.4404C4.85708 14.0605 3.60427 13.2236 2.71094 12.0595C1.81763 10.8953 1.33308 9.46835 1.33301 8.00092C1.33303 6.53347 1.81766 5.10656 2.71094 3.94232C3.60424 2.77821 4.85708 1.94133 6.27441 1.56147Z"/></svg>',
  };

  const formatPrice = (price) => new Intl.NumberFormat("ru-RU").format(price);
  const parsePrice = (price) => Number(String(price).replace(/\D/g, ""));

  function updateScrollHeader() {
    scrollHeaderFrame = 0;
    const visible =
      mobileMedia.matches && window.scrollY >= MOBILE_SCROLL_HEADER_THRESHOLD;
    const toolsStuck =
      mobileMedia.matches &&
      mobileToolsSentinel?.getBoundingClientRect().top <= MOBILE_STICKY_TOOLS_TOP;
    scrollHeader?.classList.toggle("is-visible", visible);
    scrollHeader?.setAttribute("aria-hidden", String(!visible));
    if (scrollHeader) scrollHeader.inert = !visible;
    mobileTools?.classList.toggle("is-stuck", Boolean(toolsStuck));
  }

  function requestScrollHeaderUpdate() {
    if (scrollHeaderFrame) return;
    scrollHeaderFrame = window.requestAnimationFrame(updateScrollHeader);
  }

  function updateSiteSearchClear() {
    if (!siteSearchInput || !siteSearchClear) return;
    siteSearchClear.hidden = !siteSearchInput.value;
  }

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

    price.classList.toggle("is-changed", hasActivePriceFilter());
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

  function getFilterValueInputs(filter) {
    return Array.from(filter?.querySelectorAll(".tri-results-filter__options input, .tri-results-filter__chips input") || [])
      .filter((input) => !input.matches("[data-filter-select-all]"));
  }

  function renderProducts() {
    const products = getVisibleProducts();
    productsHost.innerHTML = products.length
      ? products.map(productCardTemplate).join("")
      : '<p class="tri-results-empty">По вашему запросу ничего не найдено</p>';
    initProductCardGalleries(productsHost);
    productsHost.classList.toggle("is-list", state.view === "list");
    syncTotals(products.length);
  }

  function collectFilters() {
    filters.querySelectorAll("[data-filter-select-all]").forEach((selectAll) => {
      const optionInputs = getFilterValueInputs(selectAll.closest("[data-filter]"));
      const selectedCount = optionInputs.filter((input) => input.checked).length;
      selectAll.checked = optionInputs.length > 0 && selectedCount === optionInputs.length;
      selectAll.indeterminate = selectedCount > 0 && selectedCount < optionInputs.length;
    });

    state.selected.clear();
    filters.querySelectorAll("input:checked").forEach((input) => {
      if (input.matches("[data-filter-select-all]")) return;
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
    const mobileFactor = Math.max(1, 2657 - Math.max(0, state.selected.size - 1) * 143);
    root.querySelectorAll("[data-total]").forEach((node) => {
      node.textContent = String(factor);
    });
    root.querySelectorAll("[data-mobile-total]").forEach((node) => {
      node.textContent = formatPrice(mobileFactor);
    });
  }

  function syncActiveFilters() {
    const active = root.querySelector("[data-active-filters]");
    const tags = root.querySelector("[data-active-tags]");
    const values = Array.from(state.selected.entries());
    active.hidden = values.length === 0;
    const filterTags = values
      .map(([key, label]) => `<button type="button" data-clear-filter="${key}"><span>${label}</span>${icons.close}</button>`)
      .join("");
    const resetButton = values.length >= 2
      ? `<button class="tri-results-active__reset" type="button" data-reset-filters>${icons.reset}<span>Сбросить фильтры</span></button>`
      : "";
    tags.innerHTML = filterTags + resetButton;
    const count = root.querySelector("[data-filter-count]");
    count.textContent = String(values.length);
    count.hidden = values.length === 0;
    root.querySelector("[data-filter-open]")?.classList.toggle("has-active-filters", values.length > 0);
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
    syncMobileFilterDetail();
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
    if (!open) state.mobileDetailFilter = "";
    root.classList.toggle("is-filter-open", open);
    filters.classList.toggle("is-detail-open", Boolean(open && state.mobileDetailFilter));
    root.querySelector("[data-filter-open]").setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("tri-results-modal-open", open || state.sortOpen);
    syncMobileFilterDetail();
  }

  function getFilterTitle(filter) {
    return filter?.querySelector("legend")?.textContent.trim() || "Фильтр";
  }

  function getFilterDetailOptions(filter, searchValue) {
    const query = (searchValue ?? filterDetail?.querySelector("[data-filter-detail-search]")?.value ?? "")
      .trim()
      .toLocaleLowerCase("ru-RU");

    return Array.from(filter?.querySelectorAll(".tri-results-filter__options label, .tri-results-filter__chips label") || [])
      .map((label) => ({
        input: label.querySelector("input"),
        label: label.querySelector("span")?.textContent.trim() || "",
      }))
      .filter((option) => (
        option.input &&
        !option.input.matches("[data-filter-select-all]") &&
        option.label &&
        (!query || option.label.toLocaleLowerCase("ru-RU").includes(query))
      ));
  }

  function syncMobileFilterDetail() {
    if (!filterDetail) return;

    const filter = state.mobileDetailFilter
      ? filters.querySelector(`[data-filter="${state.mobileDetailFilter}"]`)
      : null;
    const active = Boolean(state.filterOpen && mobileMedia.matches && filter);
    filters.classList.toggle("is-detail-open", active);
    filterDetail.hidden = !active;
    if (!active) return;

    const title = getFilterTitle(filter);
    const titleNode = filterDetail.querySelector("[data-filter-detail-title]");
    const searchInput = filterDetail.querySelector("[data-filter-detail-search]");
    const searchField = searchInput?.closest(".tri-results-filter-detail__search");
    const searchClear = filterDetail.querySelector("[data-filter-detail-search-clear]");
    const selectedHost = filterDetail.querySelector("[data-filter-detail-selected]");
    const list = filterDetail.querySelector("[data-filter-detail-list]");
    const optionInputs = getFilterValueInputs(filter);
    const supportsSelectAll = optionInputs.length > 0 && optionInputs.every((input) => input.type === "checkbox");
    const isSingleSelect = optionInputs.length > 0 && optionInputs.every((input) => input.type === "radio");
    const allSelected = supportsSelectAll && optionInputs.every((input) => input.checked);
    const allOptions = getFilterDetailOptions(filter);
    const selectedOptions = getFilterDetailOptions(filter, "").filter((option) => option.input.checked);
    const hasSearchValue = Boolean(searchInput?.value.trim());

    if (titleNode) titleNode.textContent = title;
    if (searchInput && searchField && searchClear) {
      searchField.classList.toggle("is-filled", hasSearchValue);
      searchClear.hidden = !hasSearchValue;
    }
    if (selectedHost) {
      selectedHost.innerHTML = selectedOptions.length && !allSelected && !isSingleSelect
        ? `${selectedOptions.map((option) => `
          <button class="tri-results-filter-detail__tag" type="button" data-filter-detail-clear="${option.input.value}">
            <span>${option.label}</span>${icons.close}
          </button>
        `).join("")}
          <button class="tri-results-filter-detail__reset" type="button" data-filter-detail-reset>
            ${icons.reset}<span>Сбросить</span>
          </button>`
        : "";
    }
    if (list) {
      const selectAllOption = supportsSelectAll && !hasSearchValue
        ? `<button class="tri-results-filter-detail__option tri-results-filter-detail__select-all${allSelected ? " is-selected" : ""}" type="button" data-filter-detail-select-all aria-pressed="${allSelected}">
            <i aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M12.4714 4.19531L13.4142 5.13811L6.94281 11.6095H6.00001L2.58582 8.19531L3.52862 7.25251L6.47141 10.1953L12.4714 4.19531Z" /></svg></i><span>Выбрать все</span>
          </button>`
        : "";
      const options = allOptions.length
        ? allOptions
            .map((option) => {
              const singleSelect = option.input.type === "radio";
              const control = singleSelect
                ? `<span>${option.label}</span><i aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M14.4707 4.27637L6.4707 12.2764H5.52734L1.52734 8.27637L2.4707 7.33301L5.99902 10.8623L13.5273 3.33301L14.4707 4.27637Z" /></svg></i>`
                : `<i aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M12.4714 4.19531L13.4142 5.13811L6.94281 11.6095H6.00001L2.58582 8.19531L3.52862 7.25251L6.47141 10.1953L12.4714 4.19531Z" /></svg></i><span>${option.label}</span>`;

              return `
                <button class="tri-results-filter-detail__option${singleSelect ? " is-single-select" : ""}${option.input.checked ? " is-selected" : ""}" type="button" data-filter-detail-option="${option.input.value}" aria-pressed="${option.input.checked}">
                  ${control}
                </button>
              `;
            })
            .join("")
        : '<p class="tri-results-filter-detail__empty">Ничего не найдено</p>';
      list.innerHTML = selectAllOption + options;
    }
  }

  function openMobileFilterDetail(filter) {
    if (!filter || !mobileMedia.matches) return false;

    state.mobileDetailFilter = filter.dataset.filter;
    filterDetail.querySelector("[data-filter-detail-search]").value = "";
    syncMobileFilterDetail();
    filters.scrollTo({ top: 0 });
    return true;
  }

  function closeMobileFilterDetail() {
    state.mobileDetailFilter = "";
    syncMobileFilterDetail();
    filters.scrollTo({ top: 0 });
  }

  function setMobileDetailValue(value, checked) {
    const filter = filters.querySelector(`[data-filter="${state.mobileDetailFilter}"]`);
    const input = Array.from(filter?.querySelectorAll("input") || []).find((item) => item.value === value);
    if (!input) return;

    if (input.type === "radio") {
      input.checked = true;
    } else {
      input.checked = checked ?? !input.checked;
    }
    collectFilters();
    syncMobileFilterDetail();
    filters.scrollTo({ top: 0 });
  }

  function toggleMobileDetailSelectAll() {
    const filter = filters.querySelector(`[data-filter="${state.mobileDetailFilter}"]`);
    const optionInputs = getFilterValueInputs(filter).filter((input) => input.type === "checkbox");
    if (!optionInputs.length) return;

    const checked = !optionInputs.every((input) => input.checked);
    optionInputs.forEach((input) => {
      input.checked = checked;
    });
    collectFilters();
    syncMobileFilterDetail();
  }

  function resetMobileDetailValues() {
    const filter = filters.querySelector(`[data-filter="${state.mobileDetailFilter}"]`);
    filter?.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach((input) => {
      input.checked = false;
    });
    collectFilters();
    syncMobileFilterDetail();
    filters.scrollTo({ top: 0 });
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

    const hiddenCount = filter.querySelectorAll(".tri-results-filter__options .is-extra").length;
    const collapsedLabel = `Еще ${hiddenCount}`;
    filter.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.querySelector("span").textContent = expanded ? "Свернуть" : collapsedLabel;

    if (!expanded) {
      const input = filter.querySelector("[data-filter-search]");
      if (input) input.value = "";
    }
    updateFilterSearch(filter);
  }

  function getRenderedRowCount(elements) {
    const rowTops = [];

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const top = Math.round(rect.top);
      if (!rowTops.some((rowTop) => Math.abs(rowTop - top) <= 1)) rowTops.push(top);
    });

    return rowTops.length;
  }

  function layoutMobileFilterOptions(filter, button) {
    const options = Array.from(filter.querySelectorAll(".tri-results-filter__options > label"));
    const label = button.querySelector("span");
    const maxRows = 3;

    filter.classList.remove("is-expanded");
    button.setAttribute("aria-expanded", "false");
    options.forEach((option) => option.classList.remove("is-extra"));
    button.hidden = true;

    if (getRenderedRowCount(options) <= maxRows) {
      if (label) label.textContent = "Еще 0";
      return;
    }

    button.hidden = false;
    for (let visibleCount = options.length - 1; visibleCount >= 1; visibleCount -= 1) {
      const hiddenCount = options.length - visibleCount;
      options.forEach((option, index) => option.classList.toggle("is-extra", index >= visibleCount));
      if (label) label.textContent = `Еще ${hiddenCount}`;

      const visibleElements = options.slice(0, visibleCount).concat(button);
      if (getRenderedRowCount(visibleElements) <= maxRows) return;
    }
  }

  function syncMobileMoreLabels() {
    filters.querySelectorAll("[data-filter-more]").forEach((button) => {
      const filter = button.closest("[data-filter]");
      const options = Array.from(filter?.querySelectorAll(".tri-results-filter__options > label") || []);

      if (mobileMedia.matches) {
        layoutMobileFilterOptions(filter, button);
        return;
      }

      options.forEach((option) => option.classList.toggle("is-extra", desktopExtraOptions.has(option)));
      const hiddenCount = options.filter((option) => option.classList.contains("is-extra")).length;
      const expanded = filter?.classList.contains("is-expanded");
      const label = expanded ? "Свернуть" : `Еще ${hiddenCount}`;
      button.querySelector("span").textContent = label;
      button.setAttribute("aria-expanded", String(Boolean(expanded)));
      button.hidden = hiddenCount === 0;
    });
  }

  function queueMobileMoreLayout() {
    if (!mobileMedia.matches) return;

    window.cancelAnimationFrame(mobileMoreLayoutFrame);
    mobileMoreLayoutFrame = window.requestAnimationFrame(syncMobileMoreLabels);
  }

  function moveSortForViewport() {
    if (!sort || !desktopSortParent || !mobileSortHost || !activeFilters || !mobileToolsTrack) return;
    if (mobileMedia.matches) {
      mobileSortHost.append(sort);
      mobileToolsTrack.append(activeFilters);
    } else {
      desktopSortParent.append(sort);
      if (desktopActiveFiltersParent) {
        desktopActiveFiltersParent.insertBefore(activeFilters, desktopActiveFiltersNextSibling);
      }
    }
    setFilterOpen(false);
    setSortOpen(false);
    updateScrollHeader();
    syncMobileMoreLabels();
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
    if (button.matches("[data-filter-detail-close]")) closeMobileFilterDetail();
    if (button.matches("[data-filter-detail-save]")) setFilterOpen(false);
    if (button.matches("[data-filter-detail-option]")) {
      setMobileDetailValue(button.dataset.filterDetailOption);
    }
    if (button.matches("[data-filter-detail-select-all]")) toggleMobileDetailSelectAll();
    if (button.matches("[data-filter-detail-clear]")) {
      setMobileDetailValue(button.dataset.filterDetailClear, false);
    }
    if (button.matches("[data-filter-detail-reset]")) resetMobileDetailValues();
    if (button.matches("[data-filter-detail-search-clear]")) {
      const input = filterDetail?.querySelector("[data-filter-detail-search]");
      if (input) {
        input.value = "";
        syncMobileFilterDetail();
        input.focus();
      }
    }
    if (button.matches("[data-mobile-search-focus]")) {
      search.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => search.querySelector("input")?.focus(), 220);
    }
    if (button.matches("[data-results-scroll-back]")) {
      if (window.history.length > 1) window.history.back();
      else window.location.assign("/");
    }
    if (button.matches("[data-results-site-search-clear]")) {
      siteSearchInput.value = "";
      updateSiteSearchClear();
      siteSearchInput.focus();
    }
    if (button.matches("[data-car-toast-close]")) {
      carToast?.classList.remove("is-visible");
      carToast?.setAttribute("aria-hidden", "true");
    }
    if (button.matches("[data-filter-more]")) {
      const filter = button.closest("[data-filter]");
      if (openMobileFilterDetail(filter)) return;
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
    if (button.matches("[data-view]")) {
      state.view = button.dataset.view;
      root.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("is-active", item === button));
      renderProducts();
    }
  });

  filters.addEventListener("change", (event) => {
    const selectAll = event.target.closest("[data-filter-select-all]");
    if (selectAll) {
      getFilterValueInputs(selectAll.closest("[data-filter]"))
        .filter((input) => input.type === "checkbox")
        .forEach((input) => {
          input.checked = selectAll.checked;
        });
    }
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
    if (event.target.matches("[data-filter-detail-search]")) {
      syncMobileFilterDetail();
      return;
    }
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

  siteSearchInput?.addEventListener("input", updateSiteSearchClear);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.mobileDetailFilter) {
      closeMobileFilterDetail();
      return;
    }
    setSortOpen(false);
    setFilterOpen(false);
  });

  mobileMedia.addEventListener("change", moveSortForViewport);
  mobileMedia.addEventListener("change", requestScrollHeaderUpdate);
  window.addEventListener("scroll", requestScrollHeaderUpdate, { passive: true });
  window.addEventListener("resize", queueMobileMoreLayout);
  document.fonts?.ready.then(queueMobileMoreLayout);
  bindProductCardInteractions(root);
  root.querySelectorAll(".tri-home-bottom-nav .is-active").forEach((item) => item.classList.remove("is-active"));
  const pickerNavigationItem = root.querySelector(".tri-home-bottom-nav [data-open-picker]");
  pickerNavigationItem?.classList.add("is-active");
  pickerNavigationItem?.setAttribute("aria-current", "page");
  filters.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach((input) => {
    input.checked = input.defaultChecked;
  });
  updatePriceControls();
  collectFilters();
  moveSortForViewport();
  updateSiteSearchClear();
  updateScrollHeader();
}
