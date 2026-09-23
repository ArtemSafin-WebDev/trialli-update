/** Shared vehicle-history table for the picker and request modal. */
export function isHistoryItemSelectable(item) {
  return Boolean(item && item.selectable !== false && !item.disabled);
}

export function historyTableTemplate(items) {
  const rows = items.map((item) => `
    <div class="pf-history__row">
      <span class="pf-history__cell">${escapeHtml(item.brand?.label || "")}</span>
      <span class="pf-history__cell">${escapeHtml(item.model?.label || "")}</span>
      <span class="pf-history__cell">${escapeHtml(item.year?.label || "")}</span>
      <span class="pf-history__cell">${escapeHtml(item.engine?.label || "")}</span>
      <span class="pf-history__cell">${escapeHtml(item.modification?.label || "")}</span>
      <span class="pf-history__cell">${escapeHtml(item.vin || "")}</span>
      <span class="pf-history__cell">${escapeHtml(item.plate || "")}</span>
      <span class="pf-history__actions">
        <button class="pf-text-button" type="button" data-action="select-history" data-value="${escapeHtml(item.id)}" ${isHistoryItemSelectable(item) ? "" : "disabled"}>Выбрать</button>
        <button class="pf-icon-button" type="button" aria-label="Удалить авто" data-action="delete-history" data-value="${escapeHtml(item.id)}"><span class="pf-trash-icon" aria-hidden="true"></span></button>
      </span>
    </div>
  `).join("");

  return `
    <div class="pf-history__scroller">
      <div class="pf-history__table">
        <div class="pf-history__row pf-history__row--head" aria-hidden="true">
          <span>Марка</span><span>Модель</span><span>Год</span>
          <span>Объем двигателя</span><span>Модификация</span>
          <span>VIN</span><span>Госномер</span><span>Действия</span>
        </div>
        ${rows}
      </div>
    </div>
  `;
}

export function historyCardTemplate(item) {
  const rows = [
    ["Марка", item.brand?.label],
    ["Модель", item.model?.label],
    ["Год", item.year?.label],
    ["Объем двигателя", item.engine?.label],
    ["Модификация", item.modification?.label],
    ["VIN", item.vin],
    ["Госномер", item.plate],
  ];

  return `
    <article class="pf-mobile-history-card">
      <dl class="pf-mobile-history-card__rows">
        ${rows.map(([label, value]) => `
          <div class="pf-mobile-history-card__row">
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value || "---")}</dd>
          </div>
        `).join("")}
      </dl>
      <div class="pf-mobile-history-card__actions">
        <button class="pf-mobile-history-card__button pf-mobile-history-card__button--delete" type="button" data-action="delete-history" data-value="${escapeHtml(item.id)}">Удалить</button>
        <button class="pf-mobile-history-card__button pf-mobile-history-card__button--select" type="button" data-action="select-history" data-value="${escapeHtml(item.id)}" ${isHistoryItemSelectable(item) ? "" : "disabled"}>Выбрать</button>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
