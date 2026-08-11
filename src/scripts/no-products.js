import "./page.js";
import "./phone-mask.js";
import "./trialli-home-picker-mock-api.js";
import {
  formStatusModal,
  setFormPending,
  submitFormRequest,
} from "./form-status-modal.js";
import {
  bindProductCardInteractions,
  initProductCardGalleries,
  productCardTemplate,
} from "./components/product-card.js";

const FIELD_MESSAGES = {
  brand: "Обязательно",
  model: "Обязательно",
  plate: "Обязательно",
  name: "Обязательно",
  phone: "Обязательно",
  parts: "Обязательно",
};
const PHONE_INVALID_MESSAGE =
  "Введите российский номер в формате +7 (999) 999-99-99";
const VIN_INVALID_MESSAGE = "VIN должен содержать 17 символов";
const EMAIL_INVALID_MESSAGE = "Введите корректный email";
const DEFAULT_ENDPOINTS = {
  request: "/api/parts-finder/vin-request",
  options: "/api/parts-finder/vin-request/options",
};

class NoProductsRequestForm {
  constructor(form, config = {}) {
    this.form = form;
    this.vehicleHost = form.querySelector("[data-no-products-vehicle]");
    this.submit = form.querySelector(".tri-no-products-form__submit");
    this.config = config;
    this.endpoints = { ...DEFAULT_ENDPOINTS, ...(config.endpoints || {}) };
    this.values = {
      brand: null,
      model: null,
      vin: config.vin || "",
      plate: "",
      name: "",
      phone: "",
      email: "",
      parts: "",
      agreement: false,
      ...(config.values || {}),
    };
    this.controls = [];
    this.openControl = null;
    this.search = {};
    this.touched = new Set();
    this.validationStarted = false;
    this.loadingOptions = false;
    this.optionsRequestId = 0;
    this.api = this.createApi();
    this.handleClick = this.handleClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  init() {
    this.form.addEventListener("input", this.handleInput);
    this.form.addEventListener("change", this.handleInput);
    this.form.addEventListener("focusout", this.handleFocusOut);
    this.form.addEventListener("keydown", this.handleKeyDown);
    this.form.addEventListener("submit", this.handleSubmit);
    document.addEventListener("click", this.handleDocumentClick);
    window.LuzarPhoneMask?.init(this.form);
    this.renderControls();
    this.loadControls();
    this.updateSubmitState();
  }

  createApi() {
    if (this.config.api && typeof this.config.api.getVinRequestOptions === "function") {
      return this.config.api;
    }

    if (this.config.api === "fetch" || this.config.api === "production") {
      return {
        getVinRequestOptions: ({ vinRequest }) => this.fetchControls(vinRequest),
        submitVinRequest: ({ formData }) =>
          submitFormRequest(this.form, {
            action: this.endpoints.request,
            fetchOptions: this.config.fetchOptions,
            formData,
          }),
      };
    }

    if (window.MockPartsFinderApi) {
      return new window.MockPartsFinderApi({
        vinRequest: this.endpoints.request,
        vinRequestOptions: this.endpoints.options,
      });
    }

    return {
      getVinRequestOptions: ({ vinRequest }) => this.fetchControls(vinRequest),
      submitVinRequest: ({ formData }) =>
        submitFormRequest(this.form, {
          action: this.endpoints.request,
          fetchOptions: this.config.fetchOptions,
          formData,
        }),
    };
  }

  async fetchControls(values) {
    const url = new URL(this.endpoints.options, window.location.origin);
    if (values.brand?.id) url.searchParams.set("brand", values.brand.id);
    if (values.model?.id) url.searchParams.set("model", values.model.id);
    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      ...(this.config.fetchOptions || {}),
    });
    if (!response.ok) {
      throw new Error(`No-products options request failed: ${response.status}`);
    }
    return response.json();
  }

  async loadControls() {
    const requestId = ++this.optionsRequestId;
    this.loadingOptions = true;
    this.renderControls();

    try {
      const payload = await this.api.getVinRequestOptions({
        vinRequest: {
          brand: this.values.brand,
          model: this.values.model,
        },
      });
      if (requestId !== this.optionsRequestId) return;
      this.controls = Array.isArray(payload?.controls) ? payload.controls : [];
      this.controls.forEach((control) => {
        if ((control.id === "brand" || control.id === "model") &&
            Object.prototype.hasOwnProperty.call(control, "value")) {
          this.values[control.id] = control.value || null;
        }
      });
    } catch (error) {
      console.error(error);
      if (requestId !== this.optionsRequestId) return;
      this.controls = [];
    } finally {
      if (requestId !== this.optionsRequestId) return;
      this.loadingOptions = false;
      this.renderControls();
      this.updateSubmitState();
    }
  }

  getControl(id) {
    const isBrand = id === "brand";
    const source = this.controls.find((control) => control.id === id);
    const label = source?.label || (isBrand ? "Марка" : "Модель");
    const placeholder = source?.placeholder || label;
    return {
      ...(source || {}),
      id,
      label,
      placeholder: placeholder.endsWith("*") ? placeholder : `${placeholder}*`,
      queryKey: source?.queryKey || id,
      value: this.values[id],
      options: source?.options || [],
      disabled:
        this.loadingOptions ||
        Boolean(source?.disabled) ||
        (!isBrand && !this.values.brand),
    };
  }

  renderControls() {
    this.vehicleHost.innerHTML = ["brand", "model"]
      .map((id) => this.controlTemplate(this.getControl(id)))
      .join("");
    this.bindControlActions(this.vehicleHost);
  }

  replaceControl(id) {
    const node = this.vehicleHost.querySelector(
      `[data-no-products-control="${selectorEscape(id)}"]`,
    );
    if (!node) return;
    node.outerHTML = this.controlTemplate(this.getControl(id));
    const replacement = this.vehicleHost.querySelector(
      `[data-no-products-control="${selectorEscape(id)}"]`,
    );
    this.bindControlActions(replacement);
  }

  bindControlActions(scope) {
    scope?.querySelectorAll("[data-no-products-action]").forEach((action) => {
      action.addEventListener("click", (event) => {
        event.stopPropagation();
        this.handleClick(event);
      });
    });
  }

  controlTemplate(control) {
    const isOpen = this.openControl === control.id;
    const hasValue = Boolean(control.value);
    const showError = this.shouldShowError(control.id);
    const searchValue = this.search[control.id] || "";
    const label = control.value?.label || control.placeholder;
    const fieldContent = isOpen
      ? `<input class="pf-field__input" type="search" value="${escapeAttr(searchValue)}" placeholder="${escapeAttr(control.placeholder)}" autocomplete="off" data-no-products-search="${escapeAttr(control.id)}" />`
      : `<span class="pf-field__text">${escapeHtml(label)}</span>`;
    const clear = isOpen && searchValue
      ? `<button class="pf-clear" type="button" aria-label="Очистить поиск" data-no-products-action="clear-search" data-id="${escapeAttr(control.id)}">${crossIcon()}</button>`
      : !isOpen && hasValue
        ? `<button class="pf-clear" type="button" aria-label="Очистить ${escapeAttr(control.label.toLowerCase())}" data-no-products-action="clear-control" data-id="${escapeAttr(control.id)}">${crossIcon()}</button>`
        : "";

    return `
      <div class="pf-control pf-control--request pf-control--modal ${isOpen ? "is-open" : ""} ${showError ? "is-invalid" : ""}" data-no-products-control="${escapeAttr(control.id)}">
        <div
          class="pf-field ${hasValue ? "has-value" : ""}"
          role="button"
          tabindex="${control.disabled ? "-1" : "0"}"
          aria-haspopup="listbox"
          aria-expanded="${isOpen}"
          aria-disabled="${control.disabled}"
          aria-invalid="${showError}"
          data-no-products-action="toggle-control"
          data-id="${escapeAttr(control.id)}"
        >
          ${fieldContent}${clear}${arrowIcon()}
        </div>
        ${control.value ? `<input type="hidden" name="${escapeAttr(control.queryKey)}" value="${escapeAttr(control.value.id)}" />` : ""}
        <span class="pf-modal-field__error" data-no-products-error="${escapeAttr(control.id)}" ${showError ? "" : "hidden"}>${showError ? escapeHtml(this.getFieldError(control.id)) : ""}</span>
        ${isOpen && !control.disabled ? this.dropdownTemplate(control) : ""}
      </div>
    `;
  }

  dropdownTemplate(control) {
    const query = (this.search[control.id] || "").trim().toLocaleLowerCase("ru-RU");
    const options = control.options.filter((option) =>
      option.label.toLocaleLowerCase("ru-RU").includes(query),
    );
    return `
      <div class="pf-dropdown" role="listbox">
        <div class="pf-options">
          ${options.length
            ? options.map((option) => this.optionTemplate(option, control)).join("")
            : '<div class="pf-empty">Ничего не найдено</div>'}
        </div>
      </div>
    `;
  }

  optionTemplate(option, control) {
    const selected = control.value?.id === option.id;
    return `
      <button class="pf-option ${selected ? "is-selected" : ""}" type="button" role="option" aria-selected="${selected}" data-no-products-action="select-option" data-id="${escapeAttr(control.id)}" data-value="${escapeAttr(option.id)}">
        <span class="pf-option__label">${escapeHtml(option.label)}</span>
      </button>
    `;
  }

  handleClick(event) {
    if (event.target.matches("[data-no-products-search]")) return;
    const action = event.target.closest("[data-no-products-action]");
    if (!action) {
      if (this.openControl && !event.target.closest("[data-no-products-control]")) {
        this.closeControl();
      }
      return;
    }

    event.preventDefault();
    const id = action.dataset.id;
    switch (action.dataset.noProductsAction) {
      case "toggle-control":
        this.toggleControl(id);
        break;
      case "clear-control":
        this.clearControl(id);
        break;
      case "clear-search":
        this.search[id] = "";
        this.replaceControl(id);
        this.focusSearch(id);
        break;
      case "select-option":
        this.selectOption(id, action.dataset.value);
        break;
    }
  }

  handleDocumentClick(event) {
    if (!this.openControl || this.form.contains(event.target)) return;
    this.closeControl();
  }

  handleKeyDown(event) {
    const field = event.target.closest("[data-no-products-action='toggle-control']");
    if (field && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      this.toggleControl(field.dataset.id);
      return;
    }
    if (event.key === "Escape" && this.openControl) {
      event.preventDefault();
      const id = this.openControl;
      this.closeControl();
      this.vehicleHost
        .querySelector(`[data-no-products-control="${selectorEscape(id)}"] .pf-field`)
        ?.focus();
    }
  }

  toggleControl(id) {
    const control = this.getControl(id);
    if (control.disabled) return;
    const previous = this.openControl;
    this.openControl = previous === id ? null : id;
    this.search[id] = "";
    if (previous && previous !== id) this.replaceControl(previous);
    this.replaceControl(id);
    if (this.openControl) this.focusSearch(id);
  }

  closeControl() {
    const id = this.openControl;
    if (!id) return;
    this.openControl = null;
    this.touched.add(id);
    this.replaceControl(id);
  }

  focusSearch(id) {
    requestAnimationFrame(() => {
      this.vehicleHost
        .querySelector(`[data-no-products-search="${selectorEscape(id)}"]`)
        ?.focus();
    });
  }

  async clearControl(id) {
    this.values[id] = null;
    if (id === "brand") this.values.model = null;
    this.touched.add(id);
    this.openControl = null;
    this.renderControls();
    await this.loadControls();
  }

  async selectOption(id, optionId) {
    const control = this.getControl(id);
    const option = control.options.find((item) => item.id === optionId);
    if (!option) return;
    this.values[id] = option;
    if (id === "brand") this.values.model = null;
    this.touched.add(id);
    this.openControl = null;
    this.renderControls();
    await this.loadControls();
  }

  handleInput(event) {
    const search = event.target.closest("[data-no-products-search]");
    if (search) {
      const id = search.dataset.noProductsSearch;
      this.search[id] = search.value;
      const options = this.vehicleHost.querySelector(
        `[data-no-products-control="${selectorEscape(id)}"] .pf-options`,
      );
      if (options) {
        const control = this.getControl(id);
        const query = search.value.trim().toLocaleLowerCase("ru-RU");
        const filtered = control.options.filter((option) =>
          option.label.toLocaleLowerCase("ru-RU").includes(query),
        );
        options.innerHTML = filtered.length
          ? filtered.map((option) => this.optionTemplate(option, control)).join("")
          : '<div class="pf-empty">Ничего не найдено</div>';
      }
      return;
    }

    const field = event.target.closest("[data-no-products-field]");
    if (!field) return;
    const key = field.dataset.noProductsField;
    if (event.type === "input" && key === "vin") {
      field.value = normalizeVin(field.value);
    }
    if (event.type === "input" && key === "plate") {
      field.value = normalizePlate(field.value);
    }
    this.values[key] = field.type === "checkbox" ? field.checked : field.value;
    this.updateSubmitState();
    if (this.validationStarted) this.updateFieldError(key);
  }

  handleFocusOut(event) {
    if (!this.validationStarted) return;
    const field = event.target.closest("[data-no-products-field]");
    if (!field) return;
    const key = field.dataset.noProductsField;
    this.touched.add(key);
    this.updateFieldError(key);
  }

  updateSubmitState() {
    this.submit.disabled = !this.isComplete();
  }

  isComplete() {
    return Boolean(
      this.values.name.trim() &&
      window.LuzarPhoneMask?.isValid(this.values.phone) &&
      this.values.parts.trim() &&
      this.values.agreement,
    );
  }

  shouldShowError(key) {
    return this.validationStarted && this.touched.has(key) && Boolean(this.getFieldError(key));
  }

  updateFieldError(key) {
    if (key === "agreement") {
      const wrapper = this.form.querySelector(".pf-agreement");
      const input = wrapper?.querySelector("input");
      const invalid = this.validationStarted && !this.values.agreement;
      wrapper?.classList.toggle("is-invalid", invalid);
      input?.setAttribute("aria-invalid", String(invalid));
      return;
    }

    if (key === "brand" || key === "model") {
      this.replaceControl(key);
      return;
    }

    const field = this.form.querySelector(
      `[data-no-products-field="${selectorEscape(key)}"]`,
    );
    const wrapper = field?.closest(".pf-modal-field");
    const errorNode = wrapper?.querySelector(".pf-modal-field__error");
    const error = this.getFieldError(key);
    const show = this.validationStarted && this.touched.has(key) && Boolean(error);
    wrapper?.classList.toggle("is-invalid", show);
    field?.setAttribute("aria-invalid", String(show));
    if (errorNode) {
      errorNode.textContent = show ? error : "";
      errorNode.hidden = !show;
    }
  }

  getFieldError(key) {
    if ((key === "brand" || key === "model") && !this.values[key]) {
      return FIELD_MESSAGES[key];
    }
    const value = String(this.values[key] || "").trim();
    if (["plate", "name", "phone", "parts"].includes(key) && !value) {
      return FIELD_MESSAGES[key];
    }
    if (key === "vin" && value && value.length !== 17) return VIN_INVALID_MESSAGE;
    if (key === "phone" && value && !window.LuzarPhoneMask?.isValid(value)) {
      return PHONE_INVALID_MESSAGE;
    }
    if (key === "email" && value && !isValidEmail(value)) {
      return EMAIL_INVALID_MESSAGE;
    }
    return "";
  }

  async handleSubmit(event) {
    event.preventDefault();
    const fields = ["brand", "model", "plate", "name", "phone", "email", "parts"];
    this.validationStarted = true;
    fields.forEach((key) => this.touched.add(key));
    fields.forEach((key) => this.updateFieldError(key));
    this.updateFieldError("agreement");
    const firstInvalid = fields.find((key) => this.getFieldError(key));

    if (firstInvalid || !this.values.agreement) {
      const target = firstInvalid === "brand" || firstInvalid === "model"
        ? this.vehicleHost.querySelector(
            `[data-no-products-control="${selectorEscape(firstInvalid)}"] .pf-field`,
          )
        : firstInvalid
          ? this.form.querySelector(
              `[data-no-products-field="${selectorEscape(firstInvalid)}"]`,
            )
          : this.form.querySelector('[data-no-products-field="agreement"]');
      target?.focus();
      return;
    }

    const submit = event.submitter || this.submit;
    setFormPending(this.form, true);
    try {
      const formData = new FormData(this.form);
      if (typeof this.api.submitVinRequest === "function") {
        await this.api.submitVinRequest({
          endpoint: this.endpoints.request,
          form: this.form,
          formData,
        });
      } else {
        await submitFormRequest(this.form, {
          action: this.endpoints.request,
          fetchOptions: this.config.fetchOptions,
          formData,
        });
      }
      formStatusModal.success({ returnFocusTo: submit });
    } catch (error) {
      console.error(error);
      setFormPending(this.form, false);
      formStatusModal.error({ returnFocusTo: submit });
    }
  }
}

const products = [
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
].map(([id, code, price, oldPrice, isNew]) => ({
  id,
  code,
  price,
  oldPrice,
  isNew,
  name: "Суппорт тормозной<br />для автомобилей Лада",
  imageAlt: "Суппорт тормозной для автомобилей Лада",
  images: Array(3).fill("/assets/trialli-catalog/result-product.png"),
}));

const form = document.querySelector("[data-no-products-form]");
if (form) {
  const noProductsRequestForm = new NoProductsRequestForm(
    form,
    window.NoProductsConfig || {},
  );
  noProductsRequestForm.init();
  window.TrialliNoProductsForm = noProductsRequestForm;
}

const recommendations = document.querySelector("[data-recommendation-products]");
if (recommendations) {
  recommendations.innerHTML = products.map(productCardTemplate).join("");
  initProductCardGalleries(recommendations);
  bindProductCardInteractions(recommendations);
  const showMore = recommendations.parentElement.querySelector("[data-show-more]");
  showMore?.addEventListener("click", () => {
    recommendations.classList.add("is-expanded");
    showMore.hidden = true;
  });
}

function normalizeVin(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, "")
    .slice(0, 17);
}

function normalizePlate(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-ZА-ЯЁ0-9]/g, "")
    .slice(0, 16);
}

function isValidEmail(value) {
  const input = document.createElement("input");
  input.type = "email";
  input.value = value;
  return input.checkValidity();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function selectorEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function crossIcon() {
  return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.861 4.195a.667.667 0 0 1 .943.943L8.942 8l2.862 2.861a.667.667 0 1 1-.943.943L8 8.942l-2.862 2.862a.667.667 0 1 1-.943-.943L7.057 8 4.195 5.138a.667.667 0 1 1 .943-.943L8 7.057l2.861-2.862Z" /></svg>';
}

function arrowIcon() {
  return '<span class="pf-arrow" aria-hidden="true"></span>';
}
