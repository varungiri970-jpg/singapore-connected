/* ============================================================
   ROUTER — Navigation & hamburger menu
   Note: active class is set in HTML per-page; this file
   handles the hamburger toggle and exposes getCurrentPage().
   ============================================================ */

(function() {
    'use strict';

    /**
     * Derive the current page identifier from the URL pathname.
     * @returns {'home'|'origins'|'growth'|'smart-nation'|'timeline'}
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('origins'))      return 'origins';
        if (path.includes('growth'))       return 'growth';
        if (path.includes('smart-nation')) return 'smart-nation';
        if (path.includes('timeline'))     return 'timeline';
        return 'home';
    }

    /**
     * Initialise the hamburger / mobile-nav toggle.
     * Uses the `hidden` attribute (HTML boolean) to show/hide.
     */
    function initHamburger() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileNav = document.getElementById('mobileNav');

        if (!hamburgerBtn || !mobileNav) return;

        // Toggle on button click
        hamburgerBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!isExpanded));
            mobileNav.hidden = isExpanded; // hide when it was open, show when it was closed
        });

        // Close when a nav link is clicked (user is navigating)
        mobileNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                mobileNav.hidden = true;
            });
        });

        // Close when clicking outside the header
        document.addEventListener('click', function(event) {
            const header = document.querySelector('.site-header');
            if (header && !header.contains(event.target) && !mobileNav.hidden) {
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                mobileNav.hidden = true;
            }
        });
    }

    // --- Run on DOM ready ---
    document.addEventListener('DOMContentLoaded', function() {
        initHamburger();
        console.log(`📍 Router: current page is "${getCurrentPage()}"`);
    });

    // --- Expose ---
    window.getCurrentPage = getCurrentPage;

})();