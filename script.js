/* Closeta - vanilla JS */

(function () {
    "use strict";


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


    // ---- Boot ----
    function boot() {
        // Tracking
        initCtaTracking();

    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
