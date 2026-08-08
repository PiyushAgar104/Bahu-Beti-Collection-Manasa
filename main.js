(function () {
  "use strict";

  /* ---------- Loader ---------- */
  window.addEventListener("load", function () {
    var loader = document.getElementById("loader");
    if (loader) {
      setTimeout(function () {
        loader.classList.add("is-hidden");
      }, 400);
    }
  });

  /* ---------- Scroll Progress Bar ---------- */
  var progressBar = document.getElementById("scrollProgressBar");
  function updateScrollProgress() {
    var winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    if (progressBar) {
      progressBar.style.width = scrolled + "%";
    }
  }

  /* ---------- Sticky header + active link on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var scrollTopBtn = document.getElementById("scrollTop");

  function onScroll() {
    updateScrollProgress();
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle("is-visible", y > 480);

    var current = "home";
    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active-link", link.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Full-Screen Hero Slider (4s Auto-Slide + Touch Swipe + Dot Nav) ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotsWrap = document.getElementById("heroDots");
  var heroSlider = document.getElementById("heroSlider");
  var slideIndex = 0;
  var SLIDE_INTERVAL = 4000; // Exact 4-second auto slide
  var autoSlideTimer = null;

  if (slides.length) {
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach(function (_, i) {
        var dot = document.createElement("span");
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", function () {
          showSlide(i);
          resetAutoSlide();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function showSlide(i) {
      var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
      slides[slideIndex].classList.remove("is-active");
      if (dots[slideIndex]) dots[slideIndex].classList.remove("is-active");

      slideIndex = (i + slides.length) % slides.length;

      slides[slideIndex].classList.add("is-active");
      if (dots[slideIndex]) dots[slideIndex].classList.add("is-active");
    }

    function startAutoSlide() {
      autoSlideTimer = setInterval(function () {
        showSlide(slideIndex + 1);
      }, SLIDE_INTERVAL);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideTimer);
      startAutoSlide();
    }

    startAutoSlide();

    // Mobile Swipe Support
    var touchStartX = 0;
    var touchEndX = 0;
    if (heroSlider) {
      heroSlider.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      heroSlider.addEventListener("touchend", function (e) {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          showSlide(slideIndex + 1); // Swipe left -> Next
          resetAutoSlide();
        } else if (touchEndX - touchStartX > 50) {
          showSlide(slideIndex - 1); // Swipe right -> Prev
          resetAutoSlide();
        }
      }, { passive: true });
    }
  }

  /* ---------- IntersectionObserver Scroll Animations (Fade Up, Left, Right, Scale, Blur) ---------- */
  var animTargets = Array.prototype.slice.call(document.querySelectorAll(".fade-up, .fade-left, .fade-right, .scale-in, .blur-reveal"));
  if ("IntersectionObserver" in window) {
    var animObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            animObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    animTargets.forEach(function (el) {
      animObserver.observe(el);
    });
  } else {
    animTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Product Catalogue Rendering ---------- */
  var PRODUCT_PALETTES = [
    ["#E6D5B8", "#C89D7C"],
    ["#F7F2EB", "#C89D7C"],
    ["#EFE8DE", "#7A1C30"]
  ];

  function placeholderSvg(seed) {
    var palette = PRODUCT_PALETTES[seed % PRODUCT_PALETTES.length];
    return (
      '<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder product photo">' +
      '<defs><linearGradient id="g' + seed + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + palette[0] + '"/>' +
      '<stop offset="100%" stop-color="' + palette[1] + '"/>' +
      "</linearGradient></defs>" +
      '<rect width="300" height="400" fill="url(#g' + seed + ')"/>' +
      '<text x="150" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="rgba(26,22,21,.7)">Bahu Beti Collection</text>' +
      "</svg>"
    );
  }

  var productDataEl = document.getElementById("productData");
  var productGrid = document.getElementById("productGrid");
  var productsEmpty = document.getElementById("productsEmpty");
  var products = [];

  if (productDataEl && productGrid) {
    try {
      products = JSON.parse(productDataEl.textContent);
    } catch (e) {
      products = [];
    }

    var cardEls = products.map(function (p, i) {
      var card = document.createElement("article");
      card.className = "product-card fade-up";
      card.dataset.category = p.category;
      card.dataset.name = p.name.toLowerCase();

      var mediaContent = p.image
        ? '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">'
        : placeholderSvg(i);

      var specsText = p.specs ? '<p class="product-specs">' + p.specs + '</p>' : '';
      
      var waMessage = encodeURIComponent('Hello Bahu Beti Collection, I want to buy/inquire: ' + p.name + ' (₹' + p.price + ')');
      var waLink = 'https://wa.me/918349983344?text=' + waMessage;

      card.innerHTML =
        '<div class="product-media">' +
        mediaContent +
        '<span class="product-tag">' + p.category + "</span>" +
        "</div>" +
        '<div class="product-body">' +
        '<h3 class="product-name">' + p.name + "</h3>" +
        specsText +
        '<div class="product-footer">' +
        '<span class="product-price">' + p.price.toLocaleString("en-IN") + "</span>" +
        '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn-buy-wa">Buy on WhatsApp</a>' +
        "</div>" +
        "</div>";
      productGrid.appendChild(card);
      return card;
    });

    if ("IntersectionObserver" in window) {
      var cardObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              cardObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      cardEls.forEach(function (c) {
        cardObserver.observe(c);
      });
    } else {
      cardEls.forEach(function (c) {
        c.classList.add("is-visible");
      });
    }

    /* Filtering + search */
    var pills = Array.prototype.slice.call(document.querySelectorAll(".pill"));
    var searchInput = document.getElementById("productSearch");
    var activeFilter = "all";

    function applyFilters() {
      var query = (searchInput && searchInput.value.trim().toLowerCase()) || "";
      var visibleCount = 0;
      cardEls.forEach(function (card) {
        var matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
        var matchesQuery = !query || card.dataset.name.indexOf(query) !== -1;
        var show = matchesFilter && matchesQuery;
        card.style.display = show ? "" : "none";
        if (show) visibleCount++;
      });
      if (productsEmpty) productsEmpty.hidden = visibleCount !== 0;
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");
        activeFilter = pill.dataset.filter;
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }
  }

  /* ---------- Gallery Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var masonryItems = Array.prototype.slice.call(document.querySelectorAll(".masonry-item"));

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      lightbox.hidden = true;
    }, 400);
  }

  masonryItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var img = item.querySelector("img");
      openLightbox(item.dataset.full || (img ? img.src : ""), img ? img.alt : "");
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Contact Form Handler ---------- */
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(contactForm);
      if (formStatus) formStatus.textContent = "Sending your inquiry…";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      })
        .then(function () {
          if (formStatus) formStatus.textContent = "Thank you! We will get back to you shortly.";
          contactForm.reset();
        })
        .catch(function () {
          if (formStatus) {
            formStatus.textContent =
              "Something went wrong. Please call +91 83499 83344 directly.";
          }
        });
    });
  }
})();
