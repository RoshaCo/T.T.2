/* =========================================================
   فایل اصلی مدیریت سایت T.T.KALAA
   اتصال بخش‌های مختلف، آمار لحظه‌ای و تعاملات عمومی
   به‌روزرسانی: فیک ریویو یکسان با قوانین جدید،
   خرید روزانه، مجموع دوره، صفحه قوانین
========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     تنظیمات عمومی
     --------------------------------------------------------- */

  const CONFIG = {
    visitorUpdateMin: 120000,
    visitorUpdateMax: 240000,
    statsRefresh: 60000,
    testimonialInterval: 3000,
    storageKey: "ttkalaa_shared_visitor_v2",
    dailyStorageKey: "ttkalaa_daily_purchases_v2",
    periodStorageKey: "ttkalaa_period_total_v2"
  };

  /* ---------------------------------------------------------
     تبدیل اعداد به فارسی
     --------------------------------------------------------- */

  function toPersianNumber(value) {
    return String(value).replace(
      /\d/g,
      function (digit) {
        return "۰۱۲۳۴۵۶۷۸۹"[digit];
      }
    );
  }

  /* ---------------------------------------------------------
     تولید عدد تصادفی
     --------------------------------------------------------- */

  function randomInt(min, max) {
    return Math.floor(
      Math.random() * (max - min + 1)
    ) + min;
  }

  /* ---------------------------------------------------------
     تشخیص ساعت تهران
     --------------------------------------------------------- */

  function getTehranHour() {
    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "Asia/Tehran",
          hour: "numeric",
          hour12: false
        }
      ).formatToParts(new Date());

    let hour = 0;

    parts.forEach(function (part) {
      if (part.type === "hour") {
        hour = Number(part.value);
      }
    });

    return hour;
  }

  /* ---------------------------------------------------------
     محدوده بازدیدکنندگان بر اساس ساعت تهران
     --------------------------------------------------------- */

  function getVisitorRangeByHour() {
    const hour = getTehranHour();

    if (hour >= 9 && hour < 13) {
      return {
        min: 17,
        max: 29
      };
    }

    if (hour >= 13 && hour < 17) {
      return {
        min: 9,
        max: 15
      };
    }

    if (hour >= 17 && hour < 24) {
      return {
        min: 23,
        max: 38
      };
    }

    return {
      min: 9,
      max: 14
    };
  }

  /* ---------------------------------------------------------
     تولید عدد بعدی نزدیک به عدد قبلی
     --------------------------------------------------------- */

  function getNextCloseNumber(current, range) {
    let minNext =
      Math.max(
        range.min,
        current - 2
      );

    let maxNext =
      Math.min(
        range.max,
        current + 2
      );

    let next =
      randomInt(
        minNext,
        maxNext
      );

    if (next === current) {
      if (next < range.max) {
        next++;
      } else {
        next--;
      }
    }

    return next;
  }

  /* ---------------------------------------------------------
     نمایش تعداد بازدیدکنندگان
     یکسان برای همه کاربران
     --------------------------------------------------------- */

  function updateVisitors() {
    const element =
      document.getElementById(
        "liveVisitorsText"
      );

    if (!element) return;

    const now = new Date();

    const range =
      getVisitorRangeByHour();

    let stored =
      localStorage.getItem(
        CONFIG.storageKey
      );

    let sharedData = null;

    if (stored) {
      try {
        sharedData =
          JSON.parse(stored);
      } catch {
        sharedData = null;
      }
    }

    if (
      !sharedData ||
      !sharedData.value ||
      !sharedData.timestamp
    ) {
      sharedData = {
        value: randomInt(
          range.min,
          range.max
        ),
        timestamp:
          now.getTime()
      };

      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(
          sharedData
        )
      );
    }

    const elapsed =
      now.getTime() -
      sharedData.timestamp;

    const updateInterval =
      randomInt(
        CONFIG.visitorUpdateMin,
        CONFIG.visitorUpdateMax
      );

    if (
      elapsed >=
      updateInterval
    ) {
      const currentValue =
        Number(
          sharedData.value
        );

      let next;

      if (
        currentValue <
          range.min ||
        currentValue >
          range.max
      ) {
        next =
          randomInt(
            range.min,
            range.max
          );
      } else {
        next =
          getNextCloseNumber(
            currentValue,
            range
          );
      }

      sharedData = {
        value: next,
        timestamp:
          now.getTime()
      };

      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(
          sharedData
        )
      );
    }

    element.textContent =
      "همین حالا " +
      toPersianNumber(
        sharedData.value
      ) +
      " نفر در سایت هستند";
  }

  /* ---------------------------------------------------------
     زمان تغییر بعدی بازدیدکنندگان
     --------------------------------------------------------- */

  function scheduleVisitorUpdate() {
    const delay =
      randomInt(
        CONFIG.visitorUpdateMin,
        CONFIG.visitorUpdateMax
      );

    setTimeout(
      function () {
        updateVisitors();
        scheduleVisitorUpdate();
      },
      delay
    );
  }

  /* ---------------------------------------------------------
     تولید عدد روزانه خرید
     --------------------------------------------------------- */

  function getDailyPurchases() {
    const now =
      new Date();

    const tehranString =
      now.toLocaleString(
        "en-US",
        {
          timeZone:
            "Asia/Tehran"
        }
      );

    const tehranNow =
      new Date(
        tehranString
      );

    const dayKey =
      String(
        tehranNow.getFullYear()
      ) +
      "-" +
      String(
        tehranNow.getMonth() + 1
      ) +
      "-" +
      String(
        tehranNow.getDate()
      );

    let stored =
      localStorage.getItem(
        CONFIG.dailyStorageKey
      );

    let dailyData = null;

    if (stored) {
      try {
        dailyData =
          JSON.parse(stored);
      } catch {
        dailyData = null;
      }
    }

    if (
      !dailyData ||
      dailyData.day !== dayKey
    ) {
      dailyData = {
        day: dayKey,
        value: 0
      };

      localStorage.setItem(
        CONFIG.dailyStorageKey,
        JSON.stringify(
          dailyData
        )
      );
    }

    const currentHour =
      tehranNow.getHours();

    const currentMinute =
      tehranNow.getMinutes();

    const progress =
      currentHour +
      currentMinute / 60;

    const maxDaily =
      83;

    const target =
      Math.min(
        maxDaily,
        Math.floor(
          maxDaily *
          Math.min(
            1,
            progress / 24
          )
        )
      );

    let currentValue =
      Number(
        dailyData.value
      );

    if (
      currentValue <
      target
    ) {
      currentValue +=
        randomInt(0, 3);

      if (
        currentValue >
        target
      ) {
        currentValue =
          target;
      }

      dailyData.value =
        currentValue;

      localStorage.setItem(
        CONFIG.dailyStorageKey,
        JSON.stringify(
          dailyData
        )
      );
    }

    return dailyData.value;
  }

  /* ---------------------------------------------------------
     مجموع خریدهای این دوره
     --------------------------------------------------------- */

  function getPeriodTotal() {
    let stored =
      localStorage.getItem(
        CONFIG.periodStorageKey
      );

    if (stored) {
      const value =
        Number(stored);

      if (!isNaN(value)) {
        return value;
      }
    }

    const initial =
      randomInt(
        2500,
        4000
      );

    localStorage.setItem(
      CONFIG.periodStorageKey,
      String(initial)
    );

    return initial;
  }

  function updatePeriodTotal(value) {
    localStorage.setItem(
      CONFIG.periodStorageKey,
      String(value)
    );
  }

  /* ---------------------------------------------------------
     نمایش آمار وضعیت لحظه‌ای
     --------------------------------------------------------- */

  function updateDisplayStats() {
    const todayElement =
      document.getElementById(
        "todayPurchasesText"
      );

    const periodElement =
      document.getElementById(
        "totalPurchasesText"
      );

    const dailyCount =
      getDailyPurchases();

    const periodTotal =
      getPeriodTotal();

    if (todayElement) {
      todayElement.textContent =
        "تعداد خریدهای امروز تا این لحظه " +
        toPersianNumber(
          dailyCount
        );
    }

    if (periodElement) {
      periodElement.textContent =
        "مجموع خریدهای این دوره " +
        toPersianNumber(
          periodTotal
        );
    }
  }

  /* ---------------------------------------------------------
     نظرات متحرک
     --------------------------------------------------------- */

  let currentTestimonialIndex = 0;

  function setupTestimonialSlider() {
    const slides =
      document.querySelectorAll(
        ".testimonial-slide"
      );

    if (slides.length === 0) {
      return;
    }

    function showNextTestimonial() {
      slides.forEach(
        function (slide) {
          slide.classList.remove(
            "is-active"
          );
        }
      );

      currentTestimonialIndex =
        (
          currentTestimonialIndex + 1
        ) %
        slides.length;

      slides[
        currentTestimonialIndex
      ].classList.add(
        "is-active"
      );
    }

    setInterval(
      showNextTestimonial,
      CONFIG.testimonialInterval
    );
  }

  /* ---------------------------------------------------------
     اسکرول نرم برای لینک‌های داخلی
     --------------------------------------------------------- */

  function setupSmoothScroll() {
    document.addEventListener(
      "click",
      function (event) {

        const link =
          event.target.closest(
            'a[href^="#"]'
          );

        if (!link) return;

        const targetId =
          link.getAttribute(
            "href"
          );

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(
            targetId
          );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );
  }

  /* ---------------------------------------------------------
     فعال‌سازی دکمه‌های انتخاب محصول
     --------------------------------------------------------- */

  function setupProductButtons() {
    document.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "[data-buy-product]"
          );

        if (!button) return;

        const productId =
          button.getAttribute(
            "data-buy-product"
          );

        if (
          window.TTKALAAPayment &&
          window.TTKALAAPayment
            .openPurchaseModal
        ) {
          window.TTKALAAPayment
            .openPurchaseModal(
              productId
            );
        }
      }
    );
  }

  /* ---------------------------------------------------------
     دکمه‌های CTA
     --------------------------------------------------------- */

  function setupCTAButtons() {
    document.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "[data-scroll-products]"
          );

        if (!button) return;

        const products =
          document.getElementById(
            "products"
          );

        if (!products) return;

        event.preventDefault();

        products.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );
  }

  /* ---------------------------------------------------------
     کنترل منوی موبایل
     --------------------------------------------------------- */

  function setupMobileMenu() {
    const toggle =
      document.querySelector(
        "[data-menu-toggle]"
      );

    const menu =
      document.querySelector(
        "[data-mobile-menu]"
      );

    if (
      !toggle ||
      !menu
    ) {
      return;
    }

    toggle.addEventListener(
      "click",
      function () {

        const isOpen =
          menu.classList.toggle(
            "is-open"
          );

        toggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );
      }
    );

    menu.addEventListener(
      "click",
      function (event) {

        if (
          event.target.closest(
            "a"
          )
        ) {
          menu.classList.remove(
            "is-open"
          );

          toggle.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      }
    );
  }

  /* ---------------------------------------------------------
     جلوگیری از کلیک دوباره هنگام پرداخت
     --------------------------------------------------------- */

  function preventDoubleSubmit() {
    document.addEventListener(
      "submit",
      function (event) {

        const form =
          event.target;

        if (
          form.dataset.processing ===
          "true"
        ) {
          event.preventDefault();
          return;
        }

        if (
          form.matches(
            "#purchaseForm"
          )
        ) {
          form.dataset.processing =
            "true";

          setTimeout(
            function () {
              form.dataset.processing =
                "false";
            },
            10000
          );
        }
      }
    );
  }

  /* ---------------------------------------------------------
     صفحه قوانین و مدیریت دکمه برگشت
     --------------------------------------------------------- */

  function setupLicensePage() {
    const licensePage =
      document.getElementById(
        "licensePage"
      );

    const licenseClose =
      document.getElementById(
        "licenseClose"
      );

    const footerRules =
      document.getElementById(
        "footerRules"
      );

    if (
      !licensePage ||
      !licenseClose ||
      !footerRules
    ) {
      return;
    }

    function openLicense() {
      licensePage.hidden =
        false;

      history.pushState(
        "license",
        ""
      );
    }

    function closeLicense() {
      licensePage.hidden =
        true;

      history.pushState(
        "home",
        ""
      );
    }

    footerRules.addEventListener(
      "click",
      function () {
        openLicense();
      }
    );

    licenseClose.addEventListener(
      "click",
      function () {
        closeLicense();
      }
    );

    /*
     * قبلاً در صورت برگشت مرورگر،
     * کاربر به صفحه اینستاگرام هدایت می‌شد.
     *
     * این رفتار کاملاً حذف شده است.
     */

    window.addEventListener(
      "popstate",
      function () {

        if (
          !licensePage.hidden
        ) {
          closeLicense();
        }
      }
    );
  }

  /* ---------------------------------------------------------
     غیرفعال کردن تمام عناصر مرتبط با اینستاگرام
     بدون تغییر ظاهر
     --------------------------------------------------------- */

  function disableInstagramLinks() {

    document.addEventListener(
      "click",
      function (event) {

        const instagramElement =
          event.target.closest(
            "[data-instagram-disabled]"
          );

        if (!instagramElement) {
          return;
        }

        event.preventDefault();

        event.stopPropagation();

      },
      true
    );


    /*
     * جلوگیری از فعال بودن لینک مستقیم
     * اینستاگرام در صورت وجود در HTML.
     */

    const instagramLinks =
      document.querySelectorAll(
        'a[href*="instagram.com"]'
      );


    instagramLinks.forEach(
      function (link) {

        link.setAttribute(
          "href",
          "#"
        );

        link.removeAttribute(
          "target"
        );

        link.removeAttribute(
          "rel"
        );

        link.setAttribute(
          "data-instagram-disabled",
          ""
        );
      }
    );
  }

  /* ---------------------------------------------------------
     اجرای اولیه
     --------------------------------------------------------- */

  function init() {

    updateVisitors();

    scheduleVisitorUpdate();

    updateDisplayStats();

    setInterval(
      updateDisplayStats,
      CONFIG.statsRefresh
    );

    setupTestimonialSlider();

    setupSmoothScroll();

    setupProductButtons();

    setupCTAButtons();

    setupMobileMenu();

    preventDoubleSubmit();

    setupLicensePage();

    disableInstagramLinks();
  }

  /* ---------------------------------------------------------
     شروع سایت
     --------------------------------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
