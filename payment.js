/* =========================================================
   مدیریت خرید و پرداخت T.T.KALAA
   روند:
   انتخاب بلیت ورود ← پرداخت مستقیم زرین‌پال
   ← ثبت شماره موبایل ← ذخیره محلی ← شانس
   سایت: www.rosha-24.ir
   کد درگاه: d2440a68-7da8-4be0-bc20-8e5021796917
========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     تنظیمات درگاه زرین‌پال
     --------------------------------------------------------- */

  const ZARINPAL_CONFIG = {
    merchantId: "d2440a68-7da8-4be0-bc20-8e5021796917",
    sandbox: false,
    currency: "IRR",
    amount: 350000,
    callbackUrl: "https://www.rosha-24.ir/",
    description: "خرید محصول فرهنگی T.T.KALAA"
  };

  /* ---------------------------------------------------------
     عناصر پنجره خرید
     --------------------------------------------------------- */

  const purchaseModal =
    document.getElementById("purchaseModal");

  const purchaseProductId =
    document.getElementById("purchaseProductId");

  const purchaseProductSummary =
    document.getElementById("purchaseProductSummary");

  const purchaseSubmit =
    document.getElementById("purchaseSubmit");

  /* ---------------------------------------------------------
     عناصر نتیجه پرداخت
     --------------------------------------------------------- */

  const paymentResultModal =
    document.getElementById("paymentResultModal");

  const paymentResultIcon =
    document.getElementById("paymentResultIcon");

  const paymentResultTitle =
    document.getElementById("paymentResultTitle");

  const paymentResultContent =
    document.getElementById("paymentResultContent");

  const postPurchaseForm =
    document.getElementById("postPurchaseForm");

  const postPurchaseMobile =
    document.getElementById("postPurchaseMobile");

  const postPurchaseSubmit =
    document.getElementById("postPurchaseSubmit");

  const postPurchaseResult =
    document.getElementById("postPurchaseResult");

  const downloadProduct =
    document.getElementById("downloadProduct");

  /* ---------------------------------------------------------
     ذخیره‌سازی
     --------------------------------------------------------- */

  const STORAGE_KEYS = {
    paidOrderId: "ttkalaa_paid_order_id",
    pendingOrderId: "ttkalaa_pending_order_id",
    mobile: "ttkalaa_purchase_mobile",
    purchases: "ttkalaa_purchase_records"
  };

  /* ---------------------------------------------------------
     تبدیل اعداد فارسی به انگلیسی
     --------------------------------------------------------- */

  function normalizeDigits(value) {
    return String(value || "")
      .replace(/[۰-۹]/g, function (digit) {
        return "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
      })
      .replace(/[٠-٩]/g, function (digit) {
        return "٠١٢٣٤٥٦٧٨٩".indexOf(digit);
      });
  }

  /* ---------------------------------------------------------
     استانداردسازی شماره موبایل
     --------------------------------------------------------- */

  function normalizeMobile(value) {
    let mobile = normalizeDigits(value)
      .replace(/[\s\-()]/g, "");

    if (mobile.startsWith("+98")) {
      mobile = "0" + mobile.slice(3);
    }

    if (mobile.startsWith("0098")) {
      mobile = "0" + mobile.slice(4);
    }

    return mobile;
  }

  /* ---------------------------------------------------------
     اعتبارسنجی شماره موبایل
     --------------------------------------------------------- */

  function isValidMobile(value) {
    return /^09\d{9}$/.test(
      normalizeMobile(value)
    );
  }

  /* ---------------------------------------------------------
     فرمت قیمت
     --------------------------------------------------------- */

  function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(
      Number(price || 0)
    ) + " تومان";
  }

  /* ---------------------------------------------------------
     ذخیره سوابق خرید
     --------------------------------------------------------- */

  function savePurchaseRecord(mobile, refId) {
    let records =
      localStorage.getItem(
        STORAGE_KEYS.purchases
      );

    let recordsList = [];

    if (records) {
      try {
        recordsList = JSON.parse(records);
      } catch {
        recordsList = [];
      }
    }

    recordsList.push({
      mobile: mobile,
      refId: refId || "",
      date: new Date().toISOString()
    });

    localStorage.setItem(
      STORAGE_KEYS.purchases,
      JSON.stringify(recordsList)
    );
  }

  /* ---------------------------------------------------------
     بررسی وجود شماره در سوابق خرید
     --------------------------------------------------------- */

  function checkPurchaseRecord(mobile) {
    const records =
      localStorage.getItem(
        STORAGE_KEYS.purchases
      );

    if (!records) return false;

    try {
      const recordsList =
        JSON.parse(records);

      return recordsList.some(function (record) {
        return record.mobile === mobile;
      });

    } catch {
      return false;
    }
  }

  /* ---------------------------------------------------------
     باز کردن پنجره خرید
     --------------------------------------------------------- */

  function openPurchaseModal(productId) {
    if (!purchaseModal) return;

    const product =
      window.TTKALAAProducts &&
      window.TTKALAAProducts.getById(productId);

    if (!product) {
      showToast(
        "محصول موردنظر پیدا نشد."
      );
      return;
    }

    if (purchaseProductId) {
      purchaseProductId.value =
        product.id;
    }

    if (purchaseProductSummary) {
      purchaseProductSummary.innerHTML = `
        <div class="purchase-product-name">
          ${product.title}
        </div>

        <div class="purchase-product-price">
          ${formatPrice(product.price)}
        </div>

        <div class="purchase-product-chance">
          با این خرید، یک بلیت ورود به قرعه‌کشی
          برای شما ثبت می‌شود.
        </div>
      `;
    }

    purchaseModal.classList.add("is-open");
    purchaseModal.removeAttribute("hidden");

    document.body.classList.add(
      "modal-open"
    );
  }

  /* ---------------------------------------------------------
     بستن پنجره خرید
     --------------------------------------------------------- */

  function closePurchaseModal() {
    if (!purchaseModal) return;

    purchaseModal.classList.remove(
      "is-open"
    );

    purchaseModal.setAttribute(
      "hidden",
      ""
    );

    document.body.classList.remove(
      "modal-open"
    );
  }

  /* ---------------------------------------------------------
     بستن پنجره نتیجه پرداخت
     --------------------------------------------------------- */

  function closePaymentResultModal() {
    if (!paymentResultModal) return;

    paymentResultModal.classList.remove(
      "is-open"
    );

    paymentResultModal.setAttribute(
      "hidden",
      ""
    );

    document.body.classList.remove(
      "modal-open"
    );
  }

  /* ---------------------------------------------------------
     نمایش پیام کوتاه
     --------------------------------------------------------- */

  function showToast(message) {
    const toast =
      document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(
      window.__ttkalaaToastTimer
    );

    window.__ttkalaaToastTimer =
      setTimeout(function () {
        toast.classList.remove("show");
      }, 3500);
  }

  /* ---------------------------------------------------------
     نمایش حالت در حال پردازش
     --------------------------------------------------------- */

  function setPurchaseLoading(isLoading) {
    if (!purchaseSubmit) return;

    purchaseSubmit.disabled =
      isLoading;

    purchaseSubmit.classList.toggle(
      "is-loading",
      isLoading
    );

    purchaseSubmit.textContent =
      isLoading
        ? "در حال آماده‌سازی پرداخت..."
        : "پرداخت و دریافت بلیت ورود";
  }

  /* ---------------------------------------------------------
     باز کردن پنجره نتیجه پرداخت
     --------------------------------------------------------- */

  function openPaymentResultModal() {
    if (!paymentResultModal) return;

    paymentResultModal.classList.add(
      "is-open"
    );

    paymentResultModal.removeAttribute(
      "hidden"
    );

    document.body.classList.add(
      "modal-open"
    );
  }

  /* ---------------------------------------------------------
     نمایش موفقیت پرداخت
     --------------------------------------------------------- */

  function showPaymentSuccess(refId) {
    if (paymentResultIcon) {
      paymentResultIcon.textContent = "✓";
    }

    if (paymentResultTitle) {
      paymentResultTitle.textContent =
        "پرداخت با موفقیت انجام شد";
    }

    if (paymentResultContent) {
      paymentResultContent.innerHTML = `
        <p>
          بلیت ورود شما با موفقیت ثبت شد.
        </p>
        <p>
          کد پیگیری: ${refId || "ثبت شد"}
        </p>
      `;
    }

    if (postPurchaseForm) {
      postPurchaseForm.hidden = false;
    }

    if (downloadProduct) {
      downloadProduct.hidden = true;
    }

    if (postPurchaseResult) {
      postPurchaseResult.hidden = true;
      postPurchaseResult.innerHTML = "";
    }

    if (postPurchaseMobile) {
      postPurchaseMobile.value = "";
    }

    openPaymentResultModal();
  }

  /* ---------------------------------------------------------
     نمایش خطای پرداخت
     --------------------------------------------------------- */

  function showPaymentFailure(message) {
    if (paymentResultIcon) {
      paymentResultIcon.textContent = "×";
    }

    if (paymentResultTitle) {
      paymentResultTitle.textContent =
        "پرداخت تکمیل نشد";
    }

    if (paymentResultContent) {
      paymentResultContent.innerHTML = `
        <p>
          ${message ||
          "پرداخت شما تأیید نشد."}
        </p>
      `;
    }

    if (postPurchaseForm) {
      postPurchaseForm.hidden = true;
    }

    if (downloadProduct) {
      downloadProduct.hidden = true;
    }

    openPaymentResultModal();
  }

  /* ---------------------------------------------------------
     انتقال مستقیم به درگاه زرین‌پال
     --------------------------------------------------------- */

  function redirectToZarinpal() {
    const baseUrl =
      ZARINPAL_CONFIG.sandbox
        ? "https://sandbox.zarinpal.com/pg/StartPay/"
        : "https://payment.zarinpal.com/pg/StartPay/";

    const paymentUrl =
      baseUrl +
      ZARINPAL_CONFIG.merchantId +
      "/" +
      ZARINPAL_CONFIG.amount +
      "/" +
      encodeURIComponent(
        ZARINPAL_CONFIG.description
      ) +
      "/" +
      encodeURIComponent(
        ZARINPAL_CONFIG.callbackUrl
      );

    window.location.href =
      paymentUrl;
  }

  /* ---------------------------------------------------------
     شروع پرداخت مستقیم زرین‌پال
     --------------------------------------------------------- */

  function startPurchase() {
    const productId =
      purchaseProductId
        ? purchaseProductId.value
        : "";

    if (!productId) {
      showToast(
        "لطفاً ابتدا یک بلیت ورود انتخاب کنید."
      );
      return;
    }

    const product =
      window.TTKALAAProducts &&
      window.TTKALAAProducts.getById(
        productId
      );

    if (!product) {
      showToast(
        "بلیت ورود انتخاب‌شده معتبر نیست."
      );
      return;
    }

    setPurchaseLoading(true);

    try {
      /* -----------------------------------------------------
         ذخیره شناسه خرید موقت
         ----------------------------------------------------- */

      const tempOrderId =
        "order_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 100000
        );

      sessionStorage.setItem(
        STORAGE_KEYS.pendingOrderId,
        tempOrderId
      );

      /* -----------------------------------------------------
         انتقال به درگاه زرین‌پال
         ----------------------------------------------------- */

      redirectToZarinpal();

    } catch (error) {

      console.error(
        "TTKALAA purchase error:",
        error
      );

      showToast(
        "خطا در آماده‌سازی پرداخت."
      );

      setPurchaseLoading(false);
    }
  }

  /* ---------------------------------------------------------
     بررسی نتیجه بازگشت از درگاه زرین‌پال
     --------------------------------------------------------- */

  function handlePaymentReturn() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const authority =
      params.get("Authority") ||
      params.get("authority");

    const status =
      params.get("Status") ||
      params.get("status");

    if (!authority && !status) {
      return;
    }

    if (
      status === "NOK" ||
      status === "FAILED"
    ) {
      showPaymentFailure(
        "پرداخت شما توسط درگاه تأیید نشد."
      );

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      return;
    }

    if (paymentResultModal) {
      openPaymentResultModal();
    }

    if (paymentResultTitle) {
      paymentResultTitle.textContent =
        "در حال بررسی پرداخت...";
    }

    if (paymentResultContent) {
      paymentResultContent.innerHTML =
        "<p>لطفاً چند لحظه صبر کنید.</p>";
    }

    /* -----------------------------------------------------
       در روش مستقیم زرین‌پال بدون api
       فقط Authority دریافت می‌کنیم
       و پرداخت را موفق در نظر می‌گیریم
       ----------------------------------------------------- */

    const refId =
      authority ||
      "ثبت شد";

    const pendingOrderId =
      sessionStorage.getItem(
        STORAGE_KEYS.pendingOrderId
      );

    sessionStorage.setItem(
      STORAGE_KEYS.paidOrderId,
      pendingOrderId || refId
    );

    showPaymentSuccess(refId);

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }

  /* ---------------------------------------------------------
     ثبت شماره موبایل بعد از خرید
     --------------------------------------------------------- */

  function registerPurchaseMobile() {
    const mobile =
      normalizeMobile(
        postPurchaseMobile
          ? postPurchaseMobile.value
          : ""
      );

    if (!isValidMobile(mobile)) {

      if (postPurchaseResult) {
        postPurchaseResult.hidden =
          false;

        postPurchaseResult.className =
          "post-purchase-result error";

        postPurchaseResult.textContent =
          "شماره موبایل را کامل وارد کنید.";
      }

      if (postPurchaseMobile) {
        postPurchaseMobile.focus();
      }

      return;
    }

    const orderId =
      sessionStorage.getItem(
        STORAGE_KEYS.paidOrderId
      ) ||
      sessionStorage.getItem(
        STORAGE_KEYS.pendingOrderId
      );

    if (!orderId) {

      if (postPurchaseResult) {
        postPurchaseResult.hidden =
          false;

        postPurchaseResult.className =
          "post-purchase-result error";

        postPurchaseResult.textContent =
          "شناسه خرید پیدا نشد.";
      }

      return;
    }

    if (postPurchaseSubmit) {
      postPurchaseSubmit.disabled = true;
      postPurchaseSubmit.classList.add(
        "is-loading"
      );
      postPurchaseSubmit.textContent =
        "در حال ثبت شماره...";
    }

    try {

      /* -----------------------------------------------------
         ذخیره شماره موبایل در localStorage
         ----------------------------------------------------- */

      savePurchaseRecord(
        mobile,
        orderId
      );

      localStorage.setItem(
        STORAGE_KEYS.mobile,
        mobile
      );

      if (postPurchaseResult) {
        postPurchaseResult.hidden =
          false;

        postPurchaseResult.className =
          "post-purchase-result success";

        postPurchaseResult.textContent =
          "شماره شما ثبت شد و شانس شما فعال شد.";
      }

      if (postPurchaseMobile) {
        postPurchaseMobile.disabled =
          true;
      }

      if (postPurchaseSubmit) {
        postPurchaseSubmit.disabled =
          true;

        postPurchaseSubmit.textContent =
          "شماره ثبت شد";
      }

    } catch (error) {

      console.error(
        "TTKALAA mobile registration error:",
        error
      );

      if (postPurchaseResult) {
        postPurchaseResult.hidden =
          false;

        postPurchaseResult.className =
          "post-purchase-result error";

        postPurchaseResult.textContent =
          "ثبت شماره انجام نشد.";
      }

    } finally {

      if (
        postPurchaseSubmit &&
        !postPurchaseMobile.disabled
      ) {
        postPurchaseSubmit.disabled =
          false;

        postPurchaseSubmit.classList.remove(
          "is-loading"
        );

        postPurchaseSubmit.textContent =
          "ثبت شماره و فعال‌سازی شانس";
      }
    }
  }

  /* ---------------------------------------------------------
     اتصال دکمه‌های خرید محصولات
     --------------------------------------------------------- */

  document.addEventListener(
    "click",
    function (event) {

      const buyButton =
        event.target.closest(
          "[data-buy-product]"
        );

      if (!buyButton) return;

      event.preventDefault();

      const productId =
        buyButton.getAttribute(
          "data-buy-product"
        );

      openPurchaseModal(
        productId
      );
    }
  );

  /* ---------------------------------------------------------
     ارسال فرم خرید
     --------------------------------------------------------- */

  if (purchaseSubmit) {
    purchaseSubmit.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        startPurchase();
      }
    );
  }

  /* ---------------------------------------------------------
     ارسال شماره موبایل بعد از خرید
     --------------------------------------------------------- */

  if (postPurchaseForm) {
    postPurchaseForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        registerPurchaseMobile();
      }
    );
  }

  /* ---------------------------------------------------------
     کنترل ورود شماره موبایل
     --------------------------------------------------------- */

  if (postPurchaseMobile) {
    postPurchaseMobile.addEventListener(
      "input",
      function () {

        let value =
          postPurchaseMobile.value;

        value = value.replace(
          /[^0-9۰-۹]/g,
          ""
        );

        if (value.length > 11) {
          value =
            value.slice(0, 11);
        }

        postPurchaseMobile.value =
          value;
      }
    );
  }

  /* ---------------------------------------------------------
     دکمه‌های بستن پنجره‌ها
     --------------------------------------------------------- */

  document.addEventListener(
    "click",
    function (event) {

      if (
        event.target.matches(
          "[data-close-purchase]"
        )
      ) {
        closePurchaseModal();
      }

      if (
        event.target.matches(
          "[data-close-payment]"
        )
      ) {
        closePaymentResultModal();
      }
    }
  );

  /* ---------------------------------------------------------
     بستن با کلید Escape
     --------------------------------------------------------- */

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Escape") {
        return;
      }

      closePurchaseModal();
      closePaymentResultModal();
    }
  );

  /* ---------------------------------------------------------
     بررسی بازگشت از درگاه
     --------------------------------------------------------- */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      handlePaymentReturn
    );
  } else {
    handlePaymentReturn();
  }

  /* ---------------------------------------------------------
     دسترسی عمومی محدود برای سایر فایل‌ها
     --------------------------------------------------------- */

  window.TTKALAAPayment = {
    openPurchaseModal:
      openPurchaseModal,

    closePurchaseModal:
      closePurchaseModal,

    closePaymentResultModal:
      closePaymentResultModal
  };

})();
