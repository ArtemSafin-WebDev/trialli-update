import { trialliPartsFinderData as data } from "./parts-finder-data.js";

const root = document.querySelector("[data-tri-parts-finder]");

if (root) {
  const fieldOrder = ["make", "model", "year", "engine", "modification", "groups"];
  const fieldTitles = {
    make: "Марка",
    model: "Модель",
    year: "Год",
    engine: "Объём двигателя",
    modification: "Модификация",
    groups: "Группы товаров",
  };
  const state = {
    mode: "car",
    make: "",
    model: "",
    year: "",
    engine: "",
    modification: "",
    groups: "",
  };
  const desktopFields = Object.fromEntries(
    fieldOrder.map((name) => [
      name,
      root.querySelector(`[data-car-form] [data-car-field="${name}"]`),
    ]),
  );
  const step = root.querySelector("[data-picker-step]");
  const stepTitle = root.querySelector("[data-step-title]");
  const stepSearch = root.querySelector("[data-step-search]");
  const stepOptions = root.querySelector("[data-step-options]");
  let activeStep = "";

  const labelFor = (name, value) => {
    if (!value) return "";
    if (name === "make") return data.makes.find((item) => item.value === value)?.label || value;
    if (name === "model") return selectedMake()?.models.find((item) => item.value === value)?.label || value;
    if (name === "engine") return selectedModel()?.engines.find((item) => item.value === value)?.label || value;
    if (name === "modification") return selectedEngine()?.modifications.find((item) => item.value === value)?.label || value;
    return value;
  };

  const selectedMake = () => data.makes.find((item) => item.value === state.make);
  const selectedModel = () => selectedMake()?.models.find((item) => item.value === state.model);
  const selectedEngine = () => selectedModel()?.engines.find((item) => item.value === state.engine);

  const optionsFor = (name) => {
    if (name === "make") return data.makes.map(({ value, label }) => ({ value, label }));
    if (name === "model") return (selectedMake()?.models || []).map(({ value, label }) => ({ value, label }));
    if (name === "year") return (selectedModel()?.years || []).map((value) => ({ value, label: value }));
    if (name === "engine") return (selectedModel()?.engines || []).map(({ value, label }) => ({ value, label }));
    if (name === "modification") return (selectedEngine()?.modifications || []).map(({ value, label }) => ({ value, label }));
    if (name === "groups") return data.groups.map((label) => ({ value: label, label }));
    return [];
  };

  const canSubmit = () => fieldOrder.every((name) => Boolean(state[name]));

  const renderTags = () => {
    const brands = data.makes.filter((item) => item.value !== "audi").slice(0, 11);
    const makeHost = root.querySelector('[data-mobile-value="make"]');
    if (makeHost) {
      if (state.make) {
        makeHost.innerHTML = `<i>${labelFor("make", state.make)}</i>`;
      } else {
        makeHost.innerHTML = `${brands.map((item) => `<i>${item.label}</i>`).join("")}<i class="is-more">Еще 145&nbsp; ›</i>`;
      }
    }
    const groupsHost = root.querySelector('[data-mobile-value="groups"]');
    if (groupsHost) {
      if (state.groups) {
        groupsHost.innerHTML = `<i>${state.groups}</i>`;
      } else {
        groupsHost.innerHTML = `${data.groups.slice(0, 5).map((label) => `<i>${label}</i>`).join("")}<i class="is-more">Еще 3 145&nbsp; ›</i>`;
      }
    }
  };

  const sync = () => {
    fieldOrder.forEach((name, index) => {
      const desktop = desktopFields[name];
      const options = optionsFor(name);
      if (desktop) {
        const current = state[name];
        desktop.innerHTML = `<option value="">${fieldTitles[name]}</option>${options.map((item) => `<option value="${item.value}">${item.label}</option>`).join("")}`;
        desktop.value = current;
        desktop.disabled = index > 0 && !state[fieldOrder[index - 1]];
      }
      const mobile = root.querySelector(`[data-mobile-field="${name}"]`);
      if (mobile) {
        mobile.disabled = index > 0 && !state[fieldOrder[index - 1]];
        mobile.classList.toggle("is-filled", Boolean(state[name]) || name === "make" || name === "groups");
        const valueHost = mobile.querySelector(`[data-mobile-value="${name}"]`);
        if (valueHost && !["make", "groups"].includes(name)) valueHost.textContent = labelFor(name, state[name]);
      }
    });
    root.querySelectorAll("[data-car-submit]").forEach((button) => {
      button.disabled = !canSubmit();
    });
    root.querySelectorAll("[data-mobile-submit]").forEach((button) => {
      button.disabled = false;
    });
    renderTags();
  };

  const selectValue = (name, value) => {
    const index = fieldOrder.indexOf(name);
    state[name] = value;
    fieldOrder.slice(index + 1).forEach((next) => {
      state[next] = "";
    });
    sync();
  };

  const setMode = (mode) => {
    state.mode = mode;
    root.querySelectorAll("[data-tri-finder-mode]").forEach((button) => {
      const active = button.dataset.triFinderMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    root.querySelectorAll("[data-tri-finder-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.triFinderPanel === mode);
    });
  };

  const openStep = (name) => {
    activeStep = name;
    step.hidden = false;
    stepTitle.textContent = fieldTitles[name];
    stepSearch.value = "";
    renderStepOptions();
    stepSearch.focus();
  };

  const renderStepOptions = () => {
    const query = stepSearch.value.trim().toLowerCase();
    stepOptions.innerHTML = optionsFor(activeStep)
      .filter((item) => item.label.toLowerCase().includes(query))
      .map((item) => `<button type="button" data-step-value="${item.value}">${item.label}</button>`)
      .join("");
  };

  const readCars = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("trialliPartsFinderCars") || "[]");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {
      // Повреждённая запись не должна блокировать подбор.
    }
    return Array.from({ length: 3 }, (_, index) => ({
      id: `demo-${index}`,
      make: "Audi",
      model: "A4 B8 (08-)",
      year: "2015",
      engine: "2.0 бензиновый",
      modification: "A4 2.0 TFSI quattro 190 л.с.",
      vin: "Y6DTF69Y080144158",
      plate: "---",
    }));
  };

  const renderCars = () => {
    const cars = readCars();
    root.querySelectorAll("[data-cars-count]").forEach((host) => {
      host.textContent = cars.length;
    });
    const host = root.querySelector("[data-cars-list]");
    if (!host) return;
    host.innerHTML = cars.map((car) => `
      <article class="tri-finder-car" data-car-id="${car.id}">
        <dl>
          <div><dt>Марка</dt><dd>${car.make}</dd></div><div><dt>Модель</dt><dd>${car.model}</dd></div>
          <div><dt>Год</dt><dd>${car.year}</dd></div><div><dt>Объём двигателя</dt><dd>${car.engine}</dd></div>
          <div><dt>Модификация</dt><dd>${car.modification}</dd></div><div><dt>VIN</dt><dd>${car.vin}</dd></div>
          <div><dt>Госномер</dt><dd>${car.plate}</dd></div>
        </dl>
        <div class="tri-finder-car__actions"><button type="button" data-delete-car>Удалить</button><button type="button" data-use-car>Выбрать</button></div>
      </article>
    `).join("");
  };

  const submitCar = () => {
    const params = new URLSearchParams({
      make: labelFor("make", state.make),
      model: labelFor("model", state.model),
      year: state.year,
      engine: labelFor("engine", state.engine),
      modification: labelFor("modification", state.modification),
      group: state.groups,
    });
    location.assign(`/pages/catalog-results.html?${params}`);
  };

  const submitVin = (form) => {
    const input = form.querySelector('[name="vin"]');
    if (!input?.checkValidity()) {
      input?.reportValidity();
      return;
    }
    if (input.value.trim().length < 12) {
      const modal = root.querySelector("[data-vin-request-modal]");
      const modalVin = modal.querySelector('[name="vin"]');
      const modalPlate = modal.querySelector('[name="plate"]');
      modalVin.value = "";
      modalPlate.value = input.value.trim();
      modal.hidden = false;
      return;
    }
    location.assign(`/pages/catalog-results.html?vin=${encodeURIComponent(input.value.trim())}`);
  };

  desktopFields.make.innerHTML += data.makes.map((item) => `<option value="${item.value}">${item.label}</option>`).join("");
  sync();
  renderCars();

  root.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-tri-finder-mode]")) setMode(target.dataset.triFinderMode);
    if (target.matches("[data-mobile-field]")) openStep(target.dataset.mobileField);
    if (target.matches("[data-close-step]")) step.hidden = true;
    if (target.matches("[data-step-value]")) {
      selectValue(activeStep, target.dataset.stepValue);
      step.hidden = true;
    }
    if (target.matches("[data-open-cars]")) {
      renderCars();
      root.querySelector("[data-cars-panel]").hidden = false;
    }
    if (target.matches("[data-close-cars]")) root.querySelector("[data-cars-panel]").hidden = true;
    if (target.matches("[data-delete-car]")) {
      const id = target.closest("[data-car-id]")?.dataset.carId;
      const cars = readCars().filter((car) => car.id !== id);
      localStorage.setItem("trialliPartsFinderCars", JSON.stringify(cars));
      renderCars();
    }
    if (target.matches("[data-use-car]")) {
      location.assign(`/pages/catalog-results.html?vin=Y6DTF69Y080144158`);
    }
    if (target.matches("[data-open-vin-request]")) root.querySelector("[data-vin-request-modal]").hidden = false;
    if (target.matches("[data-close-vin-request]")) root.querySelector("[data-vin-request-modal]").hidden = true;
  });

  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-car-field]")) selectValue(event.target.dataset.carField, event.target.value);
    if (event.target.matches('[data-vin-request-form] input[type="checkbox"]')) {
      root.querySelector("[data-vin-request-submit]").disabled = !event.target.checked;
    }
  });

  stepSearch?.addEventListener("input", renderStepOptions);
  root.querySelectorAll("[data-car-form], [data-mobile-car-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (canSubmit()) {
      submitCar();
    } else if (event.currentTarget.matches("[data-mobile-car-form]")) {
      location.assign("/pages/catalog-results.html");
    }
  }));
  root.querySelectorAll("[data-vin-form], [data-mobile-vin-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitVin(form);
  }));
  root.querySelector("[data-vin-request-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    button.textContent = "Заявка отправлена";
    button.disabled = true;
    window.setTimeout(() => {
      root.querySelector("[data-vin-request-modal]").hidden = true;
    }, 900);
  });
}
