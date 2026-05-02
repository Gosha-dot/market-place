const PRODUCT = {
  name: "Minimal Tee",
  price: 29.0,
  currencySymbol: "$",
};

function formatMoney(amount) {
  const value = Number(amount);
  return `${PRODUCT.currencySymbol}${value.toFixed(2)}`;
}

function digitsOnly(value) {
  return (value || "").replace(/\D/g, "");
}

function setError(inputEl, errorEl, message) {
  if (!message) {
    inputEl.setAttribute("aria-invalid", "false");
    errorEl.textContent = "";
    return;
  }
  inputEl.setAttribute("aria-invalid", "true");
  errorEl.textContent = message;
}

function showStatus(box, kind, message) {
  box.className = `notice show ${kind}`;
  box.textContent = message;
}

function clearStatus(box) {
  box.className = "notice";
  box.textContent = "";
}

function validateCardholder(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "Please enter the cardholder name.";
  if (trimmed.length < 2) return "Name looks too short.";
  return "";
}

function validateCardNumber(raw) {
  const digits = digitsOnly(raw);
  if (digits.length !== 16) return "Card number must be 16 digits.";
  return "";
}

function validateExpiry(raw) {
  const value = (raw || "").trim();
  if (!/^\d{2}\/\d{2}$/.test(value)) return "Expiration must be in MM/YY format.";

  const [mmStr, yyStr] = value.split("/");
  const month = Number(mmStr);
  const year2 = Number(yyStr);
  if (Number.isNaN(month) || Number.isNaN(year2)) return "Expiration must be in MM/YY format.";
  if (month < 1 || month > 12) return "Month must be between 01 and 12.";

  const now = new Date();
  const currentYear2 = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  // Treat 00-99 as 2000-2099 for demo purposes.
  const notExpired = year2 > currentYear2 || (year2 === currentYear2 && month >= currentMonth);
  if (!notExpired) return "Card appears to be expired.";

  return "";
}

function validateCvv(raw) {
  const digits = digitsOnly(raw);
  if (digits.length !== 3) return "CVV must be 3 digits.";
  return "";
}

function formatCardNumberInput(value) {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiryInput(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const subtotal = document.getElementById("subtotal");
  const total = document.getElementById("total");

  productName.textContent = PRODUCT.name;
  productPrice.textContent = formatMoney(PRODUCT.price);
  subtotal.textContent = formatMoney(PRODUCT.price);
  total.textContent = formatMoney(PRODUCT.price);

  const form = document.getElementById("paymentForm");
  const statusBox = document.getElementById("statusBox");
  const payBtn = document.getElementById("payBtn");
  const payLabel = payBtn.querySelector(".btn-label");

  const cardholder = document.getElementById("cardholder");
  const cardNumber = document.getElementById("cardNumber");
  const expiry = document.getElementById("expiry");
  const cvv = document.getElementById("cvv");

  const errCardholder = document.getElementById("err-cardholder");
  const errCardNumber = document.getElementById("err-cardNumber");
  const errExpiry = document.getElementById("err-expiry");
  const errCvv = document.getElementById("err-cvv");

  payLabel.textContent = `Pay ${formatMoney(PRODUCT.price)}`;

  cardNumber.addEventListener("input", () => {
    const next = formatCardNumberInput(cardNumber.value);
    if (cardNumber.value !== next) cardNumber.value = next;
  });

  expiry.addEventListener("input", () => {
    const next = formatExpiryInput(expiry.value);
    if (expiry.value !== next) expiry.value = next;
  });

  cvv.addEventListener("input", () => {
    const digits = digitsOnly(cvv.value).slice(0, 3);
    if (cvv.value !== digits) cvv.value = digits;
  });

  function validateAll() {
    const m1 = validateCardholder(cardholder.value);
    const m2 = validateCardNumber(cardNumber.value);
    const m3 = validateExpiry(expiry.value);
    const m4 = validateCvv(cvv.value);

    setError(cardholder, errCardholder, m1);
    setError(cardNumber, errCardNumber, m2);
    setError(expiry, errExpiry, m3);
    setError(cvv, errCvv, m4);

    return !m1 && !m2 && !m3 && !m4;
  }

  [cardholder, cardNumber, expiry, cvv].forEach((el) => {
    el.addEventListener("blur", () => {
      clearStatus(statusBox);
      validateAll();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus(statusBox);

    const ok = validateAll();
    if (!ok) {
      showStatus(statusBox, "error", "Please fix the highlighted fields.");
      return;
    }

    // Fake processing animation (optional)
    payBtn.disabled = true;
    payBtn.classList.add("is-processing");
    showStatus(statusBox, "success", "Processing…");

    await new Promise((r) => setTimeout(r, 900));

    payBtn.classList.remove("is-processing");
    showStatus(statusBox, "success", "Payment successful (demo only, no real transaction).");

    // Clear sensitive fields (demo behavior)
    cardNumber.value = "";
    expiry.value = "";
    cvv.value = "";
    cardholder.focus();
    payBtn.disabled = false;
  });
});

