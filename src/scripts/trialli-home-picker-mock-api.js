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

  const MOCK_DATA = {
    title: "Подберите детали по авто, VIN или госномеру",
    tabs: [
      {
        id: "vehicle",
        label: "Подобрать по авто",
        active: true,
        disabled: false,
      },
      {
        id: "vin",
        label: "Подобрать по VIN или госномеру",
        active: false,
        disabled: false,
      },
    ],
    fields: [
      {
        id: "brand",
        type: "single",
        label: "Марка",
        placeholder: "Марка",
        queryKey: "brand",
      },
      {
        id: "model",
        type: "single",
        label: "Модель",
        placeholder: "Модель",
        queryKey: "model",
      },
      {
        id: "year",
        type: "single",
        label: "Год",
        placeholder: "Год",
        queryKey: "year",
      },
      {
        id: "engine",
        type: "single",
        label: "Объем двигателя",
        placeholder: "Объем двигателя",
        queryKey: "engine",
      },
      {
        id: "modification",
        type: "single",
        label: "Модификация",
        placeholder: "Модификация",
        queryKey: "modification",
      },
      {
        id: "productGroups",
        type: "multi",
        label: "Группа товаров",
        placeholder: "Группа товаров",
        queryKey: "group",
      },
    ],
    vehicles: [
      {
        id: "volkswagen",
        label: "Volkswagen",
        models: [
          {
            id: "tiguan",
            label: "Tiguan",
            years: [
              {
                id: "2016",
                label: "2016",
                engines: [
                  {
                    id: "20-petrol",
                    label: "2.0 бензиновый",
                    modifications: [
                      { id: "tsi-14-20", label: "бензин TSI 1.4-2.0 л" },
                      { id: "tsi-20-180", label: "2.0 TSI 180 л.с." },
                    ],
                  },
                ],
              },
              {
                id: "2018",
                label: "2018",
                engines: [
                  {
                    id: "14-petrol",
                    label: "1.4 бензиновый",
                    modifications: [
                      { id: "tsi-14", label: "1.4 TSI 150 л.с." },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "polo",
            label: "Polo",
            years: [
              {
                id: "2020",
                label: "2020",
                engines: [
                  {
                    id: "16-petrol",
                    label: "1.6 бензиновый",
                    modifications: [
                      { id: "mpi-16", label: "1.6 MPI 110 л.с." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "lada",
        label: "Lada",
        models: [
          {
            id: "vesta",
            label: "Vesta",
            years: [
              {
                id: "2021",
                label: "2021",
                engines: [
                  {
                    id: "16-petrol",
                    label: "1.6 бензиновый",
                    modifications: [
                      { id: "vesta-16", label: "ВАЗ-21129 106 л.с." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "haval",
        label: "Haval",
        models: [
          {
            id: "f7",
            label: "F7",
            years: [
              {
                id: "2022",
                label: "2022",
                engines: [
                  {
                    id: "15-turbo",
                    label: "1.5 бензиновый",
                    modifications: [{ id: "gw4b15", label: "GW4B15 150 л.с." }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "chery",
        label: "Chery",
        models: [
          {
            id: "tiggo-7",
            label: "Tiggo 7 Pro",
            years: [
              {
                id: "2023",
                label: "2023",
                engines: [
                  {
                    id: "15-turbo",
                    label: "1.5 бензиновый",
                    modifications: [
                      { id: "sqre4t15c", label: "SQRE4T15C 147 л.с." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "bmw",
        label: "BMW",
        models: [
          {
            id: "5",
            label: "5",
            years: [
              {
                id: "2018",
                label: "2018",
                engines: [
                  {
                    id: "14-petrol",
                    label: "1.4 бензиновый",
                    modifications: [{ id: "e60", label: "E60 (03-)" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "geely",
        label: "Geely",
        models: [{ id: "coolray", label: "Coolray", years: [] }],
      },
      {
        id: "kia",
        label: "Kia",
        models: [{ id: "rio", label: "Rio", years: [] }],
      },
      {
        id: "hyundai",
        label: "Hyundai",
        models: [{ id: "solaris", label: "Solaris", years: [] }],
      },
      {
        id: "skoda",
        label: "Skoda",
        models: [{ id: "octavia", label: "Octavia", years: [] }],
      },
      {
        id: "toyota",
        label: "Toyota",
        models: [{ id: "camry", label: "Camry", years: [] }],
      },
      {
        id: "audi",
        label: "Audi",
        models: [{ id: "a4", label: "A4", years: [] }],
      },
      {
        id: "belgee",
        label: "Belgee",
        models: [{ id: "x50", label: "X50", years: [] }],
      },
      {
        id: "changan",
        label: "Changan",
        models: [{ id: "cs35-plus", label: "CS35 Plus", years: [] }],
      },
      {
        id: "chevrolet",
        label: "Chevrolet",
        models: [{ id: "cruze", label: "Cruze", years: [] }],
      },
      {
        id: "citroen",
        label: "Citroen",
        models: [{ id: "c4", label: "C4", years: [] }],
      },
      {
        id: "nissan",
        label: "Nissan",
        models: [{ id: "qashqai", label: "Qashqai", years: [] }],
      },
      {
        id: "renault",
        label: "Renault",
        models: [{ id: "logan", label: "Logan", years: [] }],
      },
      {
        id: "ford",
        label: "Ford",
        models: [{ id: "focus", label: "Focus", years: [] }],
      },
    ],
    productGroups: [
      { id: "brakes", label: "Тормозная система" },
      { id: "shock-absorbers", label: "Амортизаторы и опоры" },
      { id: "belts", label: "Ремни и ролики" },
      {
        id: "exhaust",
        label: "Система выпуска отработавших газов",
      },
      { id: "hubs", label: "Ступицы и ремкомплекты" },
      { id: "clutch", label: "Сцепление" },
      { id: "cv-joints", label: "ШРУСы и приводы" },
      {
        id: "gas-springs",
        label: "Газовые упоры и электроприводы",
      },
      { id: "bearings", label: "Подшипники" },
      { id: "trialli-stands", label: "Стенды Trialli" },
    ],
  };

  const HISTORY_SEED = [
    {
      id: "audi-a4-2015",
      brand: { id: "audi", label: "Audi" },
      model: { id: "a4", label: "A4 B8 (08-)" },
      year: { id: "2015", label: "2015" },
      engine: { id: "20-petrol", label: "2.0 бензиновый" },
      modification: {
        id: "a4-quattro-190",
        label: "A4 2.0 TFSI quattro 190 л.с.",
      },
      vin: "1234567890ABCDEFG",
      plate: "",
    },
    {
      id: "bmw-5-2018",
      brand: { id: "bmw", label: "BMW" },
      model: { id: "5", label: "5" },
      year: { id: "2018", label: "2018" },
      engine: { id: "14-petrol", label: "1.4 бензиновый" },
      modification: { id: "e60", label: "A5 E60 (03-)" },
      vin: "Y6DTF69Y080144158",
      plate: "у888нд198",
    },
    {
      id: "mercedes-c-2024",
      selectable: false,
      brand: { id: "mercedes-benz", label: "Mercedes-Benz" },
      model: { id: "c-class-w205", label: "C-Class W205 (14-)" },
      year: { id: "2024", label: "2024" },
      engine: { id: "15-turbo", label: "1.5 бензиновый" },
      modification: { id: "c180-amg", label: "C 180 AMG Line 156 л.с." },
      vin: "",
      plate: "",
    },
  ];

  class MockPartsFinderApi {
    constructor(endpoints = DEFAULT_ENDPOINTS, options = {}) {
      this.data = MOCK_DATA;
      this.history = [...HISTORY_SEED];
      this.endpoints = normalizeEndpoints(endpoints);
      this.foundVehicle = options.initialFoundVehicle || HISTORY_SEED[0];
    }

    async getState(params) {
      const url = this.buildUrl(params.selected, this.endpoints.state, params);
      await wait(140);
      return this.buildResponse(params, url, "GET");
    }

    async getControls(params) {
      await wait(90);
      return this.buildControlsPayload(normalizeSelected(params.selected));
    }

    async getHistory() {
      await wait(90);
      return this.buildHistoryPayload();
    }

    async getVinRequestOptions(params) {
      await wait(90);
      return this.buildVinRequestOptionsPayload(
        normalizeVinRequest(params.vinRequest),
      );
    }

    async submitVinRequest() {
      await wait(360);
      return { ok: true };
    }

    async deleteHistory(id) {
      this.history = this.history.filter((item) => item.id !== id);
      await wait(90);
      return this.buildHistoryPayload();
    }

    buildUrl(selected, endpoint = this.endpoints.state, params = {}) {
      const url = new URL(endpoint, window.location.origin);
      appendSelectedParams(url, selected);
      appendVinParams(url, params);
      return url;
    }

    buildResponse(params, url, method) {
      const selected = normalizeSelected(params.selected);
      const mode = normalizeMode(params.mode);
      if (mode === "vin") {
        return this.buildVinResponse(params, url, method);
      }
      const controlsPayload = this.buildControlsPayload(selected);

      return {
        endpoint: this.endpoints.submit,
        request: {
          method,
          query: queryToObject(url.searchParams),
          selected,
        },
        title: this.data.title,
        mode: "vehicle",
        tabs: this.getTabs("vehicle"),
        ...controlsPayload,
        history: this.buildHistoryPayload(),
      };
    }

    buildVinResponse(params, url, method) {
      const vinSearch = normalizeVinSearch(params.vinSearch);
      const vinRequest = normalizeVinRequest(params.vinRequest);
      const requestOptionsPayload = this.buildVinRequestOptionsPayload(vinRequest);
      const foundVehicle = this.foundVehicle;
      const state = normalizeVinResult(vinSearch.result);

      return {
        endpoint: this.endpoints.submit,
        request: {
          method,
          query: queryToObject(url.searchParams),
          selected: normalizeSelected(params.selected),
          vinSearch,
          vinRequest,
        },
        title: this.data.title,
        mode: "vin",
        tabs: this.getTabs("vin"),
        controls: [],
        submit: {
          label: "Подобрать",
          disabled: true,
        },
        vinSearch: {
          endpoint: this.endpoints.vinSubmit,
          queryKey: "vin",
          placeholder: "Введите VIN или госномер",
          value: vinSearch.value,
          state,
          vehicle: state === "found" ? foundVehicle : null,
          submit: {
            label: "Подобрать",
            disabled: !vinSearch.value,
          },
        },
        vinRequest: {
          endpoint: this.endpoints.vinRequest,
          value: vinRequest,
          ...requestOptionsPayload,
        },
        history: this.buildHistoryPayload(),
      };
    }

    buildControlsPayload(selected) {
      const options = this.getOptions(selected);
      const controls = this.data.fields.map((field) => {
        const previousComplete = this.isPreviousComplete(field.id, selected);
        const value =
          field.type === "multi" ? selected.productGroups : selected[field.id];
        const fieldOptions =
          field.id === "productGroups"
            ? this.data.productGroups
            : options[field.id];

        return {
          ...field,
          disabled:
            field.id === "brand" || field.id === "productGroups"
              ? false
              : !previousComplete,
          value,
          options: fieldOptions,
          allSelected:
            field.id === "productGroups" &&
            value.length === this.data.productGroups.length,
        };
      });

      return {
        controls,
        submit: {
          label: "Подобрать",
          mobileLabel: "Подобрать товары",
          disabled: !selected.brand,
        },
      };
    }

    buildHistoryPayload() {
      return {
        enabled: true,
        label: "Мои авто",
        items: this.history,
      };
    }

    buildVinRequestOptionsPayload(vinRequest) {
      const requestOptions = this.getVinRequestOptionLists(vinRequest);

      return {
        controls: [
          {
            id: "brand",
            type: "single",
            label: "Марка",
            placeholder: "Марка",
            queryKey: "brand",
            disabled: false,
            value: vinRequest.brand,
            options: requestOptions.brand,
          },
          {
            id: "model",
            type: "single",
            label: "Модель",
            placeholder: "Модель",
            queryKey: "model",
            disabled: !vinRequest.brand,
            value: vinRequest.model,
            options: requestOptions.model,
          },
        ],
        brandOptions: this.data.vehicles.map(toOption),
        modelOptions: this.data.vehicles.reduce((result, brand) => {
          result[brand.id] = brand.models.map(toOption);
          return result;
        }, {}),
        submit: {
          label: "Отправить запрос",
          disabled: !isVinRequestComplete(vinRequest),
        },
      };
    }

    getTabs(mode) {
      return this.data.tabs.map((tab) => ({
        ...tab,
        active: tab.id === mode,
      }));
    }

    isPreviousComplete(fieldId, selected) {
      if (fieldId === "brand") return true;
      if (fieldId === "productGroups") return true;
      const index = STEPS.indexOf(fieldId);
      return STEPS.slice(0, index).every((key) => selected[key]);
    }

    getOptions(selected) {
      const brand = this.data.vehicles.find(
        (item) => item.id === selected.brand?.id,
      );
      const model = brand?.models.find(
        (item) => item.id === selected.model?.id,
      );
      const year = model?.years.find((item) => item.id === selected.year?.id);
      const engine = year?.engines.find(
        (item) => item.id === selected.engine?.id,
      );

      return {
        brand: this.data.vehicles.map(toOption),
        model: (brand?.models || []).map(toOption),
        year: (model?.years || []).map(toOption),
        engine: (year?.engines || []).map(toOption),
        modification: (engine?.modifications || []).map(toOption),
      };
    }

    getVinRequestOptionLists(vinRequest) {
      const brand = this.data.vehicles.find(
        (item) => item.id === vinRequest.brand?.id,
      );

      return {
        brand: this.data.vehicles.map(toOption),
        model: (brand?.models || []).map(toOption),
      };
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

  function normalizeVinSearch(search = {}) {
    return {
      value: search.value || "",
      result: search.result || "",
    };
  }

  function normalizeVinRequest(request = {}) {
    return {
      ...EMPTY_VIN_REQUEST,
      ...request,
      agreement: Boolean(request.agreement),
    };
  }

  function normalizeVinResult(result) {
    if (result === "none" || result === "empty") return "not-found";
    if (result === "found" || result === "not-found") return result;
    return "";
  }

  function isVinRequestComplete(request) {
    return Boolean(
      request.name?.trim() &&
        request.phone?.trim() &&
        request.parts?.trim() &&
        request.agreement,
    );
  }

  function normalizeEndpoints(endpoints = {}) {
    return {
      ...DEFAULT_ENDPOINTS,
      ...endpoints,
    };
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

  function resolveEndpoint(endpoint, params = {}) {
    return Object.entries(params).reduce((result, [key, value]) => {
      const encoded = encodeURIComponent(value);
      return result
        .replaceAll(`:${key}`, encoded)
        .replaceAll(`{${key}}`, encoded);
    }, endpoint);
  }

  function toOption(item) {
    return { id: item.id, label: item.label };
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function queryToObject(searchParams) {
    return Array.from(searchParams.keys()).reduce((result, key) => {
      const values = searchParams.getAll(key);
      result[key] = values.length > 1 ? values : values[0];
      return result;
    }, {});
  }

  window.MockPartsFinderApi = MockPartsFinderApi;
})();
