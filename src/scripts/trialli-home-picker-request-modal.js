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
      this.handleClick = this.handleClick.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleInput = this.handleInput.bind(this);
      this.closeTimer = null;
      this.optionsRequestId = 0;
    }

    open(options = {}) {
      this.close({ immediate: true });
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
        return;
      }

      if (options.immediate || !host.open) {
        if (host.open) host.close();
        host.remove();
        this.state = null;
        return;
      }

      host.classList.add("is-closing");
      this.closeTimer = window.setTimeout(() => {
        host.close();
        host.remove();
        this.state = null;
      }, 240);
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
      host.focus({ preventScroll: true });
    }

    template() {
      const values = this.state.values;
      const disabled = !this.isComplete();

      return `
        <section class="pf-modal__dialog">
          <button class="pf-modal__close" type="button" aria-label="Закрыть" data-modal-close>${iconCross()}</button>
          <div class="pf-modal__art">
            <h2 id="pf-modal-title">Оставьте заявку на подбор деталей</h2>
          </div>
          <form class="pf-modal__form" action="${escapeAttr(this.state.endpoint)}" method="post">
            <input type="hidden" name="mode" value="vin-request">
            <div class="pf-modal__grid">
              ${this.vehicleRowTemplate()}
              ${this.inputTemplate("vin", "VIN", values.vin, "text", false, "pf-modal-field--wide")}
              ${this.inputTemplate("plate", "Госномер", values.plate, "text", false, "pf-modal-field--wide")}
              ${this.inputTemplate("name", "ФИО*", values.name, "text", true, "pf-modal-field--wide")}
              ${this.inputTemplate("phone", "Телефон*", values.phone, "tel")}
              ${this.inputTemplate("email", "Email", values.email, "email")}
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

      return {
        ...(control || {}),
        id,
        label: control?.label || (isBrand ? "Марка" : "Модель"),
        placeholder: control?.placeholder || (isBrand ? "Марка" : "Модель"),
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
            <span class="pf-field__text">${escapeHtml(label)}</span>
            ${
              hasValue
                ? `<button class="pf-clear" type="button" aria-label="Очистить ${escapeAttr(control.label)}" data-modal-action="clear-control" data-id="${escapeAttr(control.id)}">${iconCross()}</button>`
                : ""
            }
            ${iconArrow()}
          </div>
          ${control.value ? `<input type="hidden" name="${escapeAttr(control.queryKey)}" value="${escapeAttr(control.value.id)}">` : ""}
          ${isOpen && !control.disabled ? this.dropdownTemplate(control) : ""}
        </div>
      `;
    }

    dropdownTemplate(control) {
      const options = control.options || [];

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
          ${selected ? `<span class="pf-option__check" aria-hidden="true">${iconCheck()}</span>` : ""}
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
      if (previousControl && previousControl !== id) this.replaceControl(previousControl);
      this.replaceControl(id);
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
    return `<svg class="pf-cross-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 5.46777L13.4678 12L20 18.5322L18.5322 20L12 13.4678L5.46777 20L4 18.5322L10.5322 12L4 5.46777L5.46777 4L12 10.5322L18.5322 4L20 5.46777Z"/></svg>`;
  }

  function iconArrow() {
    return `<svg class="pf-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.8047 5.80469L8.47168 11.1377H7.52832L2.19531 5.80469L3.1377 4.8623L8 9.72363L12.8623 4.8623L13.8047 5.80469Z"/></svg>`;
  }

  function iconCar() {
    return `<svg class="pf-history-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 8C12.1111 8 12.2204 8.02454 12.3193 8.07031L12.415 8.12305L12.501 8.18848C12.5551 8.23575 12.6028 8.29012 12.6416 8.34961L12.6934 8.44238L13.3096 9.75L14.6777 9.95801C14.7876 9.9746 14.8917 10.0156 14.9824 10.0752L15.0693 10.1406L15.1445 10.2178C15.1909 10.2719 15.229 10.3326 15.2588 10.3965L15.2969 10.4951L15.3223 10.5977C15.3399 10.7015 15.3366 10.8091 15.3125 10.9121C15.2803 11.0493 15.2109 11.1771 15.1104 11.2803L15.1094 11.2812L14.1055 12.3057L14.3428 13.7568L14.3525 13.8613C14.3557 13.9665 14.3391 14.0727 14.3008 14.1719C14.2495 14.3042 14.1618 14.4226 14.0459 14.5107C13.9298 14.599 13.7898 14.6541 13.6416 14.665C13.4941 14.6758 13.3476 14.6419 13.2197 14.5713L12 13.9004L10.7812 14.5723H10.7803C10.6522 14.6422 10.5056 14.6743 10.3584 14.6631C10.2113 14.6518 10.0715 14.5982 9.95605 14.5107C9.84091 14.4234 9.75392 14.3059 9.70215 14.1748C9.65051 14.0438 9.63508 13.9011 9.65625 13.7627L9.65723 13.7578L9.89453 12.3057L8.89258 11.2822C8.79102 11.1791 8.72012 11.0509 8.6875 10.9131C8.65497 10.7754 8.66015 10.6304 8.70215 10.4951L8.74121 10.3965C8.7862 10.3 8.85068 10.2116 8.93262 10.1396L9.01953 10.0742C9.08024 10.0346 9.14668 10.0035 9.2168 9.98242L9.3252 9.95801L10.6904 9.75L11.3066 8.44336L11.3076 8.44238C11.3684 8.31413 11.4639 8.2025 11.5859 8.12305L11.6816 8.07031C11.7804 8.02461 11.8891 8.00009 12 8ZM11.4902 10.4248C11.4185 10.5768 11.2746 10.6837 11.1084 10.709L9.9209 10.8887L10.7959 11.7812C10.9083 11.8961 10.9595 12.0582 10.9336 12.2168L10.7314 13.4453L11.7568 12.8818C11.9083 12.7985 12.0926 12.7986 12.2441 12.8818L13.2676 13.4453L13.0674 12.2168C13.0415 12.0583 13.0928 11.896 13.2051 11.7812L14.0791 10.8887L12.8916 10.709C12.7256 10.6835 12.5824 10.5767 12.5107 10.4248L12 9.3418L11.4902 10.4248ZM10.9463 1.33301C11.4247 1.33307 11.8671 1.58956 12.1045 2.00488L14.4912 6.18262C14.6062 6.38398 14.667 6.61187 14.667 6.84375V7.33301C14.667 7.7012 14.3682 8 14 8C13.6318 8 13.333 7.7012 13.333 7.33301V6.84375L10.9463 2.66699H5.05371L2.66699 6.84375V9.84277L3.41211 11.333H4.66699V10.667C4.66699 10.2989 4.96497 10.0002 5.33301 10H7.33301C7.7012 10 8 10.2988 8 10.667C7.99982 11.035 7.70109 11.333 7.33301 11.333H6C6 12.0693 5.40322 12.6668 4.66699 12.667H3.41211C2.90714 12.667 2.44561 12.3813 2.21973 11.9297L1.47363 10.4385C1.38128 10.2536 1.33306 10.0495 1.33301 9.84277V6.84375C1.33301 6.61187 1.39382 6.38398 1.50879 6.18262L3.89551 2.00488C4.13289 1.58956 4.57534 1.33307 5.05371 1.33301H10.9463ZM10.8623 6.19531C11.1227 5.93513 11.5444 5.93502 11.8047 6.19531C12.065 6.45561 12.0649 6.87733 11.8047 7.1377C11.5639 7.37849 11.1197 7.58259 10.5498 7.72949C9.94637 7.88498 9.11099 8 8 8C6.88901 8 6.05363 7.88498 5.4502 7.72949C4.95152 7.60095 4.54903 7.42876 4.29492 7.22656L4.19531 7.1377L4.14941 7.08691C3.93615 6.82507 3.95135 6.43928 4.19531 6.19531C4.43928 5.95135 4.82507 5.93615 5.08691 6.14941L5.1377 6.19531L5.15918 6.20703C5.21895 6.24194 5.40236 6.33934 5.7832 6.4375C6.25752 6.55974 6.97789 6.66699 8 6.66699C9.02211 6.66699 9.74248 6.55974 10.2168 6.4375C10.723 6.30702 10.8798 6.17764 10.8623 6.19531Z"/></svg>`;
  }

  function iconCheck() {
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M14.4717 4.27637L6.47168 12.2764H5.52832L1.52832 8.27637L2.47168 7.33301L6 10.8623L13.5283 3.33301L14.4717 4.27637Z"/></svg>`;
  }

  function iconSent() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.9619 2.88867L9.96191 14.2217L8.75488 14.3311L6.17773 9.82129L1.66895 7.24512L1.77832 6.03809L13.1113 2.03809L13.9619 2.88867ZM7.49805 9.44434L9.18848 12.4033L11.7256 5.21582L7.49805 9.44434ZM3.5957 6.81055L6.55566 8.50195L10.7832 4.27344L3.5957 6.81055Z"/></svg>`;
  }

  window.PartsFinderRequestModal = new PartsFinderRequestModal();
})();
