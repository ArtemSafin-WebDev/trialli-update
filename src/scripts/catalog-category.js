import "./vin-results.js";

const root = document.querySelector("[data-catalog-results].tri-category");

if (root) {
  const filters = root.querySelector("#catalog-filters");
  const steps = ["brand", "model", "year", "modification"];
  const placeholders = {
    brand: "Марка",
    model: "Модель",
    year: "Год",
    modification: "Модификация",
  };
  const modelsByBrand = {
    lada: [
      ["vesta", "Vesta"],
      ["granta", "Granta"],
      ["niva-travel", "Niva Travel"],
    ],
    haval: [["jolion", "Jolion"], ["f7", "F7"], ["dargo", "Dargo"]],
    chery: [["tiggo-7-pro", "Tiggo 7 Pro"], ["tiggo-8-pro", "Tiggo 8 Pro"], ["arrizo-8", "Arrizo 8"]],
    bmw: [["3-series", "3 Series"], ["5-series", "5 Series"], ["x3", "X3"]],
    geely: [["coolray", "Coolray"], ["monjaro", "Monjaro"], ["atlas", "Atlas"]],
    kia: [["rio", "Rio"], ["sportage", "Sportage"], ["ceed", "Ceed"]],
    hyundai: [["solaris", "Solaris"], ["creta", "Creta"], ["tucson", "Tucson"]],
    audi: [["a4", "A4"], ["a6", "A6"], ["q5", "Q5"]],
    mercedes: [["c-class", "C-Class"], ["e-class", "E-Class"], ["glc", "GLC"]],
  };
  const years = ["2024", "2023", "2022", "2021", "2020"].map((year) => [year, year]);
  const modifications = [
    ["1-6-mt", "1.6 MT"],
    ["1-6-at", "1.6 AT"],
    ["2-0-at", "2.0 AT"],
  ];

  function getField(id) {
    return filters?.querySelector(`[data-filter="${id}"]`);
  }

  function getChecked(id) {
    return getField(id)?.querySelector("input:checked") || null;
  }

  function getSelected() {
    return Object.fromEntries(steps.map((id) => {
      const input = getChecked(id);
      return [id, input ? { id: input.value, label: input.closest("label")?.querySelector("span")?.textContent.trim() || input.value } : null];
    }));
  }

  function getOptions(id, selected) {
    if (id === "model") return modelsByBrand[selected.brand?.id] || [];
    if (id === "year") return selected.model ? years : [];
    if (id === "modification") return selected.year ? modifications : [];
    return [];
  }

  function renderOptions(field, id, options, selectedValue) {
    const optionsHost = field.querySelector("[data-vehicle-options]");
    if (!optionsHost) return;
    optionsHost.innerHTML = options.map(([value, label], index) => `
      <label${index >= 7 ? ' class="is-extra"' : ""}>
        <input type="radio" name="${id}" value="${escapeHtml(value)}"${value === selectedValue ? " checked" : ""} />
        <i></i><span>${escapeHtml(label)}</span>
      </label>
    `).join("");
  }

  function renderDependentFields() {
    const selected = getSelected();
    steps.slice(1).forEach((id, index) => {
      const field = getField(id);
      const enabled = Boolean(selected[steps[index]]);
      if (!field) return;
      const selectedValue = selected[id]?.id || "";
      const options = getOptions(id, selected);
      field.disabled = !enabled;
      field.classList.toggle("tri-category-vehicle-filter--disabled", !enabled);
      if (!enabled) field.classList.remove("is-expanded", "is-search-empty");
      renderOptions(field, id, options, selectedValue);
      const more = field.querySelector("[data-filter-more]");
      if (more) {
        more.hidden = options.length <= 7;
        more.setAttribute("aria-expanded", "false");
        more.querySelector("span").textContent = `Еще ${Math.max(0, options.length - 7)}`;
      }
    });
  }

  function clearAfter(id) {
    steps.slice(steps.indexOf(id) + 1).forEach((step) => {
      const input = getChecked(step);
      if (input) input.checked = false;
    });
  }

  function crossIcon() {
    return '<svg class="tri-category-vehicle-chip__icon" data-filter-chip-clear viewBox="0 0 12 12" aria-hidden="true"><path d="M10 2.73438L6.73438 6L10 9.26562L9.26562 10L6 6.73438L2.73438 10L2 9.26562L5.26562 6L2 2.73438L2.73438 2L6 5.26562L9.26562 2L10 2.73438Z" /></svg>';
  }

  function arrowIcon() {
    return '<svg class="tri-category-vehicle-chip__icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 4.2 6 8l3.8-3.8.8.8L6 9.6 1.4 5l.8-.8Z" /></svg>';
  }

  function syncChips() {
    const selected = getSelected();
    steps.forEach((id, index) => {
      const chip = root.querySelector(`[data-filter-chip="${id}"]`);
      if (!chip) return;
      const enabled = index === 0 || Boolean(selected[steps[index - 1]]);
      const value = selected[id];
      chip.disabled = !enabled;
      chip.hidden = !enabled;
      chip.classList.toggle("tri-category-vehicle-chip--filled", Boolean(value));
      chip.innerHTML = `<span class="tri-category-vehicle-chip__label">${escapeHtml(value?.label || placeholders[id])}</span>${value ? crossIcon() : arrowIcon()}`;
    });
  }

  function syncMobileResetVisibility() {
    const reset = root.querySelector(".tri-category-mobile-reset");
    if (!reset) return;
    const active = Boolean(filters?.querySelector("input[type='checkbox']:checked, input[type='radio']:checked, .tri-results-price.is-changed"));
    reset.disabled = !active;
    reset.hidden = !active;
  }

  function syncVehicleFilters() {
    renderDependentFields();
    syncChips();
    window.requestAnimationFrame(syncMobileResetVisibility);
  }

  filters?.addEventListener("change", (event) => {
    const field = event.target.closest("[data-filter]");
    if (field && steps.includes(field.dataset.filter)) clearAfter(field.dataset.filter);
    syncVehicleFilters();
  }, true);

  filters?.addEventListener("change", () => {
    window.requestAnimationFrame(syncMobileResetVisibility);
  });

  root.addEventListener("click", (event) => {
    const clear = event.target.closest("[data-filter-chip-clear]");
    const chip = clear?.closest("[data-filter-chip]");
    if (!chip) return;
    event.preventDefault();
    const input = getChecked(chip.dataset.filterChip);
    if (!input) return;
    input.checked = false;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  document.addEventListener("catalog-filters:reset", syncVehicleFilters);

  root.querySelectorAll(".tri-home-bottom-nav__item--active").forEach((item) => {
    item.classList.remove("tri-home-bottom-nav__item--active");
    item.removeAttribute("aria-current");
  });
  const catalogNavigationItem = root.querySelector('.tri-home-bottom-nav [data-site-nav="catalog"]');
  catalogNavigationItem?.classList.add("tri-home-bottom-nav__item--active");
  catalogNavigationItem?.setAttribute("aria-current", "page");

  syncVehicleFilters();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
