const STATUS_CONTENT = {
  success: {
    title: "Ваш запрос отправлен!",
    description:
      "Спасибо! Мы получили вашу заявку, менеджер в ближайшее время свяжется с вами!",
    primaryLabel: "Понятно",
  },
  error: {
    title: "Что-то пошло не так",
    description:
      "Приносим свои извинения.\nОтправку заявку еще раз или попробуйте позже.",
    primaryLabel: "Вернуться к заявке",
    secondaryLabel: "Попробую позже",
  },
};

class FormStatusModal {
  constructor() {
    this.dialog = null;
    this.returnFocusTo = null;
    this.options = {};
    this.handleClick = this.handleClick.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  success(options = {}) {
    this.open("success", options);
  }

  error(options = {}) {
    this.open("error", options);
  }

  open(status, options = {}) {
    if (!STATUS_CONTENT[status]) return;

    this.close({ restoreFocus: false });
    this.returnFocusTo =
      options.returnFocusTo instanceof HTMLElement
        ? options.returnFocusTo
        : document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    this.options = options;

    const dialog = document.createElement("dialog");
    dialog.className = `tri-form-status tri-form-status--${status}`;
    dialog.setAttribute("aria-labelledby", "tri-form-status-title");
    dialog.setAttribute("aria-describedby", "tri-form-status-description");
    dialog.innerHTML = this.template(status);
    dialog.addEventListener("click", this.handleClick);
    dialog.addEventListener("cancel", this.handleCancel);
    dialog.addEventListener("close", this.handleClose, { once: true });
    document.body.append(dialog);
    this.dialog = dialog;

    dialog.showModal();
    document.documentElement.classList.add("tri-form-status-open");
    requestAnimationFrame(() => {
      dialog.classList.add("is-visible");
      dialog.querySelector("[data-form-status-primary]")?.focus({
        preventScroll: true,
      });
    });
  }

  close(options = {}) {
    const dialog = this.dialog;
    if (!dialog) return;

    dialog.classList.remove("is-visible");
    if (dialog.open) dialog.close();
    if (dialog.isConnected) dialog.remove();
    this.dialog = null;
    document.documentElement.classList.remove("tri-form-status-open");

    if (options.restoreFocus !== false && this.returnFocusTo?.isConnected) {
      this.returnFocusTo.focus({ preventScroll: true });
    }
    this.returnFocusTo = null;
  }

  handleClick(event) {
    const primary = event.target.closest("[data-form-status-primary]");
    const secondary = event.target.closest("[data-form-status-secondary]");

    if (primary) {
      const callback = this.options.onPrimary;
      this.close();
      callback?.();
      return;
    }

    if (secondary) {
      const callback = this.options.onSecondary;
      this.close({ restoreFocus: !callback });
      callback?.();
    }
  }

  handleCancel(event) {
    event.preventDefault();
    const callback = this.options.onSecondary || this.options.onPrimary;
    this.close();
    callback?.();
  }

  handleClose() {
    if (!this.dialog) return;
    this.dialog.remove();
    this.dialog = null;
    document.documentElement.classList.remove("tri-form-status-open");
  }

  template(status) {
    const content = STATUS_CONTENT[status];
    const icon = status === "success" ? successIcon() : errorIcon();

    return `
      <div class="tri-form-status__content">
        <div class="tri-form-status__icon" aria-hidden="true">${icon}</div>
        <div class="tri-form-status__copy">
          <h2 class="tri-form-status__title" id="tri-form-status-title">${content.title}</h2>
          <p class="tri-form-status__description" id="tri-form-status-description">${content.description}</p>
        </div>
      </div>
      <div class="tri-form-status__actions">
        <button class="tri-form-status__button tri-form-status__button--primary" type="button" data-form-status-primary>${content.primaryLabel}</button>
        ${
          content.secondaryLabel
            ? `<button class="tri-form-status__button tri-form-status__button--secondary" type="button" data-form-status-secondary>${content.secondaryLabel}</button>`
            : ""
        }
      </div>
    `;
  }
}

export async function submitFormRequest(form, options = {}) {
  const action = options.action || form.action || window.location.href;
  const method = (options.method || form.method || "POST").toUpperCase();
  const formData = options.formData || new FormData(form);
  const requestOptions = {
    method,
    credentials: "same-origin",
    ...options.fetchOptions,
  };

  if (method === "GET") {
    const url = new URL(action, window.location.origin);
    formData.forEach((value, key) => url.searchParams.append(key, value));
    const response = await fetch(url, requestOptions);
    if (!response.ok) throw new Error(`Form request failed: ${response.status}`);
    return response;
  }

  requestOptions.body = formData;
  const response = await fetch(action, requestOptions);
  if (!response.ok) throw new Error(`Form request failed: ${response.status}`);
  return response;
}

export function setFormPending(form, pending) {
  if (!form) return;
  form.toggleAttribute("aria-busy", pending);
  form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(
    (submit) => {
      if (pending) {
        submit.dataset.formStatusWasDisabled = String(submit.disabled);
        submit.disabled = true;
      } else {
        submit.disabled = submit.dataset.formStatusWasDisabled === "true";
        delete submit.dataset.formStatusWasDisabled;
      }
    },
  );
}

function successIcon() {
  return `
    <span class="tri-form-status__icon-ring tri-form-status__icon-ring--outer">
      <span class="tri-form-status__icon-ring tri-form-status__icon-ring--middle">
        <span class="tri-form-status__icon-ring tri-form-status__icon-ring--inner">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.3241 5.26271C20.7313 4.88971 21.3641 4.91718 21.7372 5.32423C22.1103 5.73131 22.0827 6.36413 21.6757 6.73732L9.67571 17.7373C9.28104 18.0991 8.67146 18.0856 8.29289 17.707L2.29289 11.707C1.90237 11.3165 1.90237 10.6835 2.29289 10.293C2.65902 9.92701 3.23806 9.90432 3.63078 10.2246L3.70696 10.293L9.02922 15.6153L20.3241 5.26271Z" />
          </svg>
        </span>
      </span>
    </span>
  `;
}

function errorIcon() {
  return `
    <span class="tri-form-status__icon-ring tri-form-status__icon-ring--outer">
      <span class="tri-form-status__icon-ring tri-form-status__icon-ring--middle">
        <span class="tri-form-status__icon-ring tri-form-status__icon-ring--inner">
          <svg viewBox="0 0 25 25" aria-hidden="true">
            <path d="M17.2945 6.03518C17.5094 6.03705 17.7157 6.12249 17.8677 6.27444C18.0197 6.42641 18.1051 6.63278 18.107 6.84768C18.1087 7.06242 18.0266 7.26937 17.8775 7.42386L13.2408 12.0606L17.8775 16.6973C18.0266 16.8518 18.1087 17.0587 18.107 17.2735C18.1051 17.4884 18.0197 17.6947 17.8677 17.8467C17.7157 17.9987 17.5094 18.0841 17.2945 18.086C17.0797 18.0877 16.8728 18.0056 16.7183 17.8565L12.0816 13.2198L7.44485 17.8565C7.36934 17.9346 7.27906 17.9971 7.17923 18.0401C7.07934 18.083 6.97154 18.1055 6.86282 18.1065C6.75419 18.1074 6.64601 18.087 6.54544 18.0459C6.44471 18.0047 6.35287 17.9432 6.27591 17.8662C6.19911 17.7894 6.1384 17.6982 6.0972 17.5977C6.05599 17.497 6.03473 17.3882 6.03567 17.2793C6.03667 17.1706 6.05918 17.0628 6.10208 16.9629C6.14501 16.8631 6.20753 16.7728 6.28567 16.6973L10.9224 12.0606L6.28665 7.42386C6.14096 7.26868 6.06167 7.06246 6.06497 6.84964C6.06838 6.63695 6.15388 6.43371 6.30423 6.28323C6.45463 6.13272 6.6579 6.04653 6.87064 6.043C7.08342 6.03954 7.28959 6.11914 7.44485 6.26468L12.0816 10.9014L16.7183 6.26468C16.8728 6.11551 17.0797 6.03343 17.2945 6.03518Z" />
          </svg>
        </span>
      </span>
    </span>
  `;
}

export const formStatusModal = new FormStatusModal();
window.TrialliFormStatusModal = formStatusModal;
