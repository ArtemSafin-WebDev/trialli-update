(function () {
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
        search: {},
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
      this.state.openControl = null;
      const control = document.querySelector(".pf-control--modal.is-open");
      control?.classList.remove("is-open");
      control?.querySelector(".pf-field")?.setAttribute("aria-expanded", "false");
      control?.querySelector(".pf-dropdown")?.remove();
    }

    focusOpenControlSearch() {
      if (!this.state.openControl) return;
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `[data-modal-search="${selectorEscape(this.state.openControl)}"]`,
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
      document.body.append(host);
      window.LuzarPhoneMask?.init(host);
      host.showModal();
      document.documentElement.classList.add("pf-modal-open");
      host.focus({ preventScroll: true });
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
          <form class="pf-modal__form" action="${escapeAttr(this.state.endpoint)}" method="post">
            <input type="hidden" name="mode" value="vin-request">
            <div class="pf-modal__grid">
              ${this.vehicleRowTemplate()}
              ${this.inputTemplate("vin", "VIN", values.vin, "text", false, "pf-modal-field--wide pf-modal-field--vin")}
              ${this.inputTemplate("plate", "Госномер*", values.plate, "text", false, "pf-modal-field--wide pf-modal-field--plate")}
              ${this.inputTemplate("name", "ФИО*", values.name, "text", true, "pf-modal-field--wide pf-modal-field--name")}
              ${this.inputTemplate("phone", "Телефон*", values.phone, "tel", true, "pf-modal-field--phone")}
              ${this.inputTemplate("email", "Email", values.email, "email", false, "pf-modal-field--email")}
              ${this.textareaTemplate("parts", "Интересующие запчасти*", values.parts)}
            </div>
            <div class="pf-modal__actions">
              <label class="pf-agreement pf-agreement--modal">
                <input type="checkbox" name="agreement" value="1" ${values.agreement ? "checked" : ""} data-modal-field="agreement">
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
        <div class="pf-control pf-control--request pf-control--modal ${isOpen ? "is-open" : ""}" data-modal-control="${escapeAttr(control.id)}">
          <div
            class="pf-field ${hasValue ? "has-value" : ""}"
            role="button"
            tabindex="${control.disabled ? "-1" : "0"}"
            aria-haspopup="listbox"
            aria-expanded="${isOpen}"
            aria-disabled="${control.disabled}"
            data-modal-action="toggle-control"
            data-id="${escapeAttr(control.id)}"
          >
            ${fieldBody}
            ${clearButton}
            ${iconArrow()}
          </div>
          ${control.value ? `<input type="hidden" name="${escapeAttr(control.queryKey)}" value="${escapeAttr(control.value.id)}">` : ""}
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
      return `
        <label class="pf-modal-field ${className}">
          <span class="visually-hidden">${escapeHtml(placeholder)}</span>
          <input type="${escapeAttr(type)}" name="${escapeAttr(id)}" value="${escapeAttr(value || "")}" placeholder="${escapeAttr(placeholder)}" ${required ? "required" : ""} ${id === "phone" ? 'data-phone-mask="ru"' : ""} data-modal-field="${escapeAttr(id)}">
        </label>
      `;
    }

    textareaTemplate(id, placeholder, value) {
      return `
        <label class="pf-modal-field pf-modal-field--textarea">
          <span class="visually-hidden">${escapeHtml(placeholder)}</span>
          <textarea name="${escapeAttr(id)}" placeholder="${escapeAttr(placeholder)}" required data-modal-field="${escapeAttr(id)}">${escapeHtml(value || "")}</textarea>
        </label>
      `;
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
        this.replaceControl(openControl);
      }
    }

    handleControlAction(action) {
      const id = action.dataset.id;
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
      this.state.historyOpen = false;
      this.updateHistoryPopover();
      const previousControl = this.state.openControl;
      this.state.openControl = this.state.openControl === id ? null : id;
      this.state.search[id] = "";
      if (previousControl && previousControl !== id) this.replaceControl(previousControl);
      this.replaceControl(id);
      this.focusOpenControlSearch();
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
      this.state.values[id] = null;
      if (id === "brand") {
        this.state.values.model = null;
      }
      this.state.openControl = null;
      this.updateVehicleControls(id === "brand" ? ["brand", "model"] : [id]);
      await this.loadVehicleControls();
    }

    async selectOption(id, optionId) {
      const control = this.getControl(id);
      const option = control.options.find((item) => item.id === optionId);
      if (!option) return;

      this.state.values[id] = option;
      if (id === "brand") {
        this.state.values.model = null;
      }
      this.state.openControl = null;
      this.updateVehicleControls(id === "brand" ? ["brand", "model"] : [id]);
      await this.loadVehicleControls();
    }

    handleCancel(event) {
      event.preventDefault();
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

      this.state.values[key] =
        field.type === "checkbox" ? field.checked : field.value;
      this.updateSubmitState();
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

  function iconCross() {
    return `<span class="pf-cross-icon" aria-hidden="true"></span>`;
  }

  function iconPickerCross() {
    return `<svg class="pf-cross-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.8613 4.19526C11.1216 3.93491 11.5443 3.93491 11.8047 4.19526C12.0648 4.45557 12.0648 4.87735 11.8047 5.13765L8.94234 7.99996L11.8047 10.8613L11.8496 10.9121C12.0631 11.1739 12.0487 11.5606 11.8047 11.8047C11.5606 12.0487 11.1739 12.0631 10.9121 11.8496L10.8613 11.8047L7.99996 8.94234L5.13765 11.8047C4.87735 12.0648 4.45557 12.0648 4.19526 11.8047C3.93491 11.5443 3.93491 11.1216 4.19526 10.8613L7.0566 7.99996L4.19526 5.13765C3.93491 4.8773 3.93491 4.45561 4.19526 4.19526C4.45561 3.93491 4.8773 3.93491 5.13765 4.19526L7.99996 7.0566L10.8613 4.19526Z"/></svg>`;
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
