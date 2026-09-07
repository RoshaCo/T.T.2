/* =========================================================
   مدیریت محصولات T.T.KALAA
   به‌روزرسانی: مسیر عکس‌ها از پوشه pic
========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     فهرست محصولات
     --------------------------------------------------------- */

  const products = [
    {
      id: "images",
      title: "تصاویر ایرانی",
      description:
        "بلیت ورود + مجموعه تصاویر و پس‌زمینه‌های ایرانی",
      price: 29000,
      image: "pic/Im9.jpg"
    },

    {
      id: "music",
      title: "موسیقی ایرانی",
      description:
        "بلیت ورود + مجموعه موسیقی‌های شاهکار هنری ۱۰۰ سال اخیر ایران",
      price: 29000,
      image: "pic/Im10.jpg"
    },

    {
      id: "kids",
      title: "کتاب کودک",
      description:
        "بلیت ورود + مجموعه کتاب‌های الکترونیکی کودک و نوجوان",
      price: 29000,
      image: "pic/Im11.jpg"
    },

    {
      id: "adult",
      title: "کتاب بزرگسال",
      description:
        "بلیت ورود + مجموعه کتاب‌های الکترونیکی بزرگسالان",
      price: 29000,
      image: "pic/Im12.jpg"
    }
  ];

  /* ---------------------------------------------------------
     دسترسی به فهرست محصولات
     --------------------------------------------------------- */

  window.TTKALAAProducts = {

    getAll: function () {
      return products.slice();
    },

    getById: function (id) {
      return products.find(function (product) {
        return product.id === id;
      }) || null;
    },

    getPrice: function (id) {
      const product = this.getById(id);
      return product ? product.price : 0;
    },

    formatPrice: function (price) {
      return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
    }

  };

  /* ---------------------------------------------------------
     قرار دادن اطلاعات محصولات روی کارت‌های سایت
     --------------------------------------------------------- */

  function renderProducts() {
    const cards = document.querySelectorAll("[data-product-id]");

    cards.forEach(function (card) {
      const productId = card.getAttribute("data-product-id");
      const product = TTKALAAProducts.getById(productId);

      if (!product) return;

      const image = card.querySelector("[data-product-image]");
      const title = card.querySelector("[data-product-title]");
      const description = card.querySelector("[data-product-description]");
      const price = card.querySelector("[data-product-price]");

      if (image) {
        image.src = product.image;
        image.alt = product.title;
      }

      if (title) {
        title.textContent = product.title;
      }

      if (description) {
        description.textContent = product.description;
      }

      if (price) {
        price.textContent = TTKALAAProducts.formatPrice(product.price);
      }
    });
  }

  /* ---------------------------------------------------------
     آماده‌سازی صفحه
     --------------------------------------------------------- */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderProducts);
  } else {
    renderProducts();
  }

})();
