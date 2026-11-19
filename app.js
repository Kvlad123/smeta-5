(() => {
  "use strict";

  const config = window.SMETA5_CONFIG || {};
  const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
  const price = Number.isFinite(Number(config.price)) && Number(config.price) >= 0
    ? Number(config.price)
    : 490;
  const currency = typeof config.currency === "string" ? config.currency : "₽";

  document.querySelectorAll("[data-price]").forEach((element) => {
    element.textContent = `${money.format(price)} ${currency}`;
  });
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const dialog = document.getElementById("purchase-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogText = document.getElementById("dialog-text");
  const paymentLink = document.getElementById("payment-link");
  let paymentUrl = "";

  try {
    const url = new URL(config.paymentUrl);
    if (url.protocol === "https:" || url.protocol === "http:") paymentUrl = url.href;
  } catch (_) {
    // Пустая или неверная ссылка не должна ломать остальной сайт.
  }

  document.querySelectorAll("[data-buy]").forEach((button) => {
    button.addEventListener("click", () => {
      const configured = Boolean(paymentUrl);
      if (!dialog) {
        if (configured) window.open(paymentUrl, "_blank", "noopener");
        else window.alert("Оплата ещё не настроена. Владельцу нужно добавить ссылку в config.js.");
        return;
      }
      dialogTitle.textContent = configured ? "Покупка «Смета за 5»" : "Оплата ещё не настроена";
      dialogText.textContent = configured
        ? "Вы перейдёте на страницу продавца. После оплаты площадка выдаст ZIP-комплект с редактором и инструкцией."
        : "Владельцу сайта нужно добавить ссылку на страницу оплаты в public/config.js и повторить сборку.";
      paymentLink.hidden = !configured;
      if (configured) paymentLink.href = paymentUrl;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else if (configured) window.open(paymentUrl, "_blank", "noopener");
      else window.alert(dialogText.textContent);
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
  if (dialog) dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) dialog.close();
  });

  const supportEmail = typeof config.supportEmail === "string"
    ? config.supportEmail.trim()
    : "";
  const supportLink = document.getElementById("support-link");
  if (supportLink && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    supportLink.href = `mailto:${supportEmail}`;
    supportLink.hidden = false;
  }

  const form = document.getElementById("rate-form");
  if (!form) return;
  const fields = {
    income: document.getElementById("income"),
    hours: document.getElementById("hours"),
    tax: document.getElementById("tax"),
    reserve: document.getElementById("reserve")
  };
  const error = document.getElementById("calc-error");

  function calculateRate() {
    const income = Number(fields.income.value);
    const hours = Number(fields.hours.value);
    const tax = Number(fields.tax.value);
    const reserve = Number(fields.reserve.value);
    document.getElementById("reserve-output").textContent = `${reserve}%`;
    let message = "";

    if (!Number.isFinite(income) || income < 1000 || income > 100000000) {
      message = "Укажите желаемый доход от 1 000 до 100 000 000 ₽.";
    } else if (!Number.isFinite(hours) || hours < 1 || hours > 744) {
      message = "Укажите от 1 до 744 оплачиваемых часов в месяц.";
    } else if (!Number.isFinite(tax) || tax < 0 || tax > 60) {
      message = "Налоги должны быть в диапазоне от 0 до 60%.";
    } else if (!Number.isFinite(reserve) || reserve < 0 || reserve > 40) {
      message = "Резерв должен быть в диапазоне от 0 до 40%.";
    } else if (tax + reserve >= 95) {
      message = "Сумма налогов и резерва должна быть меньше 95%.";
    }

    error.hidden = !message;
    error.textContent = message;
    if (message) return;

    const revenue = income / (1 - (tax + reserve) / 100);
    const rate = Math.ceil(revenue / hours / 10) * 10;
    const rateResult = document.getElementById("rate-result");
    const unit = document.createElement("small");
    unit.textContent = "/ час";
    rateResult.replaceChildren(document.createTextNode(`${money.format(rate)} ${currency}`), unit);
    document.getElementById("revenue-result").textContent = `${money.format(revenue)} ${currency}`;
    document.getElementById("day-result").textContent = `${money.format(rate * 8)} ${currency}`;
  }

  form.addEventListener("input", calculateRate);
  form.addEventListener("submit", (event) => event.preventDefault());
  calculateRate();
})();
