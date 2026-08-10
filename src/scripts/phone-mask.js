(function () {
  const PHONE_SELECTOR = 'input[type="tel"][name="phone"], input[data-phone-mask]';
  const INVALID_MESSAGE = "Введите российский номер в формате +7 (999) 999-99-99";

  function normalizeRussianPhoneDigits(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "8") return `7${digits.slice(1, 11)}`;
    if (digits[0] === "7") return digits.slice(0, 11);
    return `7${digits.slice(0, 10)}`;
  }

  function formatRussianPhone(value) {
    const digits = normalizeRussianPhoneDigits(value);
    if (!digits) return "";

    const code = digits.slice(1, 4);
    const first = digits.slice(4, 7);
    const second = digits.slice(7, 9);
    const third = digits.slice(9, 11);
    let result = "+7";

    if (code) result += ` (${code}`;
    if (code.length === 3) result += ")";
    if (first) result += ` ${first}`;
    if (second) result += `-${second}`;
    if (third) result += `-${third}`;

    return result;
  }

  function isRussianPhoneValid(value) {
    return normalizeRussianPhoneDigits(value).length === 11;
  }

  function updateValidity(input) {
    const hasValue = Boolean(input.value.trim());
    const isValid = !hasValue && !input.required
      ? true
      : isRussianPhoneValid(input.value);

    input.setCustomValidity(isValid ? "" : INVALID_MESSAGE);
  }

  function bindNativeMask(input) {
    input.addEventListener("input", () => {
      const formatted = formatRussianPhone(input.value);
      if (input.value !== formatted) input.value = formatted;
      updateValidity(input);

      if (document.activeElement === input) {
        input.setSelectionRange(formatted.length, formatted.length);
      }
    });

    input.addEventListener("keydown", (event) => {
      if (
        event.key !== "Backspace" ||
        input.selectionStart !== input.selectionEnd ||
        input.selectionEnd !== input.value.length
      ) {
        return;
      }

      const digits = normalizeRussianPhoneDigits(input.value);
      if (digits.length <= 1) return;
      event.preventDefault();
      input.value = formatRussianPhone(digits.slice(0, -1));
      updateValidity(input);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function applyToInput(input) {
    if (!input || input.dataset.phoneMaskBound === "true") return;
    input.dataset.phoneMaskBound = "true";
    input.dataset.phoneMask = "ru";
    input.inputMode = "numeric";
    input.autocomplete = input.autocomplete || "tel";
    input.maxLength = 18;
    input.pattern = "\\+7 \\([0-9]{3}\\) [0-9]{3}-[0-9]{2}-[0-9]{2}";
    input.title = INVALID_MESSAGE;

    if (input.value) input.value = formatRussianPhone(input.value);
    updateValidity(input);

    if (window.IMask) {
      const mask = window.IMask(input, {
        mask: "+{7} (000) 000-00-00",
        lazy: true,
        overwrite: true,
        prepare(value, masked) {
          const digits = String(value || "").replace(/\D/g, "");
          if (!digits) return value;
          if (!masked.value && (digits[0] === "7" || digits[0] === "8")) {
            return digits.slice(1);
          }
          return digits;
        },
      });

      input.phoneMask = mask;
      mask.on("accept", () => updateValidity(input));
    } else {
      bindNativeMask(input);
    }

    input.addEventListener("blur", () => updateValidity(input));
  }

  function init(root = document) {
    root.querySelectorAll(PHONE_SELECTOR).forEach(applyToInput);
  }

  window.LuzarPhoneMask = {
    format: formatRussianPhone,
    init,
    isValid: isRussianPhoneValid,
    normalizeDigits: normalizeRussianPhoneDigits,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }
})();
