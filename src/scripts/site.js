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
  const headerMenu = root.querySelector("[data-header-menu]");
  const headerMenuToggle = root.querySelector("[data-header-menu-toggle]");

  const setModal = (modal, open) => {
    if (!modal) return;
    modal.hidden = !open;
    root.classList.toggle(
      "is-modal-open",
      open || Boolean(root.querySelector(".tri-home-modal:not([hidden])")),
    );
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      requestAnimationFrame(() => modal.querySelector("button, input")?.focus());
    }
  };

  const setHeaderMenu = (open) => {
    siteHeader?.classList.toggle("is-menu-open", open);
    headerMenu?.classList.toggle("is-open", open);
    headerMenu?.setAttribute("aria-hidden", String(!open));
    headerMenuToggle?.setAttribute("aria-expanded", String(open));
    headerMenuToggle?.setAttribute(
      "aria-label",
      open ? "Закрыть меню" : "Открыть меню",
    );
  };

  root.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.matches("[data-header-menu-toggle]")) {
      setHeaderMenu(!headerMenu?.classList.contains("is-open"));
      return;
    }

    if (headerMenu?.contains(target) && target.matches("a")) {
      setHeaderMenu(false);
    }

    if (target.matches("[data-open-request]")) {
      setModal(requestModal, true);
    }

    if (target.matches("[data-close-request]")) {
      setModal(requestModal, false);
    }
  });

  root.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-request-form]")) return;
    event.preventDefault();
    if (!event.target.checkValidity()) {
      event.target.reportValidity();
      return;
    }
    event.target.reset();
    setModal(requestModal, false);
    showToast("Заявка отправлена");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setModal(requestModal, false);
    setHeaderMenu(false);
  });

  root.querySelector('[data-site-nav="home"]')?.classList.toggle(
    "is-active",
    window.location.pathname === "/" || window.location.pathname.endsWith("/index.html"),
  );
}
