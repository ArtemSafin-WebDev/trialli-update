export const trialliPartsFinderData = {
  makes: [
    {
      value: "audi",
      label: "Audi",
      models: [
        {
          value: "a4-b8",
          label: "A4 B8 (08-)",
          years: ["2015", "2014", "2013"],
          engines: [
            {
              value: "2.0-petrol",
              label: "2.0 бензиновый",
              modifications: [
                {
                  value: "a4-2.0-tfsi",
                  label: "A4 2.0 TFSI quattro 190 л.с.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      value: "lada",
      label: "Lada",
      models: [
        {
          value: "vesta",
          label: "Vesta",
          years: ["2024", "2023", "2022"],
          engines: [
            {
              value: "1.6-petrol",
              label: "1.6 бензиновый",
              modifications: [
                { value: "vesta-1.6", label: "1.6 16V 106 л.с." },
              ],
            },
          ],
        },
        {
          value: "granta",
          label: "Granta",
          years: ["2024", "2023", "2022"],
          engines: [
            {
              value: "1.6-petrol",
              label: "1.6 бензиновый",
              modifications: [
                { value: "granta-1.6", label: "1.6 8V 90 л.с." },
              ],
            },
          ],
        },
      ],
    },
    {
      value: "haval",
      label: "Haval",
      models: [
        {
          value: "jolion",
          label: "Jolion",
          years: ["2024", "2023", "2022"],
          engines: [
            {
              value: "1.5-petrol",
              label: "1.5 бензиновый",
              modifications: [
                { value: "jolion-1.5", label: "1.5T 150 л.с." },
              ],
            },
          ],
        },
      ],
    },
    ...["Chery", "BMW", "Geely", "Kia", "Hyundai", "Volkswagen", "Skoda", "Toyota", "Mazda", "Tesla"].map(
      (label) => ({
        value: label.toLowerCase(),
        label,
        models: [
          {
            value: "model",
            label: "Популярная модель",
            years: ["2024", "2023", "2022"],
            engines: [
              {
                value: "petrol",
                label: "Бензиновый",
                modifications: [
                  { value: "base", label: "Базовая комплектация" },
                ],
              },
            ],
          },
        ],
      }),
    ),
  ],
  groups: [
    "Тормозная система",
    "Ремни и ролики",
    "Амортизаторы и опоры",
    "Сцепление",
    "Ступицы и ремкомплекты",
    "ШРУСы и приводы",
    "Система выпуска",
  ],
};
