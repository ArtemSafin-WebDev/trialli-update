export function setProductsMoreButtonExpanded(button, expanded) {
  if (!button) return;

  button.setAttribute("aria-expanded", String(Boolean(expanded)));
  const label = button.querySelector("[data-products-more-label]");
  if (label) label.textContent = expanded ? "Свернуть" : "Показать еще";
}
