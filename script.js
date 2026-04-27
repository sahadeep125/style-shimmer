/* Closeta - vanilla JS for OS detection, scroll animations, and funnel tracking */

(function () {
  "use strict";

  // ---- 1. OS detection: show only the relevant download buttons ----
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

  // ---- 2. Tracking Engine ----
  function trackEvent(eventName, eventPayload) {
    // 1. GA4
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", eventName, eventPayload);
      } catch (err) {
        console.error("GA event failed", err);
      }
    }

    // 2. GTM / DataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventPayload
      });
    }

    // 3. Debug log (optional, remove in production if preferred)
    // console.log("Track:", eventName, eventPayload);
  }

  // CTA Click Tracking
  function initCtaTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-cta]");
      if (!el) return;
      
      var ctaName = el.getAttribute("data-cta") || "unknown";
      var ctaTarget = el.getAttribute("href") || "";
      var platform = el.getAttribute("data-platform") || "both";
      
      trackEvent("cta_click", {
        event_category: "engagement",
        event_label: ctaName,
        cta_name: ctaName,
        cta_target: ctaTarget,
        platform: platform,
        funnel_step: "conversion"
      });
    });
  }

  // Section View Tracking (Funnel Steps)
  function initSectionTracking() {
    if (!window.IntersectionObserver) return;

    var trackedSections = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var sectionName = entry.target.getAttribute("data-track-section");
          if (sectionName && !trackedSections.has(sectionName)) {
            trackedSections.add(sectionName);
            trackEvent("section_view", {
              event_category: "funnel",
              event_label: sectionName,
              section_name: sectionName,
              funnel_step: "engagement"
            });
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll("[data-track-section]").forEach(function (el) {
      observer.observe(el);
    });
  }

  // FAQ Interaction Tracking
  function initFaqTracking() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-track-faq]");
      if (!btn) return;

      var faqId = btn.getAttribute("data-track-faq");
      var item = btn.closest(".faq-item");
      var isOpening = !item.classList.contains("open");

      if (isOpening) {
        trackEvent("faq_expand", {
          event_category: "engagement",
          event_label: faqId,
          faq_id: faqId,
          funnel_step: "consideration"
        });
      }
    });
  }

  // ---- 3. UI Interactions (Consolidated from index.html) ----
  
  function initFaqAccordion() {
    document.querySelectorAll(".faq-q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var wasOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (o) {
          o.classList.remove("open");
        });
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  function initScrollReveal() {
    if (!window.IntersectionObserver) return;
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  function initStickyCta() {
    var sticky = document.getElementById("stickyCta");
    var heroSection = document.querySelector(".hero");
    if (!sticky || !heroSection) return;

    var stickyShown = false;
    window.addEventListener("scroll", function () {
      var heroBottom = heroSection.getBoundingClientRect().bottom;
      var finalCta = document.querySelector(".final-cta");
      var nearFooter = (finalCta?.getBoundingClientRect().top ?? 9999) < window.innerHeight;
      var shouldShow = heroBottom < 100 && !nearFooter;
      
      if (shouldShow !== stickyShown) {
        sticky.classList.toggle("show", shouldShow);
        stickyShown = shouldShow;
        
        if (shouldShow) {
          trackEvent("sticky_cta_reveal", {
            event_category: "engagement",
            funnel_step: "engagement"
          });
        }
      }
    }, { passive: true });
  }

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
    
    // Tracking
    initCtaTracking();
    initSectionTracking();
    initFaqTracking();
    
    // UI
    initFaqAccordion();
    initScrollReveal();
    initStickyCta();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
