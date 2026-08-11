import { showToast } from "../site.js";

const productCardRoots = new WeakSet();

const productCardInteractiveSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "form",
  "[role='button']",
  "[role='link']",
  "[contenteditable='true']",
].join(", ");

const productCardIcons = {
  discount: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="12" fill="#203840"></rect>
      <path d="M15.7482 7.01584C16.0751 7.01895 16.3885 7.15032 16.6197 7.38147C16.8506 7.61278 16.9825 7.92604 16.9854 8.25289C16.9881 8.57988 16.8615 8.89517 16.6343 9.1304L9.14533 16.6185C9.03026 16.7376 8.89281 16.8334 8.74065 16.8988C8.58867 16.9641 8.42457 16.9984 8.25918 17C8.09376 17.0014 7.92842 16.9698 7.77527 16.9073C7.62222 16.8447 7.48274 16.7511 7.36572 16.6343C7.2488 16.5174 7.15543 16.3778 7.09268 16.2248C7.03 16.0716 6.99868 15.9065 7.00004 15.741C7.00148 15.5755 7.03594 15.4117 7.10121 15.2596C7.16662 15.1073 7.26115 14.9688 7.38034 14.8537L14.8693 7.36563C15.1047 7.1383 15.4209 7.013 15.7482 7.01584Z" fill="white"></path>
      <path d="M15.1278 13.2401C15.6239 13.2402 16.1005 13.4378 16.4515 13.7885C16.8022 14.1394 16.9999 14.616 17 15.1121C16.9998 15.6084 16.8024 16.0847 16.4515 16.4357C16.1005 16.7866 15.6241 16.984 15.1278 16.9841C14.6316 16.984 14.155 16.7863 13.804 16.4357C13.4533 16.0848 13.2557 15.6082 13.2555 15.1121C13.2556 14.6158 13.453 14.1395 13.804 13.7885C14.155 13.4375 14.6313 13.2402 15.1278 13.2401Z" fill="white"></path>
      <path d="M8.88692 7C9.3831 7.00014 9.8597 7.19773 10.2107 7.54844C10.5613 7.89937 10.7591 8.37594 10.7592 8.87202C10.759 9.36828 10.5616 9.84467 10.2107 10.1956C9.85967 10.5465 9.38326 10.7439 8.88692 10.744C8.39077 10.7439 7.91416 10.5462 7.56318 10.1956C7.21245 9.84471 7.01483 9.36811 7.01467 8.87202C7.01477 8.37569 7.21218 7.89942 7.56318 7.54844C7.91421 7.19747 8.39051 7.0001 8.88692 7Z" fill="white"></path>
    </svg>
  `,
  plus: `
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2C8.17681 2 8.34666 2.07029 8.47168 2.19531C8.5966 2.32032 8.66699 2.49026 8.66699 2.66699V7.33301L13.333 7.33301C13.5097 7.33301 13.6797 7.4034 13.8047 7.52832C13.9297 7.65334 14 7.82319 14 8C14 8.17681 13.9297 8.34666 13.8047 8.47168C13.6797 8.5966 13.5097 8.66699 13.333 8.66699L8.66699 8.66699L8.66699 13.333C8.66699 13.5097 8.5966 13.6797 8.47168 13.8047C8.34666 13.9297 8.17681 14 8 14C7.82319 14 7.65334 13.9297 7.52832 13.8047C7.4034 13.6797 7.33301 13.5097 7.33301 13.333L7.33301 8.66699H2.66699C2.49026 8.66699 2.32032 8.5966 2.19531 8.47168C2.07029 8.34666 2 8.17681 2 8C2 7.82319 2.07029 7.65334 2.19531 7.52832C2.32032 7.4034 2.49026 7.33301 2.66699 7.33301L7.33301 7.33301L7.33301 2.66699C7.33301 2.49026 7.4034 2.32032 7.52832 2.19531C7.65334 2.07029 7.82319 2 8 2Z"></path>
    </svg>
  `,
  minus: `
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13.333 7.33301V8.66699H2.66699V7.33301H13.333Z"></path>
    </svg>
  `,
  copy: `
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8 3.5C8.82843 3.5 9.5 4.17157 9.5 5V8C9.5 8.82843 8.82843 9.5 8 9.5H5C4.17157 9.5 3.5 8.82843 3.5 8V5C3.5 4.17157 4.17157 3.5 5 3.5H8ZM5 4.5C4.72386 4.5 4.5 4.72386 4.5 5V8C4.5 8.27614 4.72386 8.5 5 8.5H8C8.27614 8.5 8.5 8.27614 8.5 8V5C8.5 4.72386 8.27614 4.5 8 4.5H5Z"></path>
      <path d="M5 0C6.10457 0 7 0.895431 7 2H5C3 2 2 3 2 5V7C0.895431 7 4.83199e-08 6.10457 0 5V2C0 0.895431 0.895431 4.83192e-08 2 0H5Z"></path>
    </svg>
  `,
};

const formatPrice = (price) =>
  typeof price === "number"
    ? `${new Intl.NumberFormat("ru-RU").format(price)} ₽`
    : price;

export function productCardTemplate(product, index = 0) {
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  const imageAlt = product.imageAlt || product.name?.replace(/<br\s*\/?>/gi, " ") || "";

  return `
    <article class="tri-product-card" data-product-card data-product-id="${product.id}">
      <div class="tri-product-card__media">
        <div class="tri-product-card__tags">
          <span class="tri-product-card__discount" aria-label="Товар со скидкой">
            ${productCardIcons.discount}
          </span>
          ${product.isNew ? '<span class="tri-product-card__tag">Новинка</span>' : ""}
          ${product.isLow ? '<span class="tri-product-card__tag tri-product-card__tag--low">Скоро закончится</span>' : ""}
        </div>

        <div class="tri-product-card__gallery swiper" data-product-gallery aria-label="Галерея товара">
          <div class="swiper-wrapper">
            ${images
              .map(
                (image, imageIndex) => `
                  <div class="swiper-slide">
                    <img
                      class="tri-product-card__image"
                      src="${image}"
                      alt="${imageIndex === 0 ? imageAlt : ""}"
                      loading="${index > 3 || imageIndex > 0 ? "lazy" : "eager"}"
                    />
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="tri-product-card__thumbs swiper" data-product-thumbs aria-label="Миниатюры товара">
          <div class="swiper-wrapper">
            ${images
              .map(
                (image, imageIndex) => `
                  <button class="tri-product-card__thumb swiper-slide" type="button" aria-label="${imageIndex === 2 ? "Видео о товаре" : `Фото ${imageIndex + 1}`}">
                    <img src="${image}" alt="" loading="lazy" />
                    ${
                      imageIndex === 2
                        ? '<span class="tri-product-card__video"><img src="/assets/trialli-home/icon-play.svg" alt="" /></span>'
                        : ""
                    }
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="tri-product-card__body">
        <div class="tri-product-card__details">
          <a class="tri-product-card__title" href="#">${product.name}</a>
          <button class="tri-product-card__code" type="button" data-copy-code="${product.code}" aria-label="Скопировать артикул ${product.code}">
            <span>${product.code}</span>
            <span class="tri-product-card__copy">${productCardIcons.copy}</span>
          </button>
        </div>

        <span class="tri-product-card__divider" aria-hidden="true"></span>

        <div class="tri-product-card__price-row">
          <div class="tri-product-card__prices">
            <span class="tri-product-card__price">${formatPrice(product.price)}</span>
            <span class="tri-product-card__old-price">${formatPrice(product.oldPrice)}</span>
          </div>

          <form class="tri-product-card__cart" action="/cart/update/" method="post" data-product-cart>
            <input type="hidden" name="id" value="${product.id}" />
            <button class="tri-product-card__add" type="submit" name="action" value="add" data-add-product aria-label="Добавить ${product.code} в корзину">
              ${productCardIcons.plus}
            </button>
            <div class="tri-product-card__counter" data-product-counter hidden>
              <button class="tri-product-card__counter-button" type="submit" name="action" value="decrease" aria-label="Уменьшить количество">
                ${productCardIcons.minus}
              </button>
              <input class="tri-product-card__quantity" type="number" name="quantity" min="1" max="99" value="1" aria-label="Количество ${product.code}" />
              <button class="tri-product-card__counter-button" type="submit" name="action" value="increase" aria-label="Увеличить количество">
                ${productCardIcons.plus}
              </button>
            </div>
          </form>
        </div>
      </div>
    </article>
  `;
}

export function initProductCardGalleries(container) {
  if (!container || typeof window.Swiper !== "function") return;

  container.querySelectorAll("[data-product-card]").forEach((card) => {
    if (card.dataset.galleryReady === "true") return;

    const thumbsElement = card.querySelector("[data-product-thumbs]");
    const galleryElement = card.querySelector("[data-product-gallery]");
    if (!thumbsElement || !galleryElement) return;

    const thumbs = new window.Swiper(thumbsElement, {
      slidesPerView: 3,
      spaceBetween: 5,
      watchSlidesProgress: true,
      slideToClickedSlide: true,
      observer: true,
      observeParents: true,
    });

    const gallery = new window.Swiper(galleryElement, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 300,
      watchOverflow: true,
      observer: true,
      observeParents: true,
    });

    const syncThumbs = () => {
      thumbs.slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === gallery.activeIndex);
      });
      thumbs.slideTo(gallery.activeIndex);
    };

    thumbs.on("tap", () => {
      if (typeof thumbs.clickedIndex === "number") {
        gallery.slideTo(thumbs.clickedIndex);
      }
    });
    gallery.on("slideChange", syncThumbs);
    syncThumbs();
    card.dataset.galleryReady = "true";
  });
}

function clampProductQuantity(value) {
  return Math.max(1, Math.min(99, Number(value) || 1));
}

function syncProductCart(cart, quantity) {
  const addButton = cart.querySelector("[data-add-product]");
  const counter = cart.querySelector("[data-product-counter]");
  const input = cart.querySelector(".tri-product-card__quantity");
  const inCart = quantity > 0;

  if (addButton) addButton.hidden = inCart;
  if (counter) counter.hidden = !inCart;
  if (input) input.value = String(inCart ? quantity : 1);
}

export function bindProductCardInteractions(root) {
  if (!root || productCardRoots.has(root)) return;
  productCardRoots.add(root);

  root.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-copy-code]");
    if (copyButton) {
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copyCode);
        showToast("Артикул скопирован");
      } catch {
        showToast(copyButton.dataset.copyCode);
      }
      return;
    }

    const card = event.target.closest("[data-product-card]");
    if (!card || event.defaultPrevented) return;
    if (event.target.closest(productCardInteractiveSelector)) return;
    if (window.getSelection()?.toString()) return;

    card.querySelector(".tri-product-card__title")?.click();
  });

  root.addEventListener("input", (event) => {
    if (!event.target.matches(".tri-product-card__quantity")) return;

    event.target.value = String(clampProductQuantity(event.target.value));
  });

  root.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-product-cart]")) return;

    event.preventDefault();
    const cart = event.target;
    const input = cart.querySelector(".tri-product-card__quantity");
    const action = event.submitter?.value || "update";
    const current = clampProductQuantity(input?.value);
    let next = current;

    if (action === "add") {
      next = 1;
    } else if (action === "increase") {
      next = Math.min(99, Math.max(1, current) + 1);
    } else if (action === "decrease") {
      next = current <= 1 ? 0 : current - 1;
    }

    syncProductCart(cart, next);
  });
}
