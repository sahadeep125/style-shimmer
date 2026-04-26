/* Closeta — vanilla JS for OS detection, scroll animations, icons, CTA tracking */

(function () {
  "use strict";

  // ---- 1. Lucide icons: render as soon as DOM ready ----
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // ---- 2. OS detection: show only the relevant download buttons ----
  function detectPlatform() {
    var ua = navigator.userAgent || navigator.vendor || "";
    var platform = "both";

    if (/android/i.test(ua)) {
      platform = "android";
    } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      platform = "ios";
    } else if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) {
      // iPadOS 13+ reports as Mac with touch
      platform = "ios";
    }

    document.documentElement.setAttribute("data-os", platform);

    var nodes = document.querySelectorAll("[data-platform]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getAttribute("data-platform") === platform) {
        nodes[i].classList.add("show");
      }
    }
  }

  // ---- 3. Scroll-triggered fade-in animations ----
  function initScrollFade() {
    var els = document.querySelectorAll(".scroll-fade");
    if (!("IntersectionObserver" in window)) {
      // Graceful fallback: just show everything
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add("visible");
      }
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  // ---- 4. Lightweight CTA click tracking ----
  function initCtaTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-cta]");
      if (!el) return;
      var name = el.getAttribute("data-cta");

      // Push to GTM dataLayer if present
      if (window.dataLayer) {
        window.dataLayer.push({ event: "cta_click", cta: name });
      }

      // Console log for debugging / quick QA
      try {
        console.log("[CTA]", name);
      } catch (err) {}
    });
  }

  // ---- 5. Smooth-scroll polish for in-page links ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ---- Boot ----
  function boot() {
    detectPlatform();
    renderIcons();
    initScrollFade();
    initCtaTracking();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
