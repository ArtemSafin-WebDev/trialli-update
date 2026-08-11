import {
  formStatusModal,
  setFormPending,
  submitFormRequest,
} from "./form-status-modal.js";

const root = document.querySelector("[data-site-shell]");

export function showToast(message) {
  if (!root) return;

  let toast = root.querySelector("[data-tri-toast]");
  if (!toast) {
    toast = document.createElement("div");
    toast.dataset.triToast = "";
    Object.assign(toast.style, {
      position: "fixed",
      zIndex: "400",
      left: "50%",
      bottom: "100px",
      padding: "12px 18px",
      borderRadius: "24px",
      background: "#bed600",
      color: "#0d2026",
      fontWeight: "500",
      boxShadow: "0 16px 48px rgba(0,0,0,.3)",
      transform: "translateX(-50%)",
    });
    root.append(toast);
  }

  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

if (root) {
  const requestModal = root.querySelector("[data-request-modal]");
  const siteHeader = root.querySelector("[data-tri-home-header]");
  const bottomNav = root.querySelector(".tri-home-bottom-nav");
  const siteFooter = root.querySelector(".tri-home-footer");
  const stickyHeaderSlot = root.querySelector("[data-tri-home-header-slot]");
  const stickyHeader = root.querySelector("[data-tri-home-header-sticky]");
  const headerMenu = root.querySelector("[data-header-menu]");
  const headerMenuToggle = root.querySelector("[data-header-menu-toggle]");
  const headerMenuBackdrop = root.querySelector(
    "[data-header-menu-backdrop]",
  );
  const headerSearchInput = root.querySelector(".tri-home-header__search input");
  const headerSearchClear = root.querySelector("[data-header-search-clear]");
  const mobileHeaderMedia = window.matchMedia("(max-width: 767px)");
  const stickyHeaderMedia = window.matchMedia("(min-width: 1024px)");
  const bottomNavHideThreshold = 12;
  const bottomNavShowThreshold = 6;
  const bottomNavPageEndThreshold = 2;
  let stickyHeaderStart = 0;
  let stickyHeaderFrame = 0;
  let bottomNavLastScrollY = Math.max(window.scrollY, 0);
  let bottomNavScrollDistance = 0;
  let bottomNavScrollDirection = 0;

  const updateBottomNav = () => {
    if (!bottomNav) return;

    const maxScrollY = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    );
    const currentScrollY = Math.min(Math.max(window.scrollY, 0), maxScrollY);
    const pageEndReached =
      currentScrollY >= maxScrollY - bottomNavPageEndThreshold;
    const footerRect = siteFooter?.getBoundingClientRect();
    const footerInView = Boolean(
      footerRect &&
        footerRect.top <= window.innerHeight &&
        footerRect.bottom > 0,
    );

    if (
      !mobileHeaderMedia.matches ||
      currentScrollY === 0 ||
      pageEndReached ||
      footerInView
    ) {
      bottomNav.classList.remove("is-scroll-hidden");
      bottomNavLastScrollY = currentScrollY;
      bottomNavScrollDistance = 0;
      bottomNavScrollDirection = 0;
      return;
    }

    const scrollDelta = currentScrollY - bottomNavLastScrollY;
    bottomNavLastScrollY = currentScrollY;
    if (scrollDelta === 0) return;

    const scrollDirection = scrollDelta > 0 ? 1 : -1;
    if (scrollDirection !== bottomNavScrollDirection) {
      bottomNavScrollDirection = scrollDirection;
      bottomNavScrollDistance = 0;
    }

    bottomNavScrollDistance += Math.abs(scrollDelta);
    const threshold =
      scrollDirection > 0 ? bottomNavHideThreshold : bottomNavShowThreshold;
    if (bottomNavScrollDistance < threshold) return;

    bottomNav.classList.toggle("is-scroll-hidden", scrollDirection > 0);
    bottomNavScrollDistance = 0;
  };

  const updateStickyHeader = () => {
    stickyHeaderFrame = 0;
    siteHeader?.classList.toggle(
      "is-stuck",
      stickyHeaderMedia.matches && window.scrollY >= stickyHeaderStart,
    );
    siteHeader?.classList.toggle(
      "is-mobile-scrolled",
      mobileHeaderMedia.matches && window.scrollY > 0,
    );
    updateBottomNav();
  };

  const requestStickyHeaderUpdate = () => {
    if (stickyHeaderFrame) return;
    stickyHeaderFrame = window.requestAnimationFrame(updateStickyHeader);
  };

  const measureStickyHeader = () => {
    if (!siteHeader || !stickyHeaderSlot || !stickyHeader) return;
    stickyHeaderStart = stickyHeaderSlot.offsetTop;
    requestStickyHeaderUpdate();
  };

  const updatePageScrollLock = () => {
    const modalOpen = Boolean(root.querySelector(".tri-home-modal:not([hidden])"));
    const menuOpen = Boolean(headerMenu?.classList.contains("is-open"));
    const catalogOpen = Boolean(root.querySelector("[data-catalog-mobile]:not([hidden])"));
    const locked = modalOpen || menuOpen || catalogOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };

  const setModal = (modal, open) => {
    if (!modal) return;
    modal.hidden = !open;
    root.classList.toggle(
      "is-modal-open",
      open || Boolean(root.querySelector(".tri-home-modal:not([hidden])")),
    );
    updatePageScrollLock();
    if (open) {
      requestAnimationFrame(() => modal.querySelector("button, input")?.focus());
    }
  };

  const setHeaderMenu = (open) => {
    siteHeader?.classList.toggle("is-menu-open", open);
    headerMenu?.classList.toggle("is-open", open);
    headerMenuBackdrop?.classList.toggle("is-open", open);
    headerMenu?.setAttribute("aria-hidden", String(!open));
    headerMenuBackdrop?.setAttribute("aria-hidden", String(!open));
    headerMenuBackdrop?.setAttribute("tabindex", open ? "0" : "-1");
    headerMenuToggle?.setAttribute("aria-expanded", String(open));
    headerMenuToggle?.setAttribute(
      "aria-label",
      open ? "Закрыть меню" : "Открыть меню",
    );
    updatePageScrollLock();
  };

  const updateHeaderSearchClear = () => {
    if (!headerSearchInput || !headerSearchClear) return;
    headerSearchClear.hidden = !headerSearchInput.value;
  };

  headerSearchInput?.addEventListener("input", updateHeaderSearchClear);
  updateHeaderSearchClear();

  root.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.matches("[data-header-menu-toggle]")) {
      setHeaderMenu(!headerMenu?.classList.contains("is-open"));
      return;
    }

    if (target.matches("[data-header-menu-backdrop]")) {
      setHeaderMenu(false);
      return;
    }

    if (target.matches("[data-header-search-clear]")) {
      headerSearchInput.value = "";
      updateHeaderSearchClear();
      headerSearchInput.focus();
      return;
    }

    if (headerMenu?.contains(target) && target.matches("a")) {
      setHeaderMenu(false);
    }

    if (target.matches("[data-open-request]")) {
      if (requestModal) {
        setModal(requestModal, true);
      } else {
        document.dispatchEvent(
          new CustomEvent("parts-finder:open-vin-request-modal", {
            bubbles: true,
          }),
        );
      }
    }

    if (target.matches("[data-close-request]")) {
      setModal(requestModal, false);
    }
  });

  root.addEventListener("submit", async (event) => {
    if (!event.target.matches("[data-request-form]")) return;
    event.preventDefault();
    if (!event.target.checkValidity()) {
      event.target.reportValidity();
      return;
    }

    const form = event.target;
    const submit = event.submitter;
    setFormPending(form, true);

    try {
      await submitFormRequest(form);
      form.reset();
      setFormPending(form, false);
      setModal(requestModal, false);
      formStatusModal.success();
    } catch (error) {
      console.error(error);
      setFormPending(form, false);
      formStatusModal.error({
        returnFocusTo: submit || form,
        onSecondary: () => setModal(requestModal, false),
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setModal(requestModal, false);
    setHeaderMenu(false);
  });

  mobileHeaderMedia.addEventListener("change", (event) => {
    if (!event.matches) setHeaderMenu(false);
    requestStickyHeaderUpdate();
  });

  window.addEventListener("scroll", requestStickyHeaderUpdate, { passive: true });
  window.addEventListener("resize", measureStickyHeader);
  stickyHeaderMedia.addEventListener("change", measureStickyHeader);
  measureStickyHeader();

  root.querySelector('[data-site-nav="home"]')?.classList.toggle(
    "is-active",
    window.location.pathname === "/" || window.location.pathname.endsWith("/index.html"),
  );
}
