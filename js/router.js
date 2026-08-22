/* ============================================================
   ROUTER — Premium Edition
   Hamburger, scroll spy, smooth scroll, keyboard nav
   ============================================================ */

(function() {
    'use strict';

    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('origins'))      return 'origins';
        if (path.includes('growth'))       return 'growth';
        if (path.includes('smart-nation')) return 'smart-nation';
        if (path.includes('timeline'))     return 'timeline';
        return 'home';
    }

    function initHamburger() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('mobileOverlay');
        if (!hamburgerBtn || !mobileNav) return;

        function openMenu() {
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            mobileNav.classList.add('is-open');
            mobileNav.hidden = false;
            if (overlay) overlay.classList.add('is-active');
            document.body.style.overflow = 'hidden';
        }
        function closeMenu() {
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            mobileNav.classList.remove('is-open');
            if (overlay) overlay.classList.remove('is-active');
            document.body.style.overflow = '';
            setTimeout(() => { mobileNav.hidden = true; }, 400);
        }

        hamburgerBtn.addEventListener('click', () => {
            mobileNav.classList.contains('is-open') ? closeMenu() : openMenu();
        });
        mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
        if (overlay) overlay.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMenu();
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const offsetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-desktop a, .nav-mobile a');
        if (sections.length === 0) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                    });
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
        sections.forEach(section => observer.observe(section));
    }

    document.addEventListener('DOMContentLoaded', () => {
        initHamburger();
        initSmoothScroll();
        initScrollSpy();
        console.log(`Router: current page is "${getCurrentPage()}"`);
    });

    window.getCurrentPage = getCurrentPage;
})();
