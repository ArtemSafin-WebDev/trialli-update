import "./phone-mask.js";

(function () {
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
  const EMPTY_VALUES = {
    brand: null,
    model: null,
    vin: "",
    plate: "",
    name: "",
    phone: "",
    email: "",
    parts: "",
    agreement: false,
  };

  class PartsFinderRequestModal {
    constructor() {
      this.state = null;
      this.returnFocusTo = null;
      this.handleClick = this.handleClick.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleInput = this.handleInput.bind(this);
      this.handleFocusOut = this.handleFocusOut.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.closeTimer = null;
      this.optionsRequestId = 0;
    }

    open(options = {}) {
      this.close({ immediate: true });
      this.returnFocusTo =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      this.state = {
        endpoint: options.endpoint || "/api/parts-finder/vin-request",
        optionsEndpoint:
          options.optionsEndpoint || "/api/parts-finder/vin-request/options",
        loadOptions: options.loadOptions || null,
        fetchOptions: options.fetchOptions || {},
        values: {
          ...EMPTY_VALUES,
          ...(options.values || {}),
        },
        vehicle: options.vehicle || {},
        controls: options.controls || [],
        history: options.history || null,
        historyOpen: false,
        openControl: null,
        mobileControl: null,
        search: {},
        touched: new Set(),
        validationStarted: false,
        loadingOptions: false,
        optionsError: false,
      };
      this.render();
      this.loadVehicleControls({ updateRow: true });
    }

    close(options = {}) {
      const host = document.querySelector(".pf-modal");
      window.clearTimeout(this.closeTimer);

      if (!host) {
        this.state = null;
        document.documentElement.classList.remove("pf-modal-open");
        return;
      }

      if (options.immediate || !host.open) {
        if (host.open) host.close();
        host.remove();
        this.state = null;
        document.documentElement.classList.remove("pf-modal-open");
        this.restoreFocus();
        return;
      }

      host.classList.add("is-closing");
      this.closeTimer = window.setTimeout(() => {
        host.close();
        host.remove();
        this.state = null;
        document.documentElement.classList.remove("pf-modal-open");
        this.restoreFocus();
      }, 240);
    }

    restoreFocus() {
      if (this.returnFocusTo?.isConnected) {
        this.returnFocusTo.focus({ preventScroll: true });
      }
      this.returnFocusTo = null;
    }

    updateSubmitState() {
      const submit = document.querySelector(".pf-modal__submit");
      if (submit) submit.disabled = !this.isComplete();
    }

    replaceControl(id) {
      const control = document.querySelector(
        `[data-modal-control="${selectorEscape(id)}"]`,
      );
      if (control) control.outerHTML = this.controlTemplate(this.getControl(id));
    }

    vehicleRowTemplate() {
      const hasHistory = this.hasHistoryItems();

      return `
        <div class="pf-modal__vehicle-row ${hasHistory ? "has-history" : ""}">
          ${this.historyToggleTemplate()}
          ${this.controlTemplate(this.getControl("brand"))}
          ${this.controlTemplate(this.getControl("model"))}
        </div>
      `;
    }

    updateVehicleRow() {
      const row = document.querySelector(".pf-modal__vehicle-row");
      if (row) row.outerHTML = this.vehicleRowTemplate();
    }

    updateVehicleControls(ids = ["brand", "model"]) {
      ids.forEach((id) => this.replaceControl(id));
    }

    async loadVehicleControls(options = {}) {
      const { updateRow = false } = options;
      if (!this.state) return;

      const requestId = ++this.optionsRequestId;
      const requestValues = cloneVehicleValues(this.state.values);
      this.state.loadingOptions = true;
      this.state.optionsError = false;
      if (updateRow) this.updateVehicleControls();

      try {
        const payload = this.state.loadOptions
          ? await this.state.loadOptions(requestValues)
          : await this.fetchVehicleControls(requestValues);

        if (!this.state || requestId !== this.optionsRequestId) return;

        if (Array.isArray(payload?.controls)) {
          this.state.controls = payload.controls;
          this.syncVehicleValuesFromControls(payload.controls);
        }
      } catch (error) {
        if (!this.state || requestId !== this.optionsRequestId) return;
        this.state.optionsError = true;
      } finally {
        if (!this.state || requestId !== this.optionsRequestId) return;
        this.state.loadingOptions = false;
        if (updateRow) {
          this.updateVehicleRow();
        } else {
          this.updateVehicleControls();
        }
      }
    }

    async fetchVehicleControls(values) {
      const url = new URL(this.state.optionsEndpoint, window.location.origin);
      const brand = values.brand;
      const model = values.model;

      if (brand?.id) url.searchParams.set("brand", brand.id);
      if (model?.id) url.searchParams.set("model", model.id);

      const response = await fetch(url, {
        method: "GET",
        ...this.state.fetchOptions,
        headers: {
          ...(this.state.fetchOptions.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Parts finder modal options request failed: ${response.status}`);
      }

      return response.json();
    }

    syncVehicleValuesFromControls(controls) {
      controls.forEach((control) => {
        if (control.id !== "brand" && control.id !== "model") return;
        if (!Object.prototype.hasOwnProperty.call(control, "value")) return;
        this.state.values[control.id] = control.value || null;
      });
    }

    updateHistoryPopover() {
      const history = document.querySelector(".pf-modal-history");
      if (!history) return;
      const toggle = history.querySelector(".pf-modal-history__toggle");
      history.querySelector(".pf-modal-history__list")?.remove();
      toggle?.classList.toggle("is-open", this.state.historyOpen);
      toggle?.setAttribute("aria-expanded", String(this.state.historyOpen));
      if (this.state.historyOpen) {
        history.insertAdjacentHTML("beforeend", this.historyListTemplate());
      }
    }

    updateVehicleFields() {
      ["vin", "plate"].forEach((key) => {
        const field = document.querySelector(`[name="${selectorEscape(key)}"]`);
        if (field) field.value = this.state.values[key] || "";
      });
    }

    collapseOpenControl() {
      if (!this.state.openControl) return;
      const openControl = this.state.openControl;
      this.state.openControl = null;
      this.state.touched.add(openControl);
      this.replaceControl(openControl);
    }

    focusOpenControlSearch() {
      const controlId = this.state.mobileControl || this.state.openControl;
      if (!controlId) return;
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `[data-modal-search="${selectorEscape(controlId)}"]`,
        );
        if (!input) return;
        input.focus();
        if (typeof input.setSelectionRange === "function") {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
    }

    updateOpenDropdownOptions(id) {
      const control = this.getControl(id);
      if (this.state.mobileControl === id) {
        const optionsHost = document.querySelector(
          `[data-modal-expanded-options="${selectorEscape(id)}"]`,
        );
        if (!control || !optionsHost) return;

        const query = (this.state.search[id] || "").trim().toLowerCase();
        const options = control.options.filter((option) =>
          option.label.toLowerCase().includes(query),
        );
        optionsHost.innerHTML = options.length
          ? options
              .map((option) => this.mobileOptionTemplate(option, control))
              .join("")
          : emptyTemplate();
        return;
      }

      const optionsHost = document.querySelector(
        `[data-modal-control="${selectorEscape(id)}"] .pf-options`,
      );
      if (!control || !optionsHost) return;

      const query = (this.state.search[id] || "").trim().toLowerCase();
      const options = control.options.filter((option) =>
        option.label.toLowerCase().includes(query),
      );
      optionsHost.innerHTML = options.length
        ? options.map((option) => this.optionTemplate(option, control)).join("")
        : emptyTemplate();
    }

    updateSearchClearButton(id) {
      if (this.state.mobileControl === id) {
        const field = document.querySelector(
          `[data-modal-mobile-search-field="${selectorEscape(id)}"]`,
        );
        if (!field) return;
        field.classList.toggle("is-filled", Boolean(this.state.search[id]));
        const clear = field.querySelector(".pf-mobile-search__clear");
        if (clear) clear.hidden = !this.state.search[id];
        return;
      }

      const field = document.querySelector(
        `[data-modal-control="${selectorEscape(id)}"] .pf-field`,
      );
      if (!field) return;
      const clear = field.querySelector(".pf-clear--search");
      const searchValue = this.state.search[id] || "";

      if (searchValue && !clear) {
        field.querySelector(".pf-arrow")?.insertAdjacentHTML(
          "beforebegin",
          `<button class="pf-clear pf-clear--search" type="button" aria-label="Очистить поиск" data-modal-action="clear-search" data-id="${escapeAttr(id)}">${iconPickerCross()}</button>`,
        );
      }
      if (!searchValue && clear) clear.remove();
    }

    hasHistoryItems() {
      return Boolean(this.state.history?.enabled && this.state.history.items?.length);
    }

    render() {
      const host = document.createElement("dialog");
      host.className = "pf-modal";
      host.setAttribute("aria-labelledby", "pf-modal-title");
      host.setAttribute("tabindex", "-1");
      host.innerHTML = this.template();
      host.addEventListener("click", this.handleClick);
      host.addEventListener("cancel", this.handleCancel);
      host.addEventListener("input", this.handleInput);
      host.addEventListener("change", this.handleInput);
      host.addEventListener("focusout", this.handleFocusOut);
      host.addEventListener("submit", this.handleSubmit);
      document.body.append(host);
      window.LuzarPhoneMask?.init(host);
      host.showModal();
      document.documentElement.classList.add("pf-modal-open");
      host.focus({ preventScroll: true });
    }

    renderMobileOptions() {
      const host = document.querySelector(".pf-modal");
      if (!host || !this.state.mobileControl) return;
      const control = this.getControl(this.state.mobileControl);
      if (!control) return;

      host.querySelector(".pf-modal__mobile-options")?.remove();
      host.insertAdjacentHTML("beforeend", this.mobileOptionsTemplate(control));
      const dialog = host.querySelector(".pf-modal__dialog");
      if (dialog) {
        dialog.inert = true;
        dialog.setAttribute("aria-hidden", "true");
      }
      this.focusOpenControlSearch();
    }

    closeMobileOptions(options = {}) {
      const { restoreFocus = true } = options;
      const host = document.querySelector(".pf-modal");
      const controlId = this.state.mobileControl;
      this.state.mobileControl = null;
      host?.querySelector(".pf-modal__mobile-options")?.remove();
      const dialog = host?.querySelector(".pf-modal__dialog");
      if (dialog) {
        dialog.inert = false;
        dialog.removeAttribute("aria-hidden");
      }
      if (restoreFocus && controlId) {
        requestAnimationFrame(() => {
          host
            ?.querySelector(
              `[data-modal-control="${selectorEscape(controlId)}"] .pf-field`,
            )
            ?.focus({ preventScroll: true });
        });
      }
    }

    template() {
      const values = this.state.values;
      const disabled = !this.isComplete();

      return `
        <section class="pf-modal__dialog">
          <button class="pf-modal__close" type="button" aria-label="Закрыть" data-modal-close>${iconCross()}</button>
          <div class="pf-modal__art">
            <h2 id="pf-modal-title">
              <span class="pf-modal__title-desktop">
                <strong>Оставьте заявку</strong>
                <span>на индивидуальный<br>подбор деталей</span>
              </span>
              <span class="pf-modal__title-mobile">Оставьте заявку на подбор деталей по VIN или госномеру</span>
            </h2>
          </div>
          <form class="pf-modal__form" action="${escapeAttr(this.state.endpoint)}" method="post" novalidate>
            <input type="hidden" name="mode" value="vin-request">
            <div class="pf-modal__grid">
              ${this.vehicleRowTemplate()}
              ${this.inputTemplate("vin", "VIN", values.vin, "text", false, "pf-modal-field--wide pf-modal-field--vin")}
              ${this.inputTemplate("plate", "Госномер*", values.plate, "text", true, "pf-modal-field--wide pf-modal-field--plate")}
              ${this.inputTemplate("name", "ФИО*", values.name, "text", true, "pf-modal-field--wide pf-modal-field--name")}
              ${this.inputTemplate("phone", "Телефон*", values.phone, "tel", true, "pf-modal-field--phone")}
              ${this.inputTemplate("email", "Email", values.email, "email", false, "pf-modal-field--email")}
              ${this.textareaTemplate("parts", "Интересующие запчасти*", values.parts)}
            </div>
            <div class="pf-modal__actions">
              <label class="pf-agreement pf-agreement--modal">
                <input type="checkbox" name="agreement" value="1" ${values.agreement ? "checked" : ""} aria-invalid="false" data-modal-field="agreement">
                <span class="pf-checkbox" aria-hidden="true">${iconCheck()}</span>
                <span class="pf-agreement__text">
                  Я принимаю <a href="#">Пользовательское соглашение</a> и
                  <a href="#">Политику обработки персональных данных</a>
                </span>
              </label>
              <button class="pf-submit pf-submit--with-icon pf-modal__submit" type="submit" ${disabled ? "disabled" : ""}>
                ${iconSent()}
                <span>Отправить запрос</span>
              </button>
            </div>
          </form>
        </section>
      `;
    }

    historyToggleTemplate() {
      if (!this.hasHistoryItems()) return "";
      const isOpen = this.state.historyOpen;

      return `
        <div class="pf-modal-history">
          <button
            class="pf-modal-history__toggle ${isOpen ? "is-open" : ""}"
            type="button"
            aria-label="${escapeAttr(this.state.history.label || "Мои авто")}"
            aria-haspopup="listbox"
            aria-expanded="${isOpen}"
            data-modal-history-toggle
          >
            ${iconCar()}
            <span class="pf-modal-history__badge">${this.state.history.items.length}</span>
          </button>
          ${isOpen ? this.historyListTemplate() : ""}
        </div>
      `;
    }

    historyListTemplate() {
      const rows = this.state.history.items
        .map(
          (item) => `
            <button class="pf-modal-history__item" type="button" role="option" data-modal-history="${escapeAttr(item.id)}">
              <span>${escapeHtml(item.brand?.label || "")} ${escapeHtml(item.model?.label || "")}</span>
              <small>${escapeHtml(item.vin || item.plate || "")}</small>
            </button>
          `,
        )
        .join("");

      return `<div class="pf-modal-history__list" role="listbox">${rows}</div>`;
    }

    getControl(id) {
      const isBrand = id === "brand";
      const control = this.state.controls.find((item) => item.id === id);
      const placeholder =
        control?.placeholder || (isBrand ? "Марка" : "Модель");

      return {
        ...(control || {}),
        id,
        label: control?.label || (isBrand ? "Марка" : "Модель"),
        placeholder: placeholder.endsWith("*")
          ? placeholder
          : `${placeholder}*`,
        queryKey: control?.queryKey || id,
        disabled:
          this.state.loadingOptions ||
          Boolean(control?.disabled) ||
          (!isBrand && !this.state.values.brand),
        value: this.state.values[id],
        options: control?.options || [],
      };
    }

    controlTemplate(control) {
      const isOpen = this.state.openControl === control.id;
      const hasValue = Boolean(control.value);
      const error = this.getFieldError(control.id);
      const showError =
        this.state.validationStarted &&
        this.state.touched.has(control.id) &&
        Boolean(error);
      const label = control.value?.label || control.placeholder;
      const searchValue = this.state.search[control.id] || "";
      const fieldBody = isOpen
        ? `<input class="pf-field__input" type="search" value="${escapeAttr(searchValue)}" placeholder="${escapeAttr(control.placeholder)}" data-modal-search="${escapeAttr(control.id)}" autocomplete="off">`
        : `<span class="pf-field__text">${escapeHtml(label)}</span>`;
      const clearButton =
        searchValue && isOpen
          ? `<button class="pf-clear pf-clear--search" type="button" aria-label="Очистить поиск по полю ${escapeAttr(control.label)}" data-modal-action="clear-search" data-id="${escapeAttr(control.id)}">${iconPickerCross()}</button>`
          : hasValue && !isOpen
            ? `<button class="pf-clear" type="button" aria-label="Очистить ${escapeAttr(control.label)}" data-modal-action="clear-control" data-id="${escapeAttr(control.id)}">${iconPickerCross()}</button>`
            : "";

      return `
        <div class="pf-control pf-control--request pf-control--modal ${isOpen ? "is-open" : ""} ${showError ? "is-invalid" : ""}" data-modal-control="${escapeAttr(control.id)}">
          <div
            class="pf-field ${hasValue ? "has-value" : ""}"
            role="button"
            tabindex="${control.disabled ? "-1" : "0"}"
            aria-haspopup="listbox"
            aria-expanded="${isOpen}"
            aria-disabled="${control.disabled}"
            aria-invalid="${showError}"
            aria-describedby="pf-modal-${escapeAttr(control.id)}-error"
            data-modal-action="toggle-control"
            data-id="${escapeAttr(control.id)}"
          >
            ${fieldBody}
            ${clearButton}
            ${iconArrow()}
          </div>
          ${control.value ? `<input type="hidden" name="${escapeAttr(control.queryKey)}" value="${escapeAttr(control.value.id)}">` : ""}
          <span class="pf-modal-field__error" id="pf-modal-${escapeAttr(control.id)}-error" ${showError ? "" : "hidden"}>${escapeHtml(showError ? error : "")}</span>
          ${isOpen && !control.disabled ? this.dropdownTemplate(control) : ""}
        </div>
      `;
    }

    dropdownTemplate(control) {
      const query = (this.state.search[control.id] || "").trim().toLowerCase();
      const options = (control.options || []).filter((option) =>
        option.label.toLowerCase().includes(query),
      );

      return `
        <div class="pf-dropdown" role="listbox">
          <div class="pf-options">
            ${options.length ? options.map((option) => this.optionTemplate(option, control)).join("") : emptyTemplate()}
          </div>
        </div>
      `;
    }

    mobileOptionsTemplate(control) {
      const query = (this.state.search[control.id] || "").trim().toLowerCase();
      const searchValue = this.state.search[control.id] || "";
      const options = control.options.filter((option) =>
        option.label.toLowerCase().includes(query),
      );
      const hasSelection = Boolean(control.value);
      const nextControl =
        control.id === "brand" ? this.getControl("model") : null;
      const canChooseNext = Boolean(
        nextControl && !nextControl.disabled && nextControl.options.length,
      );

      return `
        <div class="pf-mobile-screen pf-modal__mobile-options tri-home" aria-label="Выбор: ${escapeAttr(control.label)}">
          <div class="pf-mobile-content pf-mobile-content--expanded">
            <div class="pf-mobile-expanded__header">
              <button class="pf-mobile-expanded__title" type="button" data-modal-action="close-mobile-options">
                ${iconBack()}
                <span>${escapeHtml(control.label)}</span>
              </button>
              ${
                hasSelection
                  ? `<button class="pf-mobile-expanded__reset" type="button" data-modal-action="clear-control" data-id="${escapeAttr(control.id)}">
                      ${iconReset()}<span>Сбросить</span>
                    </button>`
                  : ""
              }
            </div>
            <div class="pf-mobile-expanded__panel">
              <div class="pf-mobile-search ${searchValue ? "is-filled" : ""}" data-modal-mobile-search-field="${escapeAttr(control.id)}">
                <label class="visually-hidden" for="pf-modal-mobile-search-${escapeAttr(control.id)}">Поиск: ${escapeHtml(control.label)}</label>
                <input id="pf-modal-mobile-search-${escapeAttr(control.id)}" type="search" value="${escapeAttr(searchValue)}" placeholder="Начните ввод..." data-modal-search="${escapeAttr(control.id)}" autocomplete="off">
                <button class="pf-mobile-search__clear" type="button" aria-label="Очистить ${escapeAttr(control.label)}" data-modal-action="clear-search" data-id="${escapeAttr(control.id)}" ${searchValue ? "" : "hidden"}>
                  ${iconPickerCross()}
                </button>
                <span class="pf-mobile-search__submit" aria-hidden="true">${iconSearch()}</span>
              </div>
              <div class="pf-mobile-expanded__list">
                <div class="pf-mobile-expanded__hint">Популярные</div>
                <div class="pf-mobile-expanded__options" data-modal-expanded-options="${escapeAttr(control.id)}">
                  ${options.length ? options.map((option) => this.mobileOptionTemplate(option, control)).join("") : emptyTemplate()}
                </div>
              </div>
            </div>
            ${
              hasSelection
                ? `<div class="pf-mobile-expanded__actions">
                    ${canChooseNext ? `<button class="pf-mobile-submit" type="button" data-modal-action="choose-mobile-next">Выбрать ${escapeHtml(nextControl.label.toLowerCase())}</button>` : ""}
                    <button class="pf-mobile-submit pf-mobile-submit--secondary" type="button" data-modal-action="save-mobile-options">Сохранить</button>
                  </div>`
                : ""
            }
          </div>
        </div>
      `;
    }

    mobileOptionTemplate(option, control) {
      const selected = control.value?.id === option.id;
      return `
        <button
          class="pf-mobile-expanded__option ${selected ? "is-selected" : ""}"
          type="button"
          aria-pressed="${selected}"
          data-modal-action="select-option"
          data-id="${escapeAttr(control.id)}"
          data-value="${escapeAttr(option.id)}"
        >
          <span>${escapeHtml(option.label)}</span>
          ${selected ? `<span class="pf-mobile-expanded__check">${iconCheck()}</span>` : ""}
        </button>
      `;
    }

    optionTemplate(option, control) {
      const selected = control.value?.id === option.id;
      return `
        <button class="pf-option ${selected ? "is-selected" : ""}" type="button" role="option" aria-selected="${selected}" data-modal-action="select-option" data-id="${escapeAttr(control.id)}" data-value="${escapeAttr(option.id)}">
          <span class="pf-option__label">${escapeHtml(option.label)}</span>
        </button>
      `;
    }

    async selectHistory(id) {
      const item = this.state.history?.items?.find((entry) => entry.id === id);
      if (!item) return;
      this.state.values = {
        ...this.state.values,
        brand: item.brand || null,
        model: item.model || null,
        vin: item.vin || "",
        plate: item.plate || "",
      };
      this.state.historyOpen = false;
      this.updateHistoryPopover();
      this.updateVehicleControls();
      this.updateVehicleFields();
      await this.loadVehicleControls();
    }

    inputTemplate(id, placeholder, value, type = "text", required = false, className = "") {
      const error = this.getFieldError(id);
      const showError =
        this.state.validationStarted &&
        this.state.touched.has(id) &&
        Boolean(error);
      const inputAttributes = this.inputAttributes(id);
      return `
        <label class="pf-modal-field ${className} ${showError ? "is-invalid" : ""}">
          <span class="visually-hidden">${escapeHtml(placeholder)}</span>
          <input type="${escapeAttr(type)}" name="${escapeAttr(id)}" value="${escapeAttr(value || "")}" placeholder="${escapeAttr(placeholder)}" ${required ? "required" : ""} ${id === "phone" ? 'data-phone-mask="ru"' : ""} ${inputAttributes} aria-invalid="${showError}" aria-describedby="pf-modal-${escapeAttr(id)}-error" data-modal-field="${escapeAttr(id)}">
          <span class="pf-modal-field__error" id="pf-modal-${escapeAttr(id)}-error" ${showError ? "" : "hidden"}>${escapeHtml(showError ? error : "")}</span>
        </label>
      `;
    }

    textareaTemplate(id, placeholder, value) {
      const error = this.getFieldError(id);
      const showError =
        this.state.validationStarted &&
        this.state.touched.has(id) &&
        Boolean(error);
      return `
        <label class="pf-modal-field pf-modal-field--textarea ${showError ? "is-invalid" : ""}">
          <span class="visually-hidden">${escapeHtml(placeholder)}</span>
          <textarea name="${escapeAttr(id)}" placeholder="${escapeAttr(placeholder)}" required aria-invalid="${showError}" aria-describedby="pf-modal-${escapeAttr(id)}-error" data-modal-field="${escapeAttr(id)}">${escapeHtml(value || "")}</textarea>
          <span class="pf-modal-field__error" id="pf-modal-${escapeAttr(id)}-error" ${showError ? "" : "hidden"}>${escapeHtml(showError ? error : "")}</span>
        </label>
      `;
    }

    inputAttributes(id) {
      if (id === "vin") {
        return 'maxlength="17" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false"';
      }
      if (id === "plate") {
        return 'maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false"';
      }
      if (id === "name") return 'maxlength="120" autocomplete="name"';
      if (id === "phone") return 'autocomplete="tel"';
      if (id === "email") return 'maxlength="254" autocomplete="email" inputmode="email"';
      return "";
    }

    handleClick(event) {
      if (event.target.matches("[data-modal-search]")) return;

      if (event.target === event.currentTarget || event.target.closest("[data-modal-close]")) {
        event.preventDefault();
        this.close();
        return;
      }

      if (event.target.closest("[data-modal-history-toggle]")) {
        event.preventDefault();
        this.state.historyOpen = !this.state.historyOpen;
        this.updateHistoryPopover();
        return;
      }

      const historyItem = event.target.closest("[data-modal-history]");
      if (historyItem) {
        event.preventDefault();
        this.selectHistory(historyItem.dataset.modalHistory);
        return;
      }

      const controlAction = event.target.closest("[data-modal-action]");
      if (controlAction) {
        event.preventDefault();
        this.handleControlAction(controlAction);
        return;
      }

      if (this.state.openControl && !event.target.closest("[data-modal-control]")) {
        if (event.target.closest("[data-modal-field], .pf-agreement")) {
          this.collapseOpenControl();
          return;
        }
        const openControl = this.state.openControl;
        this.state.openControl = null;
        this.state.touched.add(openControl);
        this.replaceControl(openControl);
      }
    }

    handleControlAction(action) {
      const id = action.dataset.id;
      if (action.dataset.modalAction === "close-mobile-options") {
        this.closeMobileOptions();
        return;
      }
      if (action.dataset.modalAction === "save-mobile-options") {
        this.closeMobileOptions();
        return;
      }
      if (action.dataset.modalAction === "choose-mobile-next") {
        this.openMobileControl("model");
        return;
      }
      if (action.dataset.modalAction === "toggle-control") {
        this.toggleControl(id);
        return;
      }
      if (action.dataset.modalAction === "clear-control") {
        this.clearControl(id);
        return;
      }
      if (action.dataset.modalAction === "clear-search") {
        this.clearSearch(id);
        return;
      }
      if (action.dataset.modalAction === "select-option") {
        this.selectOption(id, action.dataset.value);
      }
    }

    toggleControl(id) {
      const control = this.getControl(id);
      if (!control || control.disabled) return;
      if (window.matchMedia("(max-width: 767.98px)").matches) {
        this.openMobileControl(id);
        return;
      }
      this.state.historyOpen = false;
      this.updateHistoryPopover();
      const previousControl = this.state.openControl;
      const isClosing = this.state.openControl === id;
      this.state.openControl = isClosing ? null : id;
      if (isClosing) this.state.touched.add(id);
      if (previousControl && previousControl !== id) {
        this.state.touched.add(previousControl);
      }
      this.state.search[id] = "";
      if (previousControl && previousControl !== id) this.replaceControl(previousControl);
      this.replaceControl(id);
      this.focusOpenControlSearch();
    }

    openMobileControl(id) {
      const control = this.getControl(id);
      if (!control || control.disabled) return;
      this.state.historyOpen = false;
      this.state.openControl = null;
      this.state.mobileControl = id;
      this.state.search[id] = "";
      this.updateHistoryPopover();
      this.renderMobileOptions();
    }

    clearSearch(id) {
      this.state.search[id] = "";
      const input = document.querySelector(
        `[data-modal-search="${selectorEscape(id)}"]`,
      );
      if (input) input.value = "";
      this.updateOpenDropdownOptions(id);
      this.updateSearchClearButton(id);
      input?.focus();
    }

    async clearControl(id) {
      const isMobileControl = this.state.mobileControl === id;
      this.state.values[id] = null;
      this.state.touched.add(id);
      if (id === "brand") {
        this.state.values.model = null;
      }
      this.state.openControl = null;
      this.updateVehicleControls(id === "brand" ? ["brand", "model"] : [id]);
      await this.loadVehicleControls();
      if (isMobileControl && this.state?.mobileControl === id) {
        this.renderMobileOptions();
      }
    }

    async selectOption(id, optionId) {
      const control = this.getControl(id);
      const option = control.options.find((item) => item.id === optionId);
      if (!option) return;

      this.state.values[id] = option;
      this.state.touched.add(id);
      if (id === "brand") {
        this.state.values.model = null;
      }
      const isMobileControl = this.state.mobileControl === id;
      this.state.openControl = null;
      this.updateVehicleControls(id === "brand" ? ["brand", "model"] : [id]);
      await this.loadVehicleControls();
      if (isMobileControl && this.state?.mobileControl === id) {
        this.renderMobileOptions();
      }
    }

    handleCancel(event) {
      event.preventDefault();
      if (this.state.mobileControl) {
        this.closeMobileOptions();
        return;
      }
      this.close();
    }

    handleInput(event) {
      const search = event.target.closest("[data-modal-search]");
      if (search) {
        if (event.type !== "input") return;
        const id = search.dataset.modalSearch;
        this.state.search[id] = search.value;
        this.updateOpenDropdownOptions(id);
        this.updateSearchClearButton(id);
        return;
      }

      const field = event.target.closest("[data-modal-field]");
      if (!field) return;
      const key = field.dataset.modalField;

      if (event.type === "input" && key === "vin") {
        field.value = normalizeVin(field.value);
      }
      if (event.type === "input" && key === "plate") {
        field.value = normalizePlate(field.value);
      }

      this.state.values[key] =
        field.type === "checkbox" ? field.checked : field.value;
      this.updateSubmitState();
      if (key === "agreement") {
        if (this.state.validationStarted) this.updateAgreementError();
        return;
      }
      if (this.state.validationStarted) this.updateFieldError(key);
    }

    isComplete() {
      const values = this.state.values;
      return Boolean(
        values.name.trim() &&
          window.LuzarPhoneMask?.isValid(values.phone) &&
          values.parts.trim() &&
          values.agreement,
      );
    }

    handleFocusOut(event) {
      if (!this.state.validationStarted) return;
      const field = event.target.closest("[data-modal-field]");
      if (!field) return;
      const key = field.dataset.modalField;
      this.state.touched.add(key);
      this.updateFieldError(key);
    }

    handleSubmit(event) {
      const fields = ["brand", "model", "plate", "name", "phone", "email", "parts"];
      this.state.validationStarted = true;
      fields.forEach((key) => this.state.touched.add(key));
      fields.forEach((key) => this.updateFieldError(key));
      this.updateAgreementError();

      const firstInvalid = fields.find((key) => this.getFieldError(key));
      if (!firstInvalid && this.state.values.agreement) return;

      event.preventDefault();
      const target = firstInvalid
        ? document.querySelector(
            `[data-modal-field="${selectorEscape(firstInvalid)}"], [data-modal-control="${selectorEscape(firstInvalid)}"] .pf-field`,
          )
        : document.querySelector('[data-modal-field="agreement"]');
      target?.focus({ preventScroll: false });
    }

    updateAgreementError() {
      const input = document.querySelector('[data-modal-field="agreement"]');
      const wrapper = input?.closest(".pf-agreement");
      const showError =
        this.state.validationStarted && !this.state.values.agreement;
      wrapper?.classList.toggle("is-invalid", showError);
      input?.setAttribute("aria-invalid", String(showError));
    }

    updateFieldError(key) {
      const error = this.getFieldError(key);
      const wrapper = document.querySelector(
        `[data-modal-field="${selectorEscape(key)}"]`,
      )?.closest(".pf-modal-field") || document.querySelector(
        `[data-modal-control="${selectorEscape(key)}"]`,
      );
      if (!wrapper) return;

      const control = wrapper.matches(".pf-control--modal")
        ? wrapper.querySelector(".pf-field")
        : wrapper.querySelector("input, textarea");
      const errorNode = wrapper.querySelector(".pf-modal-field__error");
      const showError =
        this.state.validationStarted &&
        this.state.touched.has(key) &&
        Boolean(error);

      wrapper.classList.toggle("is-invalid", showError);
      control?.setAttribute("aria-invalid", String(showError));
      if (errorNode) {
        errorNode.textContent = showError ? error : "";
        errorNode.hidden = !showError;
      }
    }

    getFieldError(key) {
      const values = this.state.values;
      if ((key === "brand" || key === "model") && !values[key]) {
        return FIELD_MESSAGES[key];
      }

      const value = String(values[key] || "").trim();
      if (["plate", "name", "phone", "parts"].includes(key) && !value) {
        return FIELD_MESSAGES[key];
      }
      if (key === "vin" && value && value.length !== 17) {
        return VIN_INVALID_MESSAGE;
      }
      if (key === "phone" && value && !window.LuzarPhoneMask?.isValid(value)) {
        return PHONE_INVALID_MESSAGE;
      }
      if (key === "email" && value && !isValidEmail(value)) {
        return EMAIL_INVALID_MESSAGE;
      }
      return "";
    }

  }

  function cloneVehicleValues(values) {
    return {
      brand: values.brand || null,
      model: values.model || null,
    };
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

  function emptyTemplate() {
    return `<div class="pf-empty">Ничего не найдено</div>`;
  }

  function selectorEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
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

  function iconCross() {
    return `<span class="pf-cross-icon" aria-hidden="true"></span>`;
  }

  function iconPickerCross() {
    return `<svg class="pf-cross-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.8613 4.19526C11.1216 3.93491 11.5443 3.93491 11.8047 4.19526C12.0648 4.45557 12.0648 4.87735 11.8047 5.13765L8.94234 7.99996L11.8047 10.8613L11.8496 10.9121C12.0631 11.1739 12.0487 11.5606 11.8047 11.8047C11.5606 12.0487 11.1739 12.0631 10.9121 11.8496L10.8613 11.8047L7.99996 8.94234L5.13765 11.8047C4.87735 12.0648 4.45557 12.0648 4.19526 11.8047C3.93491 11.5443 3.93491 11.1216 4.19526 10.8613L7.0566 7.99996L4.19526 5.13765C3.93491 4.8773 3.93491 4.45561 4.19526 4.19526C4.45561 3.93491 4.8773 3.93491 5.13765 4.19526L7.99996 7.0566L10.8613 4.19526Z"/></svg>`;
  }

  function iconBack() {
    return `<svg class="pf-back-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.59473 18.4785C9.32957 18.4785 9.07522 18.373 8.8877 18.1855L3.23047 12.5283C3.04309 12.3408 2.9375 12.0864 2.9375 11.8213C2.93755 11.5562 3.04302 11.3017 3.23047 11.1143L8.8877 5.45703C9.0752 5.26968 9.32965 5.16504 9.59473 5.16504C9.85981 5.16505 10.1143 5.26966 10.3018 5.45703C10.4893 5.64457 10.5947 5.89982 10.5947 6.16504C10.5946 6.4301 10.4892 6.68464 10.3018 6.87207L6.35156 10.8213L20.4229 10.8213C20.6849 10.8258 20.9354 10.9332 21.1191 11.1201C21.3029 11.3071 21.4062 11.5591 21.4063 11.8213C21.4063 12.0835 21.3029 12.3354 21.1191 12.5225C20.9354 12.7094 20.685 12.8167 20.4229 12.8213L6.35156 12.8213L10.3018 16.7715C10.4892 16.959 10.5947 17.2134 10.5947 17.4785C10.5947 17.7437 10.4892 17.9981 10.3018 18.1855C10.1142 18.373 9.85989 18.4785 9.59473 18.4785Z"/></svg>`;
  }

  function iconSearch() {
    return `<svg class="pf-search-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.99979 1.33301C8.06377 1.33294 9.10686 1.63252 10.0086 2.19727C10.9101 2.76193 11.6341 3.56935 12.0984 4.52637C12.5628 5.48363 12.7482 6.5526 12.6336 7.61035C12.519 8.66801 12.1095 9.67228 11.451 10.5078L13.8855 12.9424C14.0069 13.068 14.0735 13.2365 14.0721 13.4111C14.0705 13.5859 14.0003 13.7533 13.8767 13.877C13.7532 14.0004 13.5865 14.0707 13.4119 14.0723C13.2371 14.0738 13.0679 14.0072 12.9422 13.8857L10.5076 11.4502C9.7979 12.0095 8.96503 12.3917 8.07791 12.5635C7.19082 12.7353 6.27518 12.6924 5.40799 12.4385C4.54088 12.1846 3.7469 11.7266 3.09256 11.1035C2.43829 10.4804 1.94226 9.71008 1.64627 8.85645C1.35028 8.00277 1.26323 7.09069 1.39139 6.19629C1.51958 5.30189 1.85973 4.45103 2.38358 3.71484C2.90748 2.97862 3.60004 2.37809 4.40311 1.96387C5.20608 1.54975 6.09632 1.33311 6.99979 1.33301ZM6.99979 2.66699C5.85057 2.66703 4.74796 3.12292 3.93534 3.93555C3.12272 4.7482 2.66678 5.85076 2.66678 7C2.66678 8.14924 3.12272 9.2518 3.93534 10.0645C4.74796 10.8771 5.85057 11.333 6.99979 11.333C8.14903 11.333 9.25159 10.8771 10.0642 10.0645C10.8769 9.2518 11.3328 8.14927 11.3328 7C11.3328 5.85073 10.8769 4.7482 10.0642 3.93555C9.25159 3.12293 8.14903 2.66699 6.99979 2.66699Z"/></svg>`;
  }

  function iconReset() {
    return `<svg class="pf-reset-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.27441 1.56098C7.6919 1.18121 9.19598 1.2787 10.5518 1.84027C11.3452 2.16894 12.0617 2.64706 12.667 3.24066V1.66645H14L13.999 5.00043L13.333 5.66645H10V4.33344H11.8711C11.3592 3.793 10.7373 3.36113 10.041 3.0727C8.95656 2.62354 7.75394 2.54442 6.62012 2.84809C5.48612 3.15194 4.48326 3.82198 3.76855 4.75336C3.05393 5.68474 2.66701 6.82648 2.66699 8.00043C2.66706 9.17419 3.05411 10.3152 3.76855 11.2465C4.48326 12.1779 5.4861 12.8479 6.62012 13.1518C7.75402 13.4555 8.95649 13.3764 10.041 12.9272C11.1256 12.4779 12.0312 11.6831 12.6182 10.6664L13.7734 11.3334C13.0397 12.6043 11.9074 13.598 10.5518 14.1596C9.19596 14.7212 7.69192 14.8197 6.27441 14.4399C4.85708 14.0601 3.60427 13.2231 2.71094 12.059C1.81763 10.8948 1.33308 9.46786 1.33301 8.00043C1.33303 6.53298 1.81766 5.10607 2.71094 3.94184C3.60424 2.77773 4.85708 1.94084 6.27441 1.56098Z"/></svg>`;
  }

  function iconArrow() {
    return `<svg class="pf-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M12.1946 5.52821C12.4549 5.26791 12.8776 5.26798 13.1379 5.52821C13.3983 5.78856 13.3983 6.21122 13.1379 6.47157L8.47096 11.1376C8.21061 11.3979 7.78892 11.3979 7.52857 11.1376L2.86158 6.47157C2.60123 6.21122 2.60123 5.78856 2.86158 5.52821C3.1218 5.26818 3.54364 5.26836 3.80397 5.52821L7.99928 9.72352L12.1946 5.52821Z"/></svg>`;
  }

  function iconCar() {
    return `<span class="pf-history-icon" aria-hidden="true"></span>`;
  }


  function iconCheck() {
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M14.4717 4.27637L6.47168 12.2764H5.52832L1.52832 8.27637L2.47168 7.33301L6 10.8623L13.5283 3.33301L14.4717 4.27637Z"/></svg>`;
  }

  function iconSent() {
    return `<span class="pf-sent-icon" aria-hidden="true"></span>`;
  }

  window.PartsFinderRequestModal = new PartsFinderRequestModal();
})();
