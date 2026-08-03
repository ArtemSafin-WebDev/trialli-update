(function () {
  const DEFAULT_ENDPOINTS = {
    state: "/api/parts-finder",
    controls: "/api/parts-finder/controls",
    history: "/api/parts-finder/history",
    submit: "/api/parts-finder",
    vinSubmit: "/api/parts-finder/vin",
    vinRequest: "/api/parts-finder/vin-request",
    vinRequestOptions: "/api/parts-finder/vin-request/options",
    deleteHistory: "/api/parts-finder/history/:id",
  };
  const STEPS = ["brand", "model", "year", "engine", "modification"];
  const MODES = ["vehicle", "vin"];
  const CONTROL_WIDTHS = {
    brand: "13rem",
    model: "13rem",
    year: "9rem",
    engine: "18rem",
    modification: "16rem",
    productGroups: "23.6rem",
  };
  const VIN_REQUEST_WIDTHS = {
    brand: "20rem",
    model: "20rem",
  };
  const MOBILE_VISIBLE_OPTIONS = {
    brand: 10,
    productGroups: 4,
    default: 8,
  };
  const EMPTY_VIN_REQUEST = {
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

  class FetchPartsFinderApi {
    constructor(config = {}) {
      this.endpoints = normalizeEndpoints(config.endpoints);
      this.fetchOptions = config.fetchOptions || {};
    }

    async getState(params) {
      const url = new URL(this.endpoints.state, window.location.origin);
      appendSelectedParams(url, params.selected);
      appendVinParams(url, params);
      return this.request(url, { method: "GET" });
    }

    async getControls(params) {
      const url = new URL(this.endpoints.controls, window.location.origin);
      appendSelectedParams(url, params.selected);
      return this.request(url, { method: "GET" });
    }

    async getHistory() {
      const url = new URL(this.endpoints.history, window.location.origin);
      return this.request(url, { method: "GET" });
    }

    async getVinRequestOptions(params) {
      const url = new URL(this.endpoints.vinRequestOptions, window.location.origin);
      appendVinRequestParams(url, params.vinRequest);
      return this.request(url, { method: "GET" });
    }

    async deleteHistory(id) {
      const endpoint = resolveEndpoint(this.endpoints.deleteHistory, { id });
      const url = new URL(endpoint, window.location.origin);
      return this.request(url, {
        method: "DELETE",
      });
    }

    async request(url, options) {
      const response = await fetch(
        url,
        mergeFetchOptions(this.fetchOptions, options),
      );

      if (!response.ok) {
        throw new Error(`Parts finder API request failed: ${response.status}`);
      }

      return response.json();
    }
  }

  class PartsFinder {
    constructor(root, api, options = {}) {
      this.root = root;
      this.api = api;
      this.submitEndpoint = options.submitEndpoint || DEFAULT_ENDPOINTS.submit;
      this.endpoints = normalizeEndpoints(options.endpoints);
      this.response = null;
      this.mode = normalizeMode(options.initialMode);
      this.search = {};
      this.openControl = null;
      this.historyOpen = null;
      this.expandedTags = false;
      this.mobileFinderOpen = false;
      this.mobileExpandedControl = null;
      this.mobileHistoryOpen = false;
      this.vinSearch = {
        value: options.initialVin || "",
        result: options.initialVinResult || "",
      };
      this.vinRequest = {
        ...EMPTY_VIN_REQUEST,
        ...(options.initialVin ? { vin: options.initialVin } : {}),
        ...(options.initialVinRequest || {}),
      };
      this.selected = {
        brand: null,
        model: null,
        year: null,
        engine: null,
        modification: null,
        productGroups: [],
      };
      this.bindEvents();
    }

    async init() {
      await this.refresh();
    }

    bindEvents() {
      this.root.addEventListener("click", (event) => {
        if (event.target.matches("[data-search]")) return;
        const action = event.target.closest("[data-action]");
        if (!action) {
          this.closeFloatingLayersFromRootClick(event.target);
          return;
        }

        const actionName = action.dataset.action;
        const id = action.dataset.id;
        const value = action.dataset.value;

        event.stopPropagation();

        if (actionName === "toggle-control") this.toggleControl(id);
        if (actionName === "clear-control") this.clearControl(id);
        if (actionName === "clear-search") this.clearSearch(id);
        if (actionName === "select-option") this.selectOption(id, value);
        if (actionName === "switch-mode") this.switchMode(action.dataset.mode);
        if (actionName === "clear-vin-search") this.clearVinSearch();
        if (actionName === "toggle-request-control")
          this.toggleRequestControl(id);
        if (actionName === "clear-request-control")
          this.clearRequestControl(id);
        if (actionName === "select-request-option")
          this.selectRequestOption(id, value);
        if (actionName === "open-vin-request-modal")
          this.openVinRequestModal();
        if (actionName === "toggle-option") this.toggleOption(value);
        if (actionName === "toggle-all") this.toggleAllGroups();
        if (actionName === "toggle-history")
          this.toggleHistory(action.dataset.placement);
        if (actionName === "select-history") this.selectHistory(value);
        if (actionName === "delete-history") this.deleteHistory(value);
        if (actionName === "more-tags") this.expandTags();
        if (actionName === "remove-tag") this.removeGroup(value);
        if (actionName === "reset-tags") this.resetGroups();
        if (actionName === "open-mobile-finder") this.openMobileFinder();
        if (actionName === "close-mobile-finder") this.closeMobileFinder();
        if (actionName === "open-mobile-history") this.openMobileHistory();
        if (actionName === "close-mobile-history") this.closeMobileHistory();
        if (actionName === "open-mobile-options") this.openMobileOptions(id);
        if (actionName === "close-mobile-options") this.closeMobileOptions();
        if (actionName === "clear-mobile-search") this.clearMobileSearch(id);
        if (actionName === "save-mobile-options") this.saveMobileOptions();
        if (actionName === "choose-mobile-next") this.chooseMobileNext();

        event.preventDefault();
      });

      this.root.addEventListener("input", (event) => {
        if (event.target.matches("[data-mobile-search]")) {
          this.search[event.target.dataset.mobileSearch] = event.target.value;
          this.updateMobileExpandedOptions(event.target.dataset.mobileSearch);
          this.updateMobileSearchState(event.target.dataset.mobileSearch);
          return;
        }
        if (event.target.matches("[data-search]")) {
          this.search[event.target.dataset.search] = event.target.value;
          this.updateOpenDropdownOptions(event.target.dataset.search);
          this.updateSearchClearButton(event.target.dataset.search);
          return;
        }
        if (event.target.matches("[data-vin-search]")) {
          this.updateVinSearchValue(event.target.value);
          this.updateVinSearchClearButton();
          this.updateVinSearchSubmitState();
          return;
        }
        if (event.target.matches("[data-vin-request-field]")) {
          this.updateVinRequestField(event.target);
          this.updateVinRequestSubmitState();
          return;
        }
      });

      this.root.addEventListener("change", (event) => {
        if (event.target.matches("[data-group-option]")) {
          this.toggleOption(event.target.value);
          return;
        }
        if (event.target.matches("[data-groups-all]")) {
          this.toggleAllGroups();
          return;
        }
        if (!event.target.matches("[data-vin-request-field]")) return;
        this.updateVinRequestField(event.target);
        this.updateVinRequestSubmitState();
      });

      document.addEventListener("click", (event) => {
        if (this.root.contains(event.target)) return;
        if (!this.openControl && !this.historyOpen) return;
        this.closeFloatingLayers();
      });
    }

    async refresh(renderOptions = {}) {
      this.response = await this.api.getState({
        selected: this.selected,
        mode: this.mode,
        vinSearch: this.vinSearch,
        vinRequest: this.vinRequest,
      });
      this.syncResponseState();
      this.render(renderOptions);
    }

    render(options = {}) {
      if (!this.response) return;
      this.root.innerHTML = this.template();
      window.LuzarPhoneMask?.init(this.root);
      const input =
        (options.skipAutofocus
          ? null
          : this.root.querySelector("[data-autofocus]")) ||
        (options.focusVinSearch
          ? this.root.querySelector("[data-vin-search]")
          : null) ||
        (options.focusVinRequestField
          ? this.root.querySelector(
              `[data-vin-request-field="${options.focusVinRequestField}"]`,
            )
          : null);
      if (input) {
        input.focus();
        if (typeof input.setSelectionRange === "function") {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
      if (options.productGroupsScrollTop !== undefined) {
        this.restoreProductGroupsScrollTop(options.productGroupsScrollTop);
      }
      if (options.mobileScrollTop !== undefined) {
        this.restoreMobileScreenScrollTop(options.mobileScrollTop);
      }
      document.body.classList.toggle("pf-mobile-lock", this.mobileFinderOpen);
      this.positionVinRequestHistory();
    }

    replaceNode(selector, html) {
      const node = this.root.querySelector(selector);
      if (!node) return;
      node.outerHTML = html;
    }

    updateControlsView(options = {}) {
      const ids =
        options.ids || this.response.controls.map((control) => control.id);
      ids.forEach((id) => {
        const control = this.response.controls.find((item) => item.id === id);
        const node = this.root.querySelector(
          `[data-control="${selectorEscape(id)}"]`,
        );
        if (control && node) node.outerHTML = this.controlTemplate(control);
      });
      const hiddenInputs = this.root.querySelector("[data-hidden-inputs]");
      if (hiddenInputs) hiddenInputs.innerHTML = this.hiddenInputsTemplate();
      const submit = this.root.querySelector(".pf-input-group .pf-submit");
      if (submit && this.response.submit) {
        submit.disabled = this.isVehicleSubmitDisabled();
        const label = submit.querySelector("span");
        if (label) label.textContent = this.response.submit.label || "Подобрать";
      }
      if (options.productGroupsScrollTop !== undefined) {
        this.restoreProductGroupsScrollTop(options.productGroupsScrollTop);
      }
      this.focusOpenControlSearch();
    }

    updateVinRequestControlsView() {
      const row = this.root.querySelector(".pf-vin-request__vehicle-row");
      if (!row) return;
      row.classList.toggle("has-history", this.hasHistoryFeature());
      row.classList.toggle("no-history", !this.hasHistoryFeature());
      const historyAnchor = row.querySelector(".pf-vin-request__history-anchor");
      if (this.hasHistoryFeature() && historyAnchor) {
        historyAnchor.outerHTML = this.vinRequestHistoryToggleTemplate();
      } else if (this.hasHistoryFeature()) {
        row.insertAdjacentHTML("afterbegin", this.vinRequestHistoryToggleTemplate());
      } else {
        historyAnchor?.remove();
      }
      this.getVinRequestControls().forEach((control) => {
        const node = row.querySelector(
          `[data-control="${selectorEscape(`vinRequest:${control.id}`)}"]`,
        );
        if (node) node.outerHTML = this.requestControlTemplate(control);
      });
      ["vin", "plate"].forEach((id) => {
        const field = row.querySelector(`[data-vin-request-field="${id}"]`);
        if (field && field.value !== this.vinRequest[id]) {
          field.value = this.vinRequest[id] || "";
        }
      });
      this.positionVinRequestHistory();
    }

    updateVinRequestSubmitState() {
      this.root
        .querySelectorAll(".pf-vin-request__form .pf-submit")
        .forEach((submit) => {
          submit.disabled = !this.isVinRequestComplete();
        });
    }

    updateVinSearchClearButton() {
      const field = this.root.querySelector(".pf-vin-search__field");
      if (!field) return;
      const clear = field.querySelector(".pf-vin-search__clear");
      if (this.vinSearch.value && !clear) {
        field.insertAdjacentHTML(
          "beforeend",
          `<button class="pf-vin-search__clear" type="button" aria-label="Очистить VIN или госномер" data-action="clear-vin-search">${iconCross()}</button>`,
        );
      }
      if (!this.vinSearch.value && clear) clear.remove();
    }

    updateVinSearchSubmitState() {
      const submit = this.root.querySelector(".pf-vin-search .pf-submit");
      if (submit) submit.disabled = !this.vinSearch.value.trim();
    }

    updateSearchClearButton(controlId) {
      const field = this.root.querySelector(
        `[data-control="${selectorEscape(controlId)}"] .pf-field`,
      );
      if (!field) return;
      const clear = field.querySelector(".pf-clear--search");
      const searchValue = this.search[controlId] || "";
      if (searchValue && !clear) {
        field.querySelector(".pf-arrow")?.insertAdjacentHTML(
          "beforebegin",
          `<button class="pf-clear pf-clear--search" type="button" aria-label="Очистить поиск" data-action="clear-search" data-id="${escapeAttr(controlId)}">${iconCross()}</button>`,
        );
      }
      if (!searchValue && clear) clear.remove();
    }

    focusOpenControlSearch() {
      if (!this.openControl || this.mobileFinderOpen) return;
      requestAnimationFrame(() => {
        const input = this.root.querySelector(
          `[data-search="${selectorEscape(this.openControl)}"]`,
        );
        if (!input) return;
        input.focus();
        if (typeof input.setSelectionRange === "function") {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
    }

    updateOpenDropdownOptions(controlId) {
      const id = controlId.startsWith("vinRequest:")
        ? controlId.slice("vinRequest:".length)
        : controlId;
      const control = controlId.startsWith("vinRequest:")
        ? this.getVinRequestControls().find((item) => item.id === id)
        : this.response.controls.find((item) => item.id === id);
      const dropdown = this.root.querySelector(
        `[data-control="${selectorEscape(controlId)}"] .pf-options`,
      );
      if (!control || !dropdown) return;
      const query = (this.search[controlId] || this.search[id] || "")
        .trim()
        .toLowerCase();
      const options = control.options.filter((option) =>
        option.label.toLowerCase().includes(query),
      );
      const optionRows = options.length
        ? options
            .map((option) =>
              controlId.startsWith("vinRequest:")
                ? this.requestOptionTemplate(option, control)
                : control.type === "multi"
                ? this.multiOptionTemplate(option, control.value)
                : this.singleOptionTemplate(option, control),
            )
            .join("")
        : emptyTemplate();
      dropdown.innerHTML =
        control.type === "multi"
          ? `${this.allGroupsOptionTemplate(control)}${optionRows}`
          : optionRows;
    }

    closeFloatingLayers() {
      const openControl = this.openControl;
      const openHistory = this.historyOpen;
      this.openControl = null;
      this.historyOpen = null;
      if (openControl) {
        const selector = `[data-control="${selectorEscape(openControl)}"]`;
        const control =
          openControl.startsWith("vinRequest:")
            ? this.getVinRequestControls().find(
                (item) => `vinRequest:${item.id}` === openControl,
              )
            : this.response.controls.find((item) => item.id === openControl);
        if (control) {
          const html = openControl.startsWith("vinRequest:")
            ? this.requestControlTemplate(control)
            : this.controlTemplate(control);
          this.replaceNode(selector, html);
        }
      }
      if (openHistory) {
        this.updateHistoryButtons();
        this.updateHistoryView(openHistory, false);
        this.root
          .querySelector(".pf-vin-request__car-icon")
          ?.classList.remove("is-open");
      }
    }

    closeFloatingLayersFromRootClick(target) {
      if (!this.openControl && !this.historyOpen) return;
      if (this.isFloatingLayerTarget(target)) return;
      this.closeFloatingLayers();
    }

    isFloatingLayerTarget(target) {
      if (!target) return false;
      if (this.openControl) {
        const control = this.root.querySelector(
          `[data-control="${selectorEscape(this.openControl)}"]`,
        );
        if (control?.contains(target)) return true;
      }
      if (this.historyOpen) {
        const placementClass =
          this.historyOpen === "vinRequest" ? "vin-request" : this.historyOpen;
        const history = this.root.querySelector(`.pf-history--${placementClass}`);
        if (history?.contains(target)) return true;
      }
      return false;
    }

    updateHistoryButtons() {
      const tabs = this.root.querySelector(".pf-tabs");
      const oldButton = tabs?.querySelector(".pf-history-toggle");
      if (!tabs) return;
      oldButton?.remove();
      if (!this.hasHistoryFeature()) return;
      tabs.insertAdjacentHTML(
        "beforeend",
        `
          <button class="pf-history-toggle ${this.historyOpen === "tabs" ? "is-open" : ""}" type="button" data-action="toggle-history" data-placement="tabs">
            ${iconCar()}
            <span>${escapeHtml(this.response.history.label || "Мои авто")}</span>
            <span class="pf-history-toggle__close">${iconHistoryClose()}</span>
          </button>
        `,
      );
    }

    updateHistoryView(placement, shouldOpen = this.historyOpen === placement) {
      const placementClass = placement === "vinRequest" ? "vin-request" : placement;
      this.root.querySelector(`.pf-history--${placementClass}`)?.remove();
      if (!shouldOpen || !this.hasHistoryFeature()) return;
      const html = this.historyTemplate(placement);
      if (placement === "vinRequest") {
        this.root.querySelector(".pf-vin-panel")?.insertAdjacentHTML("beforeend", html);
        this.positionVinRequestHistory();
        return;
      }
      this.root
        .querySelector(".parts-finder__workspace")
        ?.insertAdjacentHTML("beforeend", html);
    }

    template() {
      return `
        <article class="parts-finder ${this.mobileFinderOpen ? "is-mobile-open" : ""}" aria-labelledby="parts-finder-title">
          <h1 id="parts-finder-title" class="parts-finder__title">${formatDesktopTitle(this.response.title)}</h1>
          <div class="parts-finder__workspace">
            <div class="pf-picker-surface pf-picker-surface--${escapeAttr(this.mode)}">
              ${this.tabsTemplate()}
              ${this.mode === "vin" ? this.vinTemplate() : this.inputGroupTemplate()}
            </div>
            ${this.historyOpen === "tabs" && this.hasHistoryFeature() ? this.historyTemplate("tabs") : ""}
          </div>
          ${this.mobileFinderTemplate()}
        </article>
        ${this.hasFoundVehicle() ? this.vinFoundDisclaimerTemplate() : ""}
      `;
    }

    mobileFinderTemplate() {
      if (!this.mobileFinderOpen) return "";
      const expandedControl = this.mobileExpandedControl
        ? this.response.controls.find((control) => control.id === this.mobileExpandedControl)
        : null;

      return `
        <div class="pf-mobile-screen" aria-labelledby="pf-mobile-title">
          ${
            this.mobileHistoryOpen
              ? this.mobileHistoryTemplate()
              : expandedControl
              ? this.mobileExpandedTemplate(expandedControl)
              : this.mobileMainTemplate()
          }
        </div>
      `;
    }

    mobileMainTemplate() {
      return `
        <div class="pf-mobile-content">
          <div class="pf-mobile-titlebar">
            <div class="pf-mobile-page-title" id="pf-mobile-title">Подбор деталей</div>
            <button class="pf-mobile-close" type="button" aria-label="Закрыть подбор" data-action="close-mobile-finder">
              ${iconCross()}
            </button>
          </div>
          ${this.mobileTabsTemplate()}
          ${this.historyOpen === "tabs" && this.hasHistoryFeature() ? this.historyTemplate("tabs") : ""}
          ${
            this.mode === "vin"
              ? `<div class="pf-mobile-vin">${this.vinTemplate()}</div>`
              : this.mobileVehicleFormTemplate()
          }
        </div>
      `;
    }

    mobileTabsTemplate() {
      const vehicleSelected = this.mode === "vehicle";
      const vinSelected = this.mode === "vin";
      const history = this.response.history;
      const historyCount = history?.items?.length || 0;

      return `
        <div class="pf-mobile-tabs" role="tablist" aria-label="Режим подбора">
          <div class="pf-mobile-tabs__group">
            <button class="pf-mobile-tab" type="button" role="tab" aria-selected="${vehicleSelected}" data-action="switch-mode" data-mode="vehicle">По авто</button>
            <button class="pf-mobile-tab" type="button" role="tab" aria-selected="${vinSelected}" data-action="switch-mode" data-mode="vin">По VIN или госномеру</button>
          </div>
          ${
            this.hasHistoryFeature()
              ? `<button class="pf-mobile-history-tab" type="button" aria-label="${escapeAttr(history.label || "Мои авто")}" data-action="open-mobile-history">
                  ${iconCar()}
                  ${historyCount ? `<span>${historyCount}</span>` : ""}
                </button>`
              : ""
          }
        </div>
      `;
    }

    mobileHistoryTemplate() {
      return `
        <div class="pf-mobile-content pf-mobile-content--history">
          <button class="pf-mobile-history-title" type="button" id="pf-mobile-title" data-action="close-mobile-history">
            ${iconBack()}
            <span>${escapeHtml(this.response.history?.label || "Мои авто")}</span>
          </button>
          ${
            this.hasHistoryItems()
              ? `<div class="pf-mobile-history-cards">
                  ${this.response.history.items
                    .map((item) => this.mobileHistoryCardTemplate(item))
                    .join("")}
                </div>`
              : this.mobileHistoryEmptyTemplate()
          }
        </div>
      `;
    }

    mobileHistoryCardTemplate(item) {
      const disabled = !this.isHistoryItemSelectable(item);
      const rows = [
        ["Марка", item.brand?.label],
        ["Модель", item.model?.label],
        ["Год", item.year?.label],
        ["Объём двигателя", item.engine?.label],
        ["Модификация", item.modification?.label],
        ["VIN", item.vin],
        ["Госномер", item.plate],
      ];

      return `
        <article class="pf-mobile-history-card">
          <dl class="pf-mobile-history-card__rows">
            ${rows
              .map(
                ([label, value]) => `
                  <div class="pf-mobile-history-card__row">
                    <dt>${escapeHtml(label)}</dt>
                    <dd>${escapeHtml(value || "---")}</dd>
                  </div>
                `,
              )
              .join("")}
          </dl>
          <div class="pf-mobile-history-card__actions">
            <button class="pf-mobile-history-card__button pf-mobile-history-card__button--delete" type="button" data-action="delete-history" data-value="${escapeAttr(item.id)}">Удалить</button>
            <button class="pf-mobile-history-card__button pf-mobile-history-card__button--select" type="button" data-action="select-history" data-value="${escapeAttr(item.id)}" ${disabled ? "disabled" : ""}>Выбрать</button>
          </div>
        </article>
      `;
    }

    mobileHistoryEmptyTemplate() {
      return `
        <div class="pf-mobile-history-empty" role="status">
          <div class="pf-mobile-history-empty__content">
            <div class="pf-mobile-history-empty__icon" aria-hidden="true">
              ${iconSleep()}
            </div>
            <div class="pf-mobile-history-empty__text">
              <h2>Здесь пусто</h2>
              <p>Данные о ваших авто сохранятся автоматически после подбора запчастей</p>
            </div>
          </div>
          <button class="pf-mobile-history-empty__button" type="button" data-action="close-mobile-history">Назад к подбору</button>
        </div>
      `;
    }

    mobileVehicleFormTemplate() {
      const action =
        this.response.submit?.endpoint ||
        this.response.submit?.action ||
        this.submitEndpoint ||
        this.response.endpoint ||
        DEFAULT_ENDPOINTS.submit;

      return `
        <form class="pf-mobile-form" action="${escapeAttr(action)}" method="post">
          <div class="pf-mobile-controls">
            ${this.response.controls.map((control) => this.mobileControlTemplate(control)).join("")}
          </div>
          <div class="pf-hidden-inputs" data-hidden-inputs>${this.hiddenInputsTemplate()}</div>
          <button class="pf-mobile-submit" type="submit" ${this.isVehicleSubmitDisabled() ? "disabled" : ""}>
            ${escapeHtml(this.response.submit?.mobileLabel || "Подобрать товары")}
          </button>
        </form>
      `;
    }

    mobileControlTemplate(control) {
      const disabled = this.isControlDisabled(control);
      const activeClass = disabled ? "is-disabled" : "";
      const options = Array.isArray(control.options) ? control.options : [];
      const visibleLimit = MOBILE_VISIBLE_OPTIONS[control.id] || MOBILE_VISIBLE_OPTIONS.default;
      const visibleOptions = options.slice(0, visibleLimit);
      const moreCount = Math.max(options.length - visibleOptions.length, 0);
      const title = `${control.label}${control.id === "brand" ? "*" : ""}`;

      return `
        <section class="pf-mobile-control ${activeClass}" data-mobile-control="${escapeAttr(control.id)}">
          <h3 class="pf-mobile-control__title">${escapeHtml(title)}</h3>
          ${
            !disabled && options.length
              ? `<div class="pf-mobile-tags">
                  ${visibleOptions.map((option) => this.mobileTagTemplate(option, control)).join("")}
                  ${
                    moreCount > 0
                      ? `<button class="pf-mobile-tag pf-mobile-tag--more" type="button" data-action="open-mobile-options" data-id="${escapeAttr(control.id)}">
                          <span>Еще ${moreCount}</span>${iconRight()}
                        </button>`
                      : ""
                  }
                </div>`
              : ""
          }
        </section>
      `;
    }

    mobileTagTemplate(option, control) {
      const selected =
        control.type === "multi"
          ? (control.value || []).some((item) => item.id === option.id)
          : control.value?.id === option.id;
      const action = control.type === "multi" ? "toggle-option" : "select-option";
      const idAttr = control.type === "multi" ? "" : `data-id="${escapeAttr(control.id)}"`;

      return `
        <button
          class="pf-mobile-tag ${selected ? "is-selected" : ""}"
          type="button"
          data-action="${action}"
          ${idAttr}
          data-value="${escapeAttr(option.id)}"
          aria-pressed="${selected}"
        >${escapeHtml(option.label)}</button>
      `;
    }

    mobileExpandedTemplate(control) {
      const query = (this.search[control.id] || "").trim().toLowerCase();
      const searchValue = this.search[control.id] || "";
      const searchId = `pf-mobile-search-${control.id}`;
      const options = (control.options || []).filter((option) =>
        option.label.toLowerCase().includes(query),
      );
      const hasSelection =
        control.type === "multi"
          ? (control.value || []).length > 0
          : Boolean(control.value);

      return `
        <div class="pf-mobile-content pf-mobile-content--expanded">
          <button class="pf-mobile-expanded__title" type="button" data-action="close-mobile-options">
            ${iconBack()}
            <span>${escapeHtml(control.label)}</span>
          </button>
          <div class="pf-mobile-search ${searchValue ? "is-filled" : ""}" data-mobile-search-field="${escapeAttr(control.id)}">
            <label class="visually-hidden" for="${escapeAttr(searchId)}">Поиск: ${escapeHtml(control.label)}</label>
            <input id="${escapeAttr(searchId)}" type="search" value="${escapeAttr(searchValue)}" placeholder="${escapeAttr(control.label)}" data-mobile-search="${escapeAttr(control.id)}" data-autofocus autocomplete="off">
            <button class="pf-mobile-search__clear" type="button" aria-label="Очистить ${escapeAttr(control.label)}" data-action="clear-mobile-search" data-id="${escapeAttr(control.id)}" ${searchValue ? "" : "hidden"}>
              ${iconCross()}
            </button>
            <span class="pf-mobile-search__submit" aria-hidden="true">${iconSearch()}</span>
          </div>
          <div class="pf-mobile-expanded__list">
            <div class="pf-mobile-expanded__hint">Популярные</div>
            <div class="pf-mobile-expanded__options" data-mobile-expanded-options="${escapeAttr(control.id)}">
              ${options.length ? options.map((option) => this.mobileExpandedOptionTemplate(option, control)).join("") : emptyTemplate()}
            </div>
          </div>
          ${hasSelection ? this.mobileExpandedActionsTemplate(control) : ""}
        </div>
      `;
    }

    mobileExpandedOptionTemplate(option, control) {
      const selected =
        control.type === "multi"
          ? (control.value || []).some((item) => item.id === option.id)
          : control.value?.id === option.id;
      const action = control.type === "multi" ? "toggle-option" : "select-option";
      const idAttr = control.type === "multi" ? "" : `data-id="${escapeAttr(control.id)}"`;

      return `
        <button
          class="pf-mobile-expanded__option ${selected ? "is-selected" : ""}"
          type="button"
          data-action="${action}"
          ${idAttr}
          data-value="${escapeAttr(option.id)}"
          aria-pressed="${selected}"
        >
          <span>${escapeHtml(option.label)}</span>
          ${selected ? `<span class="pf-mobile-expanded__check">${iconCheck()}</span>` : ""}
        </button>
      `;
    }

    mobileExpandedActionsTemplate(control) {
      const next = this.getNextEnabledControl(control.id);
      return `
        <div class="pf-mobile-expanded__actions">
          ${
            next && control.type !== "multi"
              ? `<button class="pf-mobile-submit" type="button" data-action="choose-mobile-next">Выбрать ${escapeHtml(next.label.toLowerCase())}</button>`
              : ""
          }
          <button class="pf-mobile-submit pf-mobile-submit--secondary" type="button" data-action="save-mobile-options">Сохранить</button>
        </div>
      `;
    }

    tabsTemplate() {
      const tabs = this.response.tabs
        .map(
          (tab) => `
        <button
          class="pf-tab"
          type="button"
          role="tab"
          aria-selected="${tab.active ?? tab.id === this.mode}"
          data-action="switch-mode"
          data-mode="${escapeAttr(tab.id)}"
          ${tab.disabled ? "disabled" : ""}
        >${escapeHtml(tab.label)}</button>
      `,
        )
        .join("");
      const history = this.response.history;
      const historyToggle = this.hasHistoryFeature()
        ? `
          <button class="pf-history-toggle ${this.historyOpen === "tabs" ? "is-open" : ""}" type="button" data-action="toggle-history" data-placement="tabs">
            ${iconCar()}
            <span>${escapeHtml(history.label || "Мои авто")}</span>
            <span class="pf-history-toggle__close">${iconHistoryClose()}</span>
          </button>
        `
        : "";

      return `
        <div class="pf-tabs" role="tablist" aria-label="Режим подбора">
          <div class="pf-tabs__group">${tabs}</div>
          ${historyToggle}
        </div>
      `;
    }

    vinTemplate() {
      const state = this.response.vinSearch?.state || this.vinSearch.result || "";
      return `
        <div class="pf-vin-panel">
          ${this.vinSearchTemplate()}
          ${state === "not-found" ? this.vinRequestTemplate() : ""}
          ${state === "not-found" && this.historyOpen === "vinRequest" && this.hasHistoryFeature() ? this.historyTemplate("vinRequest") : ""}
        </div>
        ${state === "found" ? this.vinFoundTemplate() : ""}
      `;
    }

    vinSearchTemplate() {
      const search = this.response.vinSearch || {};
      const action =
        search.endpoint ||
        search.action ||
        this.endpoints.vinSubmit ||
        this.submitEndpoint;
      const queryKey = search.queryKey || "vin";
      const label = search.submit?.label || "Подобрать товары";
      const value = search.value ?? this.vinSearch.value ?? "";
      const disabled =
        !String(value).trim() ||
        search.submit?.disabled ||
        (search.state || this.vinSearch.result) === "not-found";

      return `
        <form class="pf-vin-search" action="${escapeAttr(action)}" method="post">
          <input type="hidden" name="mode" value="vin">
          <label class="pf-vin-search__field">
            <span class="visually-hidden">VIN или госномер</span>
            <input class="pf-vin-search__input" type="text" name="${escapeAttr(queryKey)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(search.placeholder || "Введите VIN или госномер")}" data-vin-search autocomplete="off" required>
            ${
              value
                ? `<button class="pf-vin-search__clear" type="button" aria-label="Очистить VIN или госномер" data-action="clear-vin-search">${iconCross()}</button>`
                : ""
            }
          </label>
          <button class="pf-submit" type="submit" ${disabled ? "disabled" : ""}>
            ${iconCar()}<span>${escapeHtml(label)}</span>
          </button>
        </form>
      `;
    }

    vinFoundTemplate() {
      const vehicle = this.getFoundVehicle();
      if (!vehicle) return "";
      const cells = [
        ["Марка", vehicle.brand?.label],
        ["Модель", vehicle.model?.label],
        ["Год", vehicle.year?.label],
        ["Объём двигателя", vehicle.engine?.label],
        ["Модификация", vehicle.modification?.label],
      ];

      return `
        <section class="pf-vin-found" aria-label="Найденный автомобиль">
          <p class="pf-vin-found__caption">По вашим данным нашли авто:</p>
          <div class="pf-vin-found__card">
            <div class="pf-vin-found__info">
              <div class="pf-vin-found__icon" aria-hidden="true"><img class="pf-vin-icon" src="/assets/trialli-home/picker-auto.svg" alt=""></div>
              <div class="pf-vin-found__grid">
                ${cells
                  .map(
                    ([label, value]) => `
                      <div class="pf-vin-found__cell">
                        <span class="pf-vin-found__label">${escapeHtml(label)}</span>
                        <span class="pf-vin-found__value">${escapeHtml(value || "Не указано")}</span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>
            <button class="pf-vin-found__reject" type="button" data-action="open-vin-request-modal">
              ${iconVinReject()}
              <span>Не моё авто</span>
            </button>
          </div>
        </section>
      `;
    }

    vinFoundDisclaimerTemplate() {
      return `
        <div class="pf-vin-found__disclaimer">
          ${iconDisclaimer()}
          <span>Инструменты подбора деталей на сайте не гарантируют 100% точность. Проверяйте совместимость с помощью оригинальных автомобильных каталогов.</span>
        </div>
      `;
    }

    vinRequestTemplate() {
      const request = this.response.vinRequest || {};
      const action = request.endpoint || request.action || this.endpoints.vinRequest;
      const controls = this.getVinRequestControls();
      const disabled = !this.isVinRequestComplete();

      return `
        <section class="pf-vin-request" aria-label="Заявка на подбор деталей">
          <div class="pf-vin-request__intro">
            <h2>Авто не найдено. Отправьте запрос на подбор запчастей для вашего авто</h2>
            <p>Возможно, данные в реестре ещё не обновились</p>
          </div>
          <form class="pf-vin-request__form" action="${escapeAttr(action)}" method="post">
            <input type="hidden" name="mode" value="vin-request">
            <div class="pf-vin-request__fields">
              <div class="pf-vin-request__main-fields">
                <div class="pf-vin-request__vehicle-row ${this.hasHistoryFeature() ? "has-history" : "no-history"}">
                  ${this.vinRequestHistoryToggleTemplate()}
                  ${controls.map((control) => this.requestControlTemplate(control)).join("")}
                  ${this.requestInputTemplate("vin", "VIN", false)}
                  ${this.requestInputTemplate("plate", "Госномер", false)}
                </div>
                <div class="pf-vin-request__contact-row">
                  ${this.requestInputTemplate("name", "ФИО*", true)}
                  ${this.requestInputTemplate("phone", "Телефон*", true, "tel")}
                  ${this.requestInputTemplate("email", "Email", false, "email")}
                </div>
              </div>
              ${this.requestInputTemplate("parts", "Интересующие запчасти*", true)}
            </div>
            ${this.agreementTemplate("inline")}
            <button class="pf-submit pf-submit--with-icon" type="submit" ${disabled ? "disabled" : ""}>
              ${iconCar()}
              <span>${escapeHtml(request.submit?.label || "Отправить запрос")}</span>
            </button>
          </form>
        </section>
      `;
    }

    requestInputTemplate(id, placeholder, required, type = "text") {
      const value = this.vinRequest[id] || "";
      if (id === "parts") {
        return `
          <label class="pf-request-input pf-request-input--parts">
            <span class="visually-hidden">${escapeHtml(placeholder)}</span>
            <textarea
              name="${escapeAttr(id)}"
              placeholder="${escapeAttr(placeholder)}"
              ${required ? "required" : ""}
              data-vin-request-field="${escapeAttr(id)}"
            >${escapeHtml(value)}</textarea>
          </label>
        `;
      }

      return `
        <label class="pf-request-input ${id === "parts" ? "pf-request-input--parts" : ""}">
          <span class="visually-hidden">${escapeHtml(placeholder)}</span>
          <input
            type="${escapeAttr(type)}"
            name="${escapeAttr(id)}"
            value="${escapeAttr(value)}"
            placeholder="${escapeAttr(placeholder)}"
            ${required ? "required" : ""}
            ${id === "phone" ? 'data-phone-mask="ru"' : ""}
            data-vin-request-field="${escapeAttr(id)}"
          >
        </label>
      `;
    }

    agreementTemplate(scope) {
      return `
        <label class="pf-agreement pf-agreement--${escapeAttr(scope)}">
          <input type="checkbox" name="agreement" value="1" ${this.vinRequest.agreement ? "checked" : ""} data-vin-request-field="agreement">
          <span class="pf-checkbox" aria-hidden="true">${iconCheck()}</span>
          <span class="pf-agreement__text">
            Я принимаю <a href="#">Пользовательское соглашение</a> и
            <a href="#">Политику обработки персональных данных</a>
          </span>
        </label>
      `;
    }

    requestControlTemplate(control) {
      const key = `vinRequest:${control.id}`;
      const isOpen = this.openControl === key;
      const hasValue = Boolean(control.value);
      const style = `--pf-control-width:${VIN_REQUEST_WIDTHS[control.id] || "16rem"}`;
      const label = control.value?.label || control.placeholder;
      const searchValue = this.search[key] || "";
      const fieldBody = isOpen
        ? `<input class="pf-field__input" type="search" value="${escapeAttr(searchValue)}" placeholder="Начните ввод" data-search="${escapeAttr(key)}" data-autofocus autocomplete="off">`
        : `<span class="pf-field__text">${escapeHtml(label)}</span>`;
      const clearButton =
        searchValue && isOpen
          ? `<button class="pf-clear pf-clear--search" type="button" aria-label="Очистить поиск по полю ${escapeAttr(control.label)}" data-action="clear-search" data-id="${escapeAttr(key)}">${iconCross()}</button>`
          : hasValue && !isOpen
          ? `<button class="pf-clear" type="button" aria-label="Очистить ${escapeAttr(control.label)}" data-action="clear-request-control" data-id="${escapeAttr(control.id)}">${iconCross()}</button>`
          : "";

      return `
        <div class="pf-control pf-control--request ${isOpen ? "is-open" : ""}" style="${style}" data-control="${escapeAttr(key)}">
          <div
            class="pf-field ${hasValue ? "has-value" : ""}"
            role="button"
            tabindex="${control.disabled ? "-1" : "0"}"
            aria-haspopup="listbox"
            aria-expanded="${isOpen}"
            aria-disabled="${control.disabled}"
            data-action="toggle-request-control"
            data-id="${escapeAttr(control.id)}"
          >
            ${fieldBody}
            ${clearButton}
            ${iconArrow()}
          </div>
          ${control.value ? `<input type="hidden" name="${escapeAttr(control.queryKey || control.id)}" value="${escapeAttr(control.value.id)}">` : ""}
          ${isOpen && !control.disabled ? this.requestDropdownTemplate(control) : ""}
        </div>
      `;
    }

    requestDropdownTemplate(control) {
      const query = (this.search[`vinRequest:${control.id}`] || "")
        .trim()
        .toLowerCase();
      const options = control.options.filter((option) =>
        option.label.toLowerCase().includes(query),
      );

      return `
        <div class="pf-dropdown" role="listbox">
          <div class="pf-options">
            ${
              options.length
                ? options
                    .map((option) =>
                      this.requestOptionTemplate(option, control),
                    )
                    .join("")
                : emptyTemplate()
            }
          </div>
        </div>
      `;
    }

    requestOptionTemplate(option, control) {
      const selected = control.value?.id === option.id;
      return `
        <button class="pf-option ${selected ? "is-selected" : ""}" type="button" role="option" aria-selected="${selected}" data-action="select-request-option" data-id="${control.id}" data-value="${escapeAttr(option.id)}">
          <span class="pf-option__label">${escapeHtml(option.label)}</span>
          ${selected ? `<span class="pf-option__check" aria-hidden="true">${iconCheck()}</span>` : ""}
        </button>
      `;
    }

    inputGroupTemplate() {
      const controls = this.response.controls
        .map((control) => this.controlTemplate(control))
        .join("");
      const hiddenInputs = this.hiddenInputsTemplate();
      const action =
        this.response.submit?.endpoint ||
        this.response.submit?.action ||
        this.submitEndpoint ||
        this.response.endpoint ||
        DEFAULT_ENDPOINTS.submit;
      return `
        <form class="pf-input-group" action="${escapeAttr(action)}" method="post">
          <div class="pf-controls">${controls}</div>
          <div class="pf-hidden-inputs" data-hidden-inputs>${hiddenInputs}</div>
          <button class="pf-submit" type="submit" ${this.isVehicleSubmitDisabled() ? "disabled" : ""}>
            ${iconCar()}<span>${escapeHtml(this.response.submit.label)}</span>
          </button>
        </form>
      `;
    }

    hiddenInputsTemplate() {
      return this.response.controls
        .flatMap((control) => {
          const queryKey = control.queryKey || control.id;
          if (control.type === "multi") {
            return (control.value || []).map(
              (item) =>
                `<input type="hidden" name="${escapeAttr(queryKey)}" value="${escapeAttr(item.id)}">`,
            );
          }
          if (!control.value) return [];
          return [
            `<input type="hidden" name="${escapeAttr(queryKey)}" value="${escapeAttr(control.value.id)}">`,
          ];
        })
        .join("");
    }

    controlTemplate(control) {
      const isOpen = this.openControl === control.id;
      const hasValue =
        control.type === "multi"
          ? control.value.length > 0
          : Boolean(control.value);
      const classes = [
        "pf-control",
        control.type === "multi" ? "pf-control--groups" : "",
        isOpen ? "is-open" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const style = `--pf-control-width:${CONTROL_WIDTHS[control.id] || "16rem"}`;

      return `
        <div class="${classes}" style="${style}" data-control="${control.id}">
          ${this.fieldTemplate(control, hasValue, isOpen)}
          ${isOpen && !this.isControlDisabled(control) ? this.dropdownTemplate(control) : ""}
        </div>
      `;
    }

    fieldTemplate(control, hasValue, isOpen) {
      const selectedCount = control.type === "multi" ? control.value.length : 0;
      const allGroups = control.type === "multi" && control.allSelected;
      const multiLabel =
        control.type === "multi" && selectedCount > 0
          ? control.value.map((item) => item.label).join(", ")
          : control.placeholder;
      const label =
        allGroups
          ? "Все группы товаров"
          : control.type === "multi"
          ? multiLabel
          : control.value?.label || control.placeholder;
      const searchValue = this.search[control.id] || "";
      const searchPlaceholder = control.placeholder;
      const fieldBody = isOpen
        ? `<input class="pf-field__input" type="search" value="${escapeAttr(searchValue)}" placeholder="${escapeAttr(searchPlaceholder)}" data-search="${control.id}" data-autofocus autocomplete="off">`
        : `<span class="pf-field__text">${escapeHtml(label)}</span>`;
      const countBadge =
        selectedCount > 0 && !isOpen
          ? `<span class="pf-count">${selectedCount}</span>`
          : "";
      const clearButton =
        searchValue && isOpen
          ? `
        <button class="pf-clear pf-clear--search" type="button" aria-label="Очистить поиск по полю ${escapeAttr(control.label)}" data-action="clear-search" data-id="${control.id}">
          ${iconCross()}
        </button>
      `
          : hasValue && !isOpen
          ? `
        <button class="pf-clear" type="button" aria-label="Очистить ${escapeAttr(control.label)}" data-action="clear-control" data-id="${control.id}">
          ${iconCross()}
        </button>
      `
          : "";

      return `
        <div
          class="pf-field ${hasValue ? "has-value" : ""} ${allGroups ? "has-all-groups" : ""}"
          role="button"
          tabindex="${this.isControlDisabled(control) ? "-1" : "0"}"
          aria-haspopup="listbox"
          aria-expanded="${isOpen}"
          aria-disabled="${this.isControlDisabled(control)}"
          data-action="toggle-control"
          data-id="${control.id}"
        >
          ${fieldBody}
          ${countBadge}
          ${clearButton}
          ${iconArrow()}
        </div>
      `;
    }

    dropdownTemplate(control) {
      const query = (this.search[control.id] || "").trim().toLowerCase();
      const options = control.options.filter((option) =>
        option.label.toLowerCase().includes(query),
      );
      const className =
        control.type === "multi"
          ? "pf-dropdown pf-dropdown--groups"
          : "pf-dropdown";

      if (control.type === "multi") {
        return `
          <div class="${className}" role="listbox" aria-multiselectable="true">
            ${this.tagsTemplate(control)}
            <div class="pf-options">
              ${this.allGroupsOptionTemplate(control)}
              ${options.length ? options.map((option) => this.multiOptionTemplate(option, control.value)).join("") : emptyTemplate()}
            </div>
          </div>
        `;
      }

      return `
        <div class="${className}" role="listbox">
          <div class="pf-options">
            ${options.length ? options.map((option) => this.singleOptionTemplate(option, control)).join("") : emptyTemplate()}
          </div>
        </div>
      `;
    }

    allGroupsOptionTemplate(control) {
      return `
        <label class="pf-option pf-option--all ${control.allSelected ? "is-selected" : ""}">
          <input type="checkbox" ${control.allSelected ? "checked" : ""} data-groups-all>
          <span class="pf-checkbox" aria-hidden="true">${iconCheck()}</span>
          <span class="pf-option__label">Выбрать все</span>
        </label>
      `;
    }

    tagsTemplate(control) {
      const groups = control.value;
      if (!groups.length || control.allSelected) return "";
      const visible = this.expandedTags ? groups : groups.slice(0, 3);
      const moreCount = groups.length - visible.length;
      const tags = visible
        .map(
          (tag) => `
        <span class="pf-tag">
          <span class="pf-tag__label">${escapeHtml(tag.label)}</span>
          <button class="pf-tag__remove" type="button" aria-label="Удалить ${escapeAttr(tag.label)}" data-action="remove-tag" data-value="${escapeAttr(tag.id)}">
            ${iconCross()}
          </button>
        </span>
      `,
        )
        .join("");
      const more =
        !this.expandedTags && moreCount > 0
          ? `<button class="pf-more-tags" type="button" data-action="more-tags"><span>Еще ${moreCount}</span>${iconArrow()}</button>`
          : "";
      const reset =
        this.expandedTags && groups.length > 1
          ? `<button class="pf-reset-tags" type="button" data-action="reset-tags">${iconReset()}<span>Сбросить</span></button>`
          : "";

      return `<div class="pf-tags">${tags}${more}${reset}</div>`;
    }

    multiOptionTemplate(option, value) {
      const selected = value.some((item) => item.id === option.id);
      return `
        <label class="pf-option ${selected ? "is-selected" : ""}" role="option" aria-selected="${selected}">
          <input type="checkbox" value="${escapeAttr(option.id)}" ${selected ? "checked" : ""} data-group-option>
          <span class="pf-checkbox" aria-hidden="true">${iconCheck()}</span>
          <span class="pf-option__label">${escapeHtml(option.label)}</span>
        </label>
      `;
    }

    singleOptionTemplate(option, control) {
      const selected = control.value?.id === option.id;
      return `
        <button class="pf-option ${selected ? "is-selected" : ""}" type="button" role="option" aria-selected="${selected}" data-action="select-option" data-id="${control.id}" data-value="${escapeAttr(option.id)}">
          <span class="pf-option__label">${escapeHtml(option.label)}</span>
        </button>
      `;
    }

    vinRequestHistoryToggleTemplate() {
      const history = this.response.history;
      if (!this.hasHistoryFeature()) return "";
      const isOpen = this.historyOpen === "vinRequest";

      return `
        <div class="pf-vin-request__history-anchor">
          <button
            class="pf-vin-request__car-icon ${isOpen ? "is-open" : ""}"
            type="button"
            aria-label="${escapeAttr(history.label || "Мои авто")}"
            aria-haspopup="dialog"
            aria-expanded="${isOpen}"
            data-action="toggle-history"
            data-placement="vinRequest"
          >${iconCar()}</button>
        </div>
      `;
    }

    hasHistoryItems() {
      return Boolean(this.response.history?.enabled && this.response.history.items?.length);
    }

    hasHistoryFeature() {
      return Boolean(this.response.history?.enabled);
    }

    isHistoryItemSelectable(item) {
      return Boolean(item && item.selectable !== false && !item.disabled);
    }

    historyTemplate(placement = "tabs") {
      const items = this.response.history?.items || [];
      const placementClass = placement === "vinRequest" ? "vin-request" : placement;
      const className = [
        "pf-history",
        `pf-history--${placementClass}`,
        !items.length ? "pf-history--empty" : "",
      ]
        .filter(Boolean)
        .join(" ");

      if (!items.length) {
        return `
          <div class="${className}">
            <div class="pf-history-empty" role="status">
              <div class="pf-history-empty__icon" aria-hidden="true">
                ${iconSleep()}
              </div>
              <div class="pf-history-empty__content">
                <h2 class="pf-history-empty__title">Здесь пусто</h2>
                <p class="pf-history-empty__text">
                  Данные о ваших авто сохранятся автоматически,<br>
                  после подбора запчастей
                </p>
              </div>
            </div>
          </div>
        `;
      }

      const rows = items
        .map((item) => {
          const disabled = !this.isHistoryItemSelectable(item);
          return `
          <div class="pf-history__row">
            <span class="pf-history__cell">${escapeHtml(item.brand.label)}</span>
            <span class="pf-history__cell">${escapeHtml(item.model.label)}</span>
            <span class="pf-history__cell">${escapeHtml(item.year.label)}</span>
            <span class="pf-history__cell">${escapeHtml(item.engine.label)}</span>
            <span class="pf-history__cell">${escapeHtml(item.modification.label)}</span>
            <span class="pf-history__cell">${escapeHtml(item.vin || "")}</span>
            <span class="pf-history__cell">${escapeHtml(item.plate || "")}</span>
            <span class="pf-history__actions">
              <button class="pf-text-button" type="button" data-action="select-history" data-value="${escapeAttr(item.id)}" ${disabled ? "disabled" : ""}>Выбрать</button>
              <button class="pf-icon-button" type="button" aria-label="Удалить авто" data-action="delete-history" data-value="${escapeAttr(item.id)}">${iconTrash()}</button>
            </span>
          </div>
        `;
        })
        .join("");

      return `
        <div class="${className}">
          <div class="pf-history__scroller">
            <div class="pf-history__table">
              <div class="pf-history__row pf-history__row--head" aria-hidden="true">
                <span>Марка</span>
                <span>Модель</span>
                <span>Год</span>
                <span>Объем двигателя</span>
                <span>Модификация</span>
                <span>VIN</span>
                <span>Госномер</span>
                <span>Действия</span>
              </div>
              ${rows}
            </div>
          </div>
        </div>
      `;
    }

    toggleControl(id) {
      const control = this.response.controls.find((item) => item.id === id);
      if (!control || this.isControlDisabled(control)) return;
      const previousControl = this.openControl;
      const previousHistory = this.historyOpen;
      this.historyOpen = null;
      this.openControl = this.openControl === id ? null : id;
      this.search[id] = "";
      if (id !== "productGroups") this.expandedTags = false;
      if (previousHistory) this.updateHistoryView(previousHistory, false);
      if (previousControl && previousControl !== id) {
        const previous = this.response.controls.find(
          (item) => item.id === previousControl,
        );
        if (previous) {
          this.replaceNode(
            `[data-control="${selectorEscape(previousControl)}"]`,
            this.controlTemplate(previous),
          );
        }
      }
      this.replaceNode(
        `[data-control="${selectorEscape(id)}"]`,
        this.controlTemplate(control),
      );
      this.focusOpenControlSearch();
    }

    async selectOption(id, optionId) {
      const control = this.response.controls.find((item) => item.id === id);
      const option = control?.options.find((item) => item.id === optionId);
      if (!option) return;
      const mobileScrollTop = this.mobileFinderOpen
        ? this.getMobileScreenScrollTop()
        : undefined;
      this.selected[id] = option;
      this.clearAfter(id);
      this.openControl = null;
      if (!this.mobileFinderOpen) this.search[id] = "";
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render({
          mobileScrollTop,
          skipAutofocus: true,
        });
      } else {
        this.updateControlsView();
      }
    }

    async switchMode(mode) {
      const normalizedMode = normalizeMode(mode);
      const tab = this.response.tabs.find((item) => item.id === normalizedMode);
      if (!tab || tab.disabled || this.mode === normalizedMode) return;
      this.mode = normalizedMode;
      this.historyOpen = null;
      this.openControl = null;
      this.expandedTags = false;
      await this.refresh();
    }

    toggleRequestControl(id) {
      const control = this.getVinRequestControls().find((item) => item.id === id);
      if (!control || control.disabled) return;
      const key = `vinRequest:${id}`;
      const previousControl = this.openControl;
      const previousHistory = this.historyOpen;
      this.historyOpen = null;
      this.openControl = this.openControl === key ? null : key;
      this.search[key] = "";
      if (previousHistory) this.updateHistoryView(previousHistory, false);
      if (previousControl && previousControl !== key) {
        const previousId = previousControl.replace("vinRequest:", "");
        const previous = this.getVinRequestControls().find(
          (item) => item.id === previousId,
        );
        if (previous) {
          this.replaceNode(
            `[data-control="${selectorEscape(previousControl)}"]`,
            this.requestControlTemplate(previous),
          );
        }
      }
      this.replaceNode(
        `[data-control="${selectorEscape(key)}"]`,
        this.requestControlTemplate(control),
      );
      this.focusOpenControlSearch();
    }

    async selectRequestOption(id, optionId) {
      const control = this.getVinRequestControls().find((item) => item.id === id);
      const option = control?.options.find((item) => item.id === optionId);
      if (!option) return;
      this.vinRequest[id] = option;
      if (id === "brand") this.vinRequest.model = null;
      this.openControl = null;
      await this.refreshVinRequestOptions();
      this.updateVinRequestControlsView();
      this.updateVinRequestSubmitState();
    }

    async clearRequestControl(id) {
      this.vinRequest[id] = null;
      if (id === "brand") this.vinRequest.model = null;
      this.openControl = null;
      await this.refreshVinRequestOptions();
      this.updateVinRequestControlsView();
      this.updateVinRequestSubmitState();
    }

    clearVinSearch() {
      this.updateVinSearchValue("");
      const input = this.root.querySelector("[data-vin-search]");
      if (input) {
        input.value = "";
        input.focus();
      }
      this.updateVinSearchClearButton();
    }

    async toggleOption(optionId) {
      const control = this.response.controls.find(
        (item) => item.id === "productGroups",
      );
      const option = control?.options.find((item) => item.id === optionId);
      if (!option) return;
      const scrollTop = this.getProductGroupsScrollTop();
      const mobileScrollTop = this.mobileFinderOpen
        ? this.getMobileScreenScrollTop()
        : undefined;
      const selected = this.selected.productGroups;
      const exists = selected.some((item) => item.id === optionId);
      this.selected.productGroups = exists
        ? selected.filter((item) => item.id !== optionId)
        : [...selected, option];
      this.openControl = "productGroups";
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render({
          mobileScrollTop,
          skipAutofocus: true,
        });
      } else {
        this.updateControlsView({ productGroupsScrollTop: scrollTop });
      }
    }

    async toggleAllGroups() {
      const control = this.response.controls.find(
        (item) => item.id === "productGroups",
      );
      if (!control) return;
      const mobileScrollTop = this.mobileFinderOpen
        ? this.getMobileScreenScrollTop()
        : undefined;
      this.selected.productGroups = control.allSelected
        ? []
        : [...control.options];
      this.openControl = null;
      this.expandedTags = false;
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render({
          mobileScrollTop,
          skipAutofocus: true,
        });
      } else {
        this.updateControlsView();
      }
    }

    async clearControl(id) {
      const mobileScrollTop = this.mobileFinderOpen
        ? this.getMobileScreenScrollTop()
        : undefined;
      if (id === "productGroups") {
        this.selected.productGroups = [];
      } else {
        this.selected[id] = null;
        this.clearAfter(id);
      }
      this.openControl = null;
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render({
          mobileScrollTop,
          skipAutofocus: true,
        });
      } else {
        this.updateControlsView();
      }
    }

    clearSearch(id) {
      const isRequestControl = id.startsWith("vinRequest:");
      const control = isRequestControl
        ? this.getVinRequestControls().find(
            (item) => `vinRequest:${item.id}` === id,
          )
        : this.response.controls.find((item) => item.id === id);
      if (!control || this.openControl !== id) return;
      this.search[id] = "";
      this.replaceNode(
        `[data-control="${selectorEscape(id)}"]`,
        isRequestControl
          ? this.requestControlTemplate(control)
          : this.controlTemplate(control),
      );
      this.focusOpenControlSearch();
    }

    clearAfter(id) {
      const index = STEPS.indexOf(id);
      if (index >= 0) {
        STEPS.slice(index + 1).forEach((key) => {
          this.selected[key] = null;
          this.search[key] = "";
        });
      }
    }

    toggleHistory(placement = "tabs") {
      if (!this.hasHistoryFeature()) return;
      if (this.mobileFinderOpen && placement === "tabs") {
        this.openMobileHistory();
        return;
      }
      const previousControl = this.openControl;
      if (previousControl) {
        const selector = `[data-control="${selectorEscape(previousControl)}"]`;
        const control =
          previousControl.startsWith("vinRequest:")
            ? this.getVinRequestControls().find(
                (item) => `vinRequest:${item.id}` === previousControl,
              )
            : this.response.controls.find((item) => item.id === previousControl);
        if (control) {
          this.replaceNode(
            selector,
            previousControl.startsWith("vinRequest:")
              ? this.requestControlTemplate(control)
              : this.controlTemplate(control),
          );
        }
      }
      this.historyOpen = this.historyOpen === placement ? null : placement;
      const open = this.historyOpen === placement;
      this.openControl = null;
      this.updateHistoryButtons();
      this.root
        .querySelector(".pf-vin-request__car-icon")
        ?.classList.toggle("is-open", open && placement === "vinRequest");
      this.updateHistoryView(placement, open);
    }

    async selectHistory(id) {
      const item = this.response.history?.items.find((entry) => entry.id === id);
      if (!this.isHistoryItemSelectable(item)) return;
      if (this.mode === "vin" && this.historyOpen === "vinRequest") {
        this.vinRequest = {
          ...this.vinRequest,
          brand: item.brand || null,
          model: item.model || null,
          vin: item.vin || "",
          plate: item.plate || "",
        };
        this.historyOpen = null;
        this.openControl = null;
        await this.refreshVinRequestOptions();
        this.mobileHistoryOpen = false;
        if (this.mobileFinderOpen) {
          this.render();
          return;
        }
        this.updateVinRequestControlsView();
        this.updateVinRequestSubmitState();
        this.updateHistoryView("vinRequest", false);
        return;
      }
      if (this.mode === "vin") {
        const value = item.vin || item.plate || "";
        this.vinSearch.value = value;
        if (this.response.vinSearch) {
          this.response.vinSearch = {
            ...this.response.vinSearch,
            value,
            state: "",
            vehicle: null,
            foundVehicle: null,
          };
        }
        this.historyOpen = null;
        this.openControl = null;
        this.mobileHistoryOpen = false;
        if (this.mobileFinderOpen) {
          this.render();
          return;
        }
        const input = this.root.querySelector("[data-vin-search]");
        if (input) input.value = value;
        this.updateVinSearchClearButton();
        this.updateHistoryButtons();
        this.updateHistoryView("tabs", false);
        return;
      }
      STEPS.forEach((key) => {
        this.selected[key] = item[key];
      });
      this.selected.productGroups = [];
      this.historyOpen = null;
      this.openControl = null;
      this.mobileHistoryOpen = false;
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render();
      } else {
        this.updateControlsView();
        this.updateHistoryButtons();
        this.updateHistoryView("tabs", false);
      }
    }

    updateVinRequestField(field) {
      const key = field.dataset.vinRequestField;
      if (!key) return;
      this.vinRequest[key] =
        field.type === "checkbox" ? field.checked : field.value;
    }

    updateVinSearchValue(value) {
      this.vinSearch.value = value;
      this.vinSearch.result = "";
      if (!this.response.vinSearch) return;
      this.response.vinSearch = {
        ...this.response.vinSearch,
        value,
        state: "",
        vehicle: null,
        foundVehicle: null,
      };
    }

    openVinRequestModal() {
      if (!window.PartsFinderRequestModal) return;
      const vehicle = this.response ? this.getFoundVehicle() || {} : {};
      window.PartsFinderRequestModal.open({
        endpoint:
          this.response?.vinRequest?.endpoint ||
          this.response?.vinRequest?.action ||
          this.endpoints.vinRequest,
        optionsEndpoint:
          this.response?.vinRequest?.optionsEndpoint ||
          this.endpoints.vinRequestOptions,
        controls: this.getVinRequestControls(),
        loadOptions: (values) =>
          this.api.getVinRequestOptions({ vinRequest: values }),
        vehicle,
        values: {
          ...this.vinRequest,
          brand: null,
          model: null,
          vin: "",
          plate: vehicle.plate || this.vinSearch.value || this.vinRequest.plate,
        },
        history: this.response?.history,
      });
    }

    syncResponseState() {
      const activeTab = this.response.tabs?.find((tab) => tab.active);
      this.mode = normalizeMode(
        this.response.mode || activeTab?.id || this.mode,
      );
      if (this.response.vinSearch) {
        this.vinSearch.value =
          this.response.vinSearch.value ?? this.vinSearch.value;
        this.vinSearch.result =
          this.response.vinSearch.state || this.vinSearch.result;
      }
      if (this.response.vinRequest?.value) {
        this.vinRequest = {
          ...this.vinRequest,
          ...this.response.vinRequest.value,
        };
      }
      if (!this.hasHistoryFeature()) this.historyOpen = null;
    }

    getFoundVehicle() {
      return (
        this.response.vinSearch?.vehicle ||
        this.response.vinSearch?.foundVehicle ||
        null
      );
    }

    hasFoundVehicle() {
      const state = this.response.vinSearch?.state || this.vinSearch.result || "";
      return this.mode === "vin" && state === "found" && Boolean(this.getFoundVehicle());
    }

    getVinRequestControls() {
      const controls = this.response.vinRequest?.controls;
      if (Array.isArray(controls)) return controls;
      return [
        {
          id: "brand",
          type: "single",
          label: "Марка",
          placeholder: "Марка",
          queryKey: "brand",
          disabled: false,
          value: this.vinRequest.brand,
          options: this.getVinBrandOptions(),
        },
        {
          id: "model",
          type: "single",
          label: "Модель",
          placeholder: "Модель",
          queryKey: "model",
          disabled: !this.vinRequest.brand,
          value: this.vinRequest.model,
          options: this.getVinModelOptions(this.vinRequest.brand),
        },
      ];
    }

    getVinBrandOptions() {
      return this.response?.vinRequest?.brandOptions || [];
    }

    getVinModelOptions(brand) {
      const controls = this.response?.vinRequest?.controls || [];
      const modelControl = controls.find((control) => control.id === "model");
      if (modelControl?.options) return modelControl.options;
      const brandId = brand?.id;
      return this.response?.vinRequest?.modelOptions?.[brandId] || [];
    }

    async refreshVinRequestOptions() {
      const payload = await this.api.getVinRequestOptions({
        vinRequest: this.vinRequest,
      });
      this.response.vinRequest = {
        ...this.response.vinRequest,
        ...payload,
      };
    }

    isVinRequestComplete() {
      return Boolean(
        this.vinRequest.name.trim() &&
          window.LuzarPhoneMask?.isValid(this.vinRequest.phone) &&
          this.vinRequest.parts.trim() &&
          this.vinRequest.agreement,
      );
    }

    async deleteHistory(id) {
      const history = await this.api.deleteHistory(id);
      this.response.history = history;
      this.openControl = null;
      if (!this.hasHistoryFeature()) this.historyOpen = null;
      if (this.mobileFinderOpen) {
        this.render();
        return;
      }
      this.updateHistoryButtons();
      this.updateHistoryView("tabs", this.historyOpen === "tabs");
      this.updateHistoryView("vinRequest", this.historyOpen === "vinRequest");
      this.updateVinRequestControlsView();
    }

    expandTags() {
      const scrollTop = this.getProductGroupsScrollTop();
      this.expandedTags = true;
      this.openControl = "productGroups";
      const control = this.response.controls.find((item) => item.id === "productGroups");
      if (!control) return;
      this.replaceNode('[data-control="productGroups"]', this.controlTemplate(control));
      this.restoreProductGroupsScrollTop(scrollTop);
    }

    async removeGroup(id) {
      const scrollTop = this.getProductGroupsScrollTop();
      this.selected.productGroups = this.selected.productGroups.filter(
        (item) => item.id !== id,
      );
      this.openControl = "productGroups";
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render();
      } else {
        this.updateControlsView({ productGroupsScrollTop: scrollTop });
      }
    }

    async resetGroups() {
      const scrollTop = this.getProductGroupsScrollTop();
      this.selected.productGroups = [];
      this.expandedTags = false;
      this.openControl = "productGroups";
      const payload = await this.api.getControls({ selected: this.selected });
      this.response.controls = payload.controls;
      this.response.submit = payload.submit;
      if (this.mobileFinderOpen) {
        this.render();
      } else {
        this.updateControlsView({ productGroupsScrollTop: scrollTop });
      }
    }

    openMobileFinder() {
      this.mobileFinderOpen = true;
      this.mobileExpandedControl = null;
      this.mobileHistoryOpen = false;
      this.historyOpen = null;
      this.openControl = null;
      this.render();
    }

    closeMobileFinder() {
      this.mobileFinderOpen = false;
      this.mobileExpandedControl = null;
      this.mobileHistoryOpen = false;
      this.historyOpen = null;
      document.body.classList.remove("pf-mobile-lock");
      this.render();
    }

    openMobileHistory() {
      if (!this.hasHistoryFeature()) return;
      this.mobileFinderOpen = true;
      this.mobileHistoryOpen = true;
      this.mobileExpandedControl = null;
      this.historyOpen = null;
      this.openControl = null;
      this.render();
    }

    closeMobileHistory() {
      this.mobileHistoryOpen = false;
      this.render();
    }

    openMobileOptions(id) {
      const control = this.response.controls.find((item) => item.id === id);
      if (!control || this.isControlDisabled(control)) return;
      this.mobileExpandedControl = id;
      this.mobileHistoryOpen = false;
      this.historyOpen = null;
      this.search[id] = "";
      this.render();
    }

    closeMobileOptions() {
      this.mobileExpandedControl = null;
      this.render();
    }

    saveMobileOptions() {
      this.mobileExpandedControl = null;
      this.render();
    }

    chooseMobileNext() {
      const next = this.getNextEnabledControl(this.mobileExpandedControl);
      if (!next) return;
      this.mobileExpandedControl = next.id;
      this.search[next.id] = "";
      this.render();
    }

    clearMobileSearch(controlId) {
      this.search[controlId] = "";
      const input = this.root.querySelector(
        `[data-mobile-search="${selectorEscape(controlId)}"]`,
      );
      if (input) {
        input.value = "";
        input.focus();
      }
      this.updateMobileExpandedOptions(controlId);
      this.updateMobileSearchState(controlId);
    }

    updateMobileExpandedOptions(controlId) {
      const control = this.response.controls.find((item) => item.id === controlId);
      const node = this.root.querySelector(
        `[data-mobile-expanded-options="${selectorEscape(controlId)}"]`,
      );
      if (!control || !node) return;
      const query = (this.search[controlId] || "").trim().toLowerCase();
      const options = control.options.filter((option) =>
        option.label.toLowerCase().includes(query),
      );
      node.innerHTML = options.length
        ? options
            .map((option) => this.mobileExpandedOptionTemplate(option, control))
            .join("")
        : emptyTemplate();
    }

    updateMobileSearchState(controlId) {
      const field = this.root.querySelector(
        `[data-mobile-search-field="${selectorEscape(controlId)}"]`,
      );
      if (!field) return;
      const hasValue = Boolean(this.search[controlId]);
      field.classList.toggle("is-filled", hasValue);
      const clear = field.querySelector(".pf-mobile-search__clear");
      if (clear) clear.hidden = !hasValue;
    }

    getNextEnabledControl(id) {
      const index = STEPS.indexOf(id);
      if (index < 0) return null;
      return STEPS.slice(index + 1)
        .map((key) => this.response.controls.find((control) => control.id === key))
        .find((control) => control && !this.isControlDisabled(control) && control.options?.length);
    }

    isControlDisabled(control) {
      if (control.id === "productGroups") return false;
      return Boolean(control.disabled);
    }

    isVehicleSubmitDisabled() {
      const brandControl = this.response?.controls?.find((control) => control.id === "brand");
      return !Boolean(this.selected.brand || brandControl?.value);
    }

    getProductGroupsScrollTop() {
      return (
        this.root.querySelector(
          '[data-control="productGroups"] .pf-dropdown--groups',
        )?.scrollTop || 0
      );
    }

    getMobileScreenScrollTop() {
      return this.root.querySelector(".pf-mobile-screen")?.scrollTop || 0;
    }

    restoreProductGroupsScrollTop(scrollTop) {
      const dropdown = this.root.querySelector(
        '[data-control="productGroups"] .pf-dropdown--groups',
      );
      if (!dropdown) return;
      dropdown.scrollTop = scrollTop;
    }

    restoreMobileScreenScrollTop(scrollTop) {
      const screen = this.root.querySelector(".pf-mobile-screen");
      if (!screen) return;
      screen.scrollTop = scrollTop;
    }

    positionVinRequestHistory() {
      const panel = this.root.querySelector(".pf-history--vin-request");
      if (!panel) return;
      const icon = this.root.querySelector(
        ".pf-vin-request__history-anchor .pf-vin-request__car-icon",
      );
      const fields = this.root.querySelector(".pf-vin-request__fields");
      const context = this.root.querySelector(".pf-vin-panel");
      if (!icon || !fields || !context) return;
      const iconRect = icon.getBoundingClientRect();
      const fieldsRect = fields.getBoundingClientRect();
      const contextRect = context.getBoundingClientRect();
      panel.style.setProperty(
        "--pf-history-left",
        `${iconRect.left - contextRect.left}px`,
      );
      panel.style.setProperty(
        "--pf-history-top",
        `${iconRect.bottom - contextRect.top + 4}px`,
      );
      panel.style.setProperty(
        "--pf-history-width",
        `${fieldsRect.right - iconRect.left}px`,
      );
    }

  }

  function normalizeSelected(selected) {
    return {
      brand: selected.brand || null,
      model: selected.model || null,
      year: selected.year || null,
      engine: selected.engine || null,
      modification: selected.modification || null,
      productGroups: Array.isArray(selected.productGroups)
        ? selected.productGroups
        : [],
    };
  }

  function normalizeMode(mode) {
    return MODES.includes(mode) ? mode : "vehicle";
  }

  function normalizeEndpoints(endpoints = {}) {
    return {
      ...DEFAULT_ENDPOINTS,
      ...endpoints,
    };
  }

  function createPartsFinderApi(config = {}) {
    if (config.api && typeof config.api.getState === "function") {
      return config.api;
    }

    const apiMode = config.api || config.mode || "mock";
    const endpoints = normalizeEndpoints(config.endpoints);

    if (apiMode === "fetch" || apiMode === "production") {
      return new FetchPartsFinderApi({ ...config, endpoints });
    }

    if (!window.MockPartsFinderApi) {
      throw new Error(
        "MockPartsFinderApi is not loaded. Include scripts/parts-finder-mock-api.js or set api: 'fetch'.",
      );
    }

    return new window.MockPartsFinderApi(endpoints, config);
  }

  function appendSelectedParams(url, selected) {
    Object.entries(normalizeSelected(selected)).forEach(([key, value]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append("group", item.id));
        return;
      }
      url.searchParams.set(key, value.id);
    });
  }

  function appendVinParams(url, params) {
    const mode = normalizeMode(params.mode);
    url.searchParams.set("mode", mode);
    if (mode !== "vin") return;
    const value = params.vinSearch?.value;
    if (value) url.searchParams.set("vin", value);
    const result = params.vinSearch?.result;
    if (result) url.searchParams.set("vinResult", result);
    const request = params.vinRequest || {};
    if (request.brand) url.searchParams.set("requestBrand", request.brand.id);
    if (request.model) url.searchParams.set("requestModel", request.model.id);
  }

  function appendVinRequestParams(url, request = {}) {
    if (request.brand) url.searchParams.set("brand", request.brand.id);
    if (request.model) url.searchParams.set("model", request.model.id);
  }

  function getInitialState(config = {}) {
    const query = new URLSearchParams(window.location.search);
    const initialMode =
      config.initialMode || query.get("pf_mode") || query.get("mode");
    const initialVin =
      config.initialVin ||
      query.get("vin") ||
      query.get("plate") ||
      query.get("number") ||
      "";
    const initialVinResult =
      config.initialVinResult ||
      query.get("vinResult") ||
      query.get("vin_result") ||
      "";

    return {
      initialMode,
      initialVin,
      initialVinResult,
    };
  }

  function resolveEndpoint(endpoint, params = {}) {
    return Object.entries(params).reduce((result, [key, value]) => {
      const encoded = encodeURIComponent(value);
      return result
        .replaceAll(`:${key}`, encoded)
        .replaceAll(`{${key}}`, encoded);
    }, endpoint);
  }

  function mergeFetchOptions(defaults, overrides) {
    return {
      ...defaults,
      ...overrides,
      headers: {
        ...(defaults.headers || {}),
        ...(overrides.headers || {}),
      },
    };
  }

  function emptyTemplate() {
    return `<div class="pf-empty">Ничего не найдено</div>`;
  }

  function selectorEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
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

  function formatMobileTitle(value) {
    const text = String(value);
    if (text === "Подберите детали по авто, VIN или госномеру") {
      return "Подберите детали<br>по авто, VIN<br>или госномеру";
    }
    if (text === "Подберите детали для легковых и грузовых автомобилей") {
      return "Подберите детали<br>для легковых<br>и грузовых автомобилей";
    }
    return escapeHtml(text);
  }

  function formatDesktopTitle(value) {
    const text = String(value);
    if (text === "Подберите детали по авто, VIN или госномеру") {
      return "<span>Подберите детали</span><br>по авто, VIN или госномеру";
    }
    return escapeHtml(text);
  }

  function iconCross() {
    return `<svg class="pf-cross-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.334 3.64551L8.97949 8L13.334 12.3545L12.3555 13.333L8.00098 8.97852L3.64648 13.333L2.66797 12.3545L7.02246 8L2.66797 3.64551L3.64648 2.66699L8.00098 7.02148L12.3555 2.66699L13.334 3.64551Z"/></svg>`;
  }

  function iconArrow() {
    return `<svg class="pf-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M12.1946 5.52821C12.4549 5.26791 12.8776 5.26798 13.1379 5.52821C13.3983 5.78856 13.3983 6.21122 13.1379 6.47157L8.47096 11.1376C8.21061 11.3979 7.78892 11.3979 7.52857 11.1376L2.86158 6.47157C2.60123 6.21122 2.60123 5.78856 2.86158 5.52821C3.1218 5.26818 3.54364 5.26836 3.80397 5.52821L7.99928 9.72352L12.1946 5.52821Z"/></svg>`;
  }

  function iconRight() {
    return `<svg class="pf-right-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.80469 2.19531L11.1377 7.52832V8.47168L5.80469 13.8047L4.8623 12.8623L9.72363 8L4.8623 3.1377L5.80469 2.19531Z"/></svg>`;
  }

  function iconBack() {
    return `<svg class="pf-back-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.92 19.08L3.84 12L10.92 4.92L12.34 6.34L7.68 11H20V13H7.68L12.34 17.66L10.92 19.08Z"/></svg>`;
  }

  function iconSearch() {
    return `<img class="pf-search-icon" src="/assets/trialli-home/picker-search.svg" alt="" aria-hidden="true">`;
  }

  function iconCar() {
    return `<svg class="pf-history-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M12 8C12.1111 8 12.2204 8.02454 12.3193 8.07031L12.415 8.12305L12.501 8.18848C12.5551 8.23575 12.6028 8.29012 12.6416 8.34961L12.6934 8.44238L13.3096 9.75L14.6777 9.95801C14.7876 9.9746 14.8917 10.0156 14.9824 10.0752L15.0693 10.1406L15.1445 10.2178C15.1909 10.2719 15.229 10.3326 15.2588 10.3965L15.2969 10.4951L15.3223 10.5977C15.3399 10.7015 15.3366 10.8091 15.3125 10.9121C15.2803 11.0493 15.2109 11.1771 15.1104 11.2803L15.1094 11.2812L14.1055 12.3057L14.3428 13.7568L14.3525 13.8613C14.3557 13.9665 14.3391 14.0727 14.3008 14.1719C14.2495 14.3042 14.1618 14.4226 14.0459 14.5107C13.9298 14.599 13.7898 14.6541 13.6416 14.665C13.4941 14.6758 13.3476 14.6419 13.2197 14.5713L12 13.9004L10.7812 14.5723H10.7803C10.6522 14.6422 10.5056 14.6743 10.3584 14.6631C10.2113 14.6518 10.0715 14.5982 9.95605 14.5107C9.84091 14.4234 9.75392 14.3059 9.70215 14.1748C9.65051 14.0438 9.63508 13.9011 9.65625 13.7627L9.65723 13.7578L9.89453 12.3057L8.89258 11.2822C8.79102 11.1791 8.72012 11.0509 8.6875 10.9131C8.65497 10.7754 8.66015 10.6304 8.70215 10.4951L8.74121 10.3965C8.7862 10.3 8.85068 10.2116 8.93262 10.1396L9.01953 10.0742C9.08024 10.0346 9.14668 10.0035 9.2168 9.98242L9.3252 9.95801L10.6904 9.75L11.3066 8.44336L11.3076 8.44238C11.3684 8.31413 11.4639 8.2025 11.5859 8.12305L11.6816 8.07031C11.7804 8.02461 11.8891 8.00009 12 8ZM11.4902 10.4248C11.4185 10.5768 11.2746 10.6837 11.1084 10.709L9.9209 10.8887L10.7959 11.7812C10.9083 11.8961 10.9595 12.0582 10.9336 12.2168L10.7314 13.4453L11.7568 12.8818C11.9083 12.7985 12.0926 12.7986 12.2441 12.8818L13.2676 13.4453L13.0674 12.2168C13.0415 12.0583 13.0928 11.896 13.2051 11.7812L14.0791 10.8887L12.8916 10.709C12.7256 10.6835 12.5824 10.5767 12.5107 10.4248L12 9.3418L11.4902 10.4248ZM10.9463 1.33301C11.4247 1.33307 11.8671 1.58956 12.1045 2.00488L14.4912 6.18262C14.6062 6.38398 14.667 6.61187 14.667 6.84375V7.33301C14.667 7.7012 14.3682 8 14 8C13.6318 8 13.333 7.7012 13.333 7.33301V6.84375L10.9463 2.66699H5.05371L2.66699 6.84375V9.84277L3.41211 11.333H4.66699V10.667C4.66699 10.2989 4.96497 10.0002 5.33301 10H7.33301C7.7012 10 8 10.2988 8 10.667C7.99982 11.035 7.70109 11.333 7.33301 11.333H6C6 12.0693 5.40322 12.6668 4.66699 12.667H3.41211C2.90714 12.667 2.44561 12.3813 2.21973 11.9297L1.47363 10.4385C1.38128 10.2536 1.33306 10.0495 1.33301 9.84277V6.84375C1.33301 6.61187 1.39382 6.38398 1.50879 6.18262L3.89551 2.00488C4.13289 1.58956 4.57534 1.33307 5.05371 1.33301H10.9463ZM10.8623 6.19531C11.1227 5.93513 11.5444 5.93502 11.8047 6.19531C12.065 6.45561 12.0649 6.87733 11.8047 7.1377C11.5639 7.37849 11.1197 7.58259 10.5498 7.72949C9.94637 7.88498 9.11099 8 8 8C6.88901 8 6.05363 7.88498 5.4502 7.72949C4.95152 7.60095 4.54903 7.42876 4.29492 7.22656L4.19531 7.1377L4.14941 7.08691C3.93615 6.82507 3.95135 6.43928 4.19531 6.19531C4.43928 5.95135 4.82507 5.93615 5.08691 6.14941L5.1377 6.19531L5.15918 6.20703C5.21895 6.24194 5.40236 6.33934 5.7832 6.4375C6.25752 6.55974 6.97789 6.66699 8 6.66699C9.02211 6.66699 9.74248 6.55974 10.2168 6.4375C10.723 6.30702 10.8798 6.17764 10.8623 6.19531Z"/></svg>`;
  }

  function iconVinVehicle() {
    return `<svg class="pf-vin-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9463 2.66699C11.1626 2.66697 11.3759 2.71959 11.5674 2.82031C11.7588 2.9211 11.9234 3.06676 12.0459 3.24512L12.1035 3.33887L14.4902 7.51562C14.586 7.68318 14.6445 7.86928 14.6611 8.06152L14.667 8.17773V11.1758C14.667 11.3411 14.6361 11.5051 14.5762 11.6592L14.5264 11.7725L13.7803 13.2627C13.6778 13.4679 13.5241 13.6431 13.334 13.7715C13.1439 13.8999 12.924 13.9776 12.6953 13.9961L12.5879 14H11.333C10.9969 14 10.6733 13.873 10.4268 13.6445C10.1801 13.4158 10.0282 13.102 10.0029 12.7666L10 12.667H6C6.00002 13.0031 5.87298 13.3267 5.64453 13.5732C5.4158 13.8199 5.10204 13.9718 4.7666 13.9971L4.66699 14H3.41211C3.18289 13.9999 2.95749 13.9407 2.75781 13.8281C2.55821 13.7156 2.3912 13.5534 2.27246 13.3574L2.21973 13.2627L1.47363 11.7725C1.39991 11.6247 1.35412 11.4642 1.33887 11.2998L1.33301 11.1758V8.17773C1.333 7.98497 1.37535 7.7942 1.45605 7.61914L1.50977 7.51562L3.89648 3.33887C4.00387 3.15094 4.15532 2.99126 4.33789 2.875C4.52037 2.75891 4.72879 2.68869 4.94434 2.6709L5.05371 2.66699H10.9463ZM2.66699 8.17773V11.1758L3.41211 12.667H4.66699V12.0664C4.66696 11.8859 4.73313 11.7117 4.85352 11.5771C4.97409 11.4426 5.14069 11.3566 5.32031 11.3369L5.40039 11.333H10.5996C10.7803 11.3329 10.9552 11.3999 11.0898 11.5205C11.2243 11.641 11.3093 11.8069 11.3291 11.9863L11.333 12.0664V12.667H12.5879L13.333 11.1758V8.17773L10.9463 4H5.05371L2.66699 8.17773ZM11.0361 7.40332C11.1942 7.32468 11.3775 7.31218 11.5449 7.36816C11.7122 7.42423 11.8508 7.54436 11.9297 7.70215C12.0068 7.8605 12.0186 8.04286 11.9629 8.20996C11.9071 8.37721 11.7878 8.51637 11.6309 8.59668C10.5349 9.14335 9.20667 9.33301 8 9.33301C6.76933 9.33301 5.48674 9.14499 4.37207 8.59766C4.21512 8.51692 4.09532 8.37823 4.03906 8.21094C3.98295 8.0438 3.99417 7.86117 4.07031 7.70215C4.14481 7.5565 4.27066 7.44283 4.42285 7.38281C4.57494 7.32294 4.74373 7.32042 4.89746 7.37598L5.0752 7.45312L5.23828 7.51758L5.38379 7.57031L5.55762 7.62793L5.75879 7.68945L5.98535 7.75L6.23633 7.80957L6.51074 7.86426C7.00208 7.95424 7.50049 7.99994 8 8C9.01067 8 10.1121 7.84532 11.0361 7.40332Z"/></svg>`;
  }

  function iconVinReject() {
    return `<svg class="pf-vin-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5859 9.91895C10.7627 9.91893 10.9326 9.9893 11.0576 10.1143L12 11.0576L12.9424 10.1143C13.068 9.99296 13.2365 9.92634 13.4111 9.92773C13.5859 9.92925 13.7533 9.99944 13.877 10.123C14.0006 10.2467 14.0707 10.4141 14.0723 10.5889C14.0737 10.7635 14.007 10.932 13.8857 11.0576L12.9424 12L13.8857 12.9424C13.9494 13.0039 14.0002 13.0779 14.0352 13.1592C14.07 13.2403 14.088 13.3277 14.0889 13.416C14.0896 13.5045 14.0726 13.5929 14.0391 13.6748C14.0055 13.7567 13.9561 13.831 13.8936 13.8936C13.831 13.9561 13.7567 14.0055 13.6748 14.0391C13.5929 14.0726 13.5045 14.0896 13.416 14.0889C13.3277 14.088 13.2403 14.07 13.1592 14.0352C13.0779 14.0002 13.0039 13.9494 12.9424 13.8857L12 12.9424L11.0576 13.8857C10.9961 13.9494 10.9221 14.0002 10.8408 14.0352C10.7597 14.07 10.6723 14.088 10.584 14.0889C10.4955 14.0896 10.4071 14.0726 10.3252 14.0391C10.2433 14.0055 10.169 13.9561 10.1064 13.8936C10.0439 13.831 9.99446 13.7567 9.96094 13.6748C9.92742 13.5929 9.91036 13.5045 9.91113 13.416C9.91195 13.3277 9.93002 13.2403 9.96484 13.1592C9.99977 13.0779 10.0506 13.0039 10.1143 12.9424L11.0576 12L10.1143 11.0576C9.98921 10.9326 9.91902 10.7627 9.91895 10.5859C9.91888 10.4091 9.98925 10.2394 10.1143 10.1143C10.2393 9.98917 10.4091 9.91901 10.5859 9.91895ZM10.9463 2C11.4247 2.00006 11.8671 2.25649 12.1045 2.67188L14.5791 7.00293L14.6094 7.06348C14.7465 7.37223 14.6306 7.74077 14.3311 7.91211C14.0314 8.08335 13.6545 7.99655 13.458 7.72168L13.4209 7.66406L10.9463 3.33301H5.05371L2.66699 7.51074V10.5088L3.41211 12H4.66699V11.333C4.66717 10.9651 4.96508 10.6672 5.33301 10.667H8C8.36808 10.667 8.66682 10.965 8.66699 11.333C8.66699 11.7012 8.36819 12 8 12H6C6 12.7363 5.40322 13.3328 4.66699 13.333H3.41211C2.90724 13.333 2.44566 13.0481 2.21973 12.5967L1.47363 11.1055C1.38115 10.9204 1.33301 10.7157 1.33301 10.5088V7.51074C1.33301 7.27872 1.39368 7.05009 1.50879 6.84863L3.89551 2.67188C4.13287 2.25649 4.5753 2.00006 5.05371 2H10.9463ZM10.8623 6.8623C11.1227 6.60196 11.5443 6.60196 11.8047 6.8623C12.0649 7.12267 12.065 7.54439 11.8047 7.80469C11.5639 8.04546 11.1196 8.2486 10.5498 8.39551C9.94637 8.551 9.11099 8.66699 8 8.66699C6.88901 8.66699 6.05363 8.551 5.4502 8.39551C4.9517 8.26699 4.54901 8.09567 4.29492 7.89355L4.19531 7.80469L4.14941 7.75391C3.93603 7.49212 3.95144 7.10634 4.19531 6.8623C4.43933 6.61829 4.82507 6.60301 5.08691 6.81641L5.1377 6.8623L5.15918 6.87402C5.21895 6.90893 5.40236 7.00634 5.7832 7.10449C6.25753 7.22672 6.97794 7.33301 8 7.33301C9.02206 7.33301 9.74247 7.22672 10.2168 7.10449C10.7246 6.97363 10.8809 6.8437 10.8623 6.8623Z"/></svg>`;
  }

  function iconDisclaimer() {
    return `<svg class="pf-disclaimer-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 12C8.36819 12 8.66699 12.2988 8.66699 12.667C8.66682 13.035 8.36808 13.333 8 13.333C7.63192 13.333 7.33318 13.035 7.33301 12.667C7.33301 12.2988 7.63181 12 8 12ZM8 2C8.36819 2 8.66699 2.2988 8.66699 2.66699V10C8.66699 10.3682 8.36819 10.667 8 10.667C7.63181 10.667 7.33301 10.3682 7.33301 10V2.66699C7.33301 2.2988 7.63181 2 8 2Z" />
    </svg>`;
  }

  function iconHistoryClose() {
    return `<img class="pf-history-close-icon" src="/assets/trialli-home/picker-close.svg" alt="" aria-hidden="true">`;
  }

  function iconSleep() {
    return `<svg class="pf-sleep-icon" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M42.667 40C43.194 40.0002 43.7092 40.1565 44.1475 40.4492C44.5859 40.7422 44.9281 41.1593 45.1299 41.6465C45.3316 42.1336 45.384 42.6694 45.2812 43.1865C45.1784 43.7037 44.9246 44.1788 44.5518 44.5518L38.4375 50.667H42.667C43.3741 50.6671 44.0527 50.9472 44.5527 51.4473C45.0528 51.9473 45.3329 52.6259 45.333 53.333C45.333 54.0401 45.0526 54.7187 44.5527 55.2188C44.0527 55.7188 43.3741 55.9999 42.667 56H32C31.4727 55.9999 30.957 55.8438 30.5186 55.5508C30.0801 55.2578 29.7389 54.8407 29.5371 54.3535C29.3354 53.8664 29.282 53.3306 29.3848 52.8135C29.4876 52.2964 29.7416 51.8211 30.1143 51.4482L36.2295 45.333H32C31.2928 45.333 30.6143 45.0527 30.1143 44.5527C29.6142 44.0527 29.3331 43.3741 29.333 42.667C29.333 41.9598 29.6143 41.2813 30.1143 40.7812C30.6144 40.2812 31.2928 40 32 40H42.667ZM24 21.333C24.5273 21.3331 25.043 21.4902 25.4814 21.7832C25.9197 22.0762 26.2611 22.4925 26.4629 22.9795C26.6647 23.4667 26.7181 24.0033 26.6152 24.5205C26.5123 25.0376 26.2585 25.5129 25.8857 25.8857L17.1035 34.667H24C24.7072 34.667 25.3857 34.9473 25.8857 35.4473C26.3858 35.9473 26.6669 36.6259 26.667 37.333C26.667 38.0402 26.3857 38.7187 25.8857 39.2188C25.3856 39.7188 24.7072 40 24 40H10.667C10.1398 39.9999 9.62392 39.8437 9.18555 39.5508C8.74712 39.2578 8.40491 38.8407 8.20312 38.3535C8.00148 37.8665 7.94899 37.3305 8.05176 36.8135C8.15459 36.2963 8.40851 35.8212 8.78125 35.4482L17.5625 26.667H10.667C9.95982 26.667 9.28133 26.3857 8.78125 25.8857C8.28115 25.3856 8 24.7072 8 24C8 23.2928 8.28115 22.6144 8.78125 22.1143C9.28133 21.6143 9.95983 21.333 10.667 21.333H24ZM53.333 8C53.8602 8.00011 54.3761 8.1563 54.8145 8.44922C55.2529 8.74224 55.5951 9.15928 55.7969 9.64648C55.9985 10.1335 56.051 10.6695 55.9482 11.1865C55.8454 11.7037 55.5915 12.1788 55.2188 12.5518L41.1035 26.667H53.333C54.0401 26.667 54.7187 26.9474 55.2188 27.4473C55.7188 27.9473 55.9999 28.6259 56 29.333C56 30.0403 55.7188 30.7187 55.2188 31.2188C54.7187 31.7188 54.0403 32 53.333 32H34.667C34.1398 31.9999 33.6239 31.8437 33.1855 31.5508C32.7471 31.2578 32.4049 30.8407 32.2031 30.3535C32.0015 29.8665 31.949 29.3305 32.0518 28.8135C32.1546 28.2963 32.4085 27.8212 32.7812 27.4482L46.8965 13.333H34.667C33.9599 13.333 33.2813 13.0526 32.7812 12.5527C32.2812 12.0527 32.0001 11.3741 32 10.667C32 9.95975 32.2812 9.28135 32.7812 8.78125C33.2813 8.28115 33.9597 8 34.667 8H53.333Z" fill="#E8E8E8"/>
    </svg>`;
  }

  function iconTrash() {
    return `<img src="/assets/trialli-home/picker-delete.svg" alt="" aria-hidden="true">`;
  }

  function iconReset() {
    return `<svg class="pf-reset-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.27441 1.56098C7.6919 1.18121 9.19598 1.2787 10.5518 1.84027C11.3452 2.16897 12.0617 2.64706 12.667 3.24066V1.66645H14L13.999 5.00043L13.333 5.66645H10V4.33344H11.8711C11.3592 3.793 10.7373 3.36113 10.041 3.0727C8.95656 2.62354 7.75394 2.54442 6.62012 2.84809C5.48612 3.15194 4.48326 3.82198 3.76855 4.75336C3.05393 5.68474 2.66701 6.82648 2.66699 8.00043C2.66706 9.17419 3.05411 10.3152 3.76855 11.2465C4.48326 12.1779 5.4861 12.8479 6.62012 13.1518C7.75402 13.4555 8.95649 13.3764 10.041 12.9272C11.1256 12.4779 12.0312 11.6831 12.6182 10.6664L13.7734 11.3334C13.0397 12.6043 11.9074 13.598 10.5518 14.1596C9.19596 14.7212 7.69192 14.8197 6.27441 14.4399C4.85708 14.0601 3.60427 13.2231 2.71094 12.059C1.81763 10.8948 1.33308 9.46786 1.33301 8.00043C1.33303 6.53298 1.81766 5.10607 2.71094 3.94184C3.60424 2.77773 4.85708 1.94084 6.27441 1.56098Z"/></svg>`;
  }

  function iconCheck() {
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M14.4717 4.27637L6.47168 12.2764H5.52832L1.52832 8.27637L2.47168 7.33301L6 10.8623L13.5283 3.33301L14.4717 4.27637Z"/></svg>`;
  }

  function iconSent() {
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.9619 2.88867L9.96191 14.2217L8.75488 14.3311L6.17773 9.82129L1.66895 7.24512L1.77832 6.03809L13.1113 2.03809L13.9619 2.88867ZM7.49805 9.44434L9.18848 12.4033L11.7256 5.21582L7.49805 9.44434ZM3.5957 6.81055L6.55566 8.50195L10.7832 4.27344L3.5957 6.81055Z"/></svg>`;
  }

  const root = document.getElementById("parts-finder");
  if (root) {
    const config = window.PartsFinderConfig || {};
    const endpoints = normalizeEndpoints(config.endpoints);
    const initialState = getInitialState(config);
    const partsFinder = new PartsFinder(root, createPartsFinderApi(config), {
      endpoints,
      submitEndpoint: endpoints.submit,
      ...initialState,
      initialVinRequest: config.initialVinRequest,
    });
    const publicApi = {
      openMobileFinder: () => partsFinder.openMobileFinder(),
      openVinRequestModal: () => partsFinder.openVinRequestModal(),
    };
    window.TrialliPartsFinder = {
      ...(window.TrialliPartsFinder || {}),
      ...publicApi,
    };
    window.LuzarPartsFinder = {
      ...(window.LuzarPartsFinder || {}),
      ...publicApi,
    };

    document.addEventListener("parts-finder:open-mobile", (event) => {
      event.preventDefault();
      partsFinder.openMobileFinder();
    });

    document.addEventListener("parts-finder:open-vin-request-modal", (event) => {
      event.preventDefault();
      partsFinder.openVinRequestModal();
    });

    partsFinder.init();
  }
})();
