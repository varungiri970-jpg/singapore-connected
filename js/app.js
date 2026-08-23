/* ============================================================
   APP — Premium Edition (Mobile-Friendly with Error Display)
   ============================================================ */

(function() {
    'use strict';

    const CONFIG = {
        animationOffset: 60,
        counterDuration: 2000,
        backToTopThreshold: 400
    };

    function getPage() {
        const path = window.location.pathname;
        if (path.includes('origins'))      return 'origins';
        if (path.includes('growth'))       return 'growth';
        if (path.includes('smart-nation')) return 'smart-nation';
        if (path.includes('timeline'))     return 'timeline';
        return 'home';
    }

    async function fetchJSON(url) {
        try {
            console.log(`[fetchJSON] Fetching: ${url}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`[fetchJSON] Success: ${url}`);
            return data;
        } catch (error) {
            console.error(`[fetchJSON] Failed to fetch ${url}:`, error.message);
            return null;
        }
    }

    async function renderTimelineSection(container, limit) {
        if (!container) {
            console.warn('Timeline container not found');
            return;
        }

        // Show loading state with clear message
        container.innerHTML = '<p class="loading-message">⏳ Loading timeline...</p>';

        const data = await fetchJSON('data/timeline.json');

        // Handle fetch errors — SHOW ERROR ON SCREEN
        if (!data || !Array.isArray(data.timeline)) {
            container.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; background: #FFF0F0; border-radius: 12px; border: 1px solid #ED2939;">
                    <p style="font-size: 1.2rem; font-weight: 600; color: #ED2939;">⚠️ Timeline data could not be loaded</p>
                    <p style="color: #5A4A4A; margin-top: 0.5rem;">Please check your internet connection and refresh the page.</p>
                    <p style="color: #8A7A7A; font-size: 0.85rem; margin-top: 0.5rem;">If the problem persists, try clearing your browser cache.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #ED2939; color: white; border: none; border-radius: 6px; cursor: pointer;">Refresh Page</button>
                </div>
            `;
            return;
        }

        // Validate timeline data
        const validationResult = window.validateTimelineData(data.timeline);
        if (!validationResult.valid) {
            console.warn('Timeline validation warnings:', validationResult.errors);
        } else {
            console.log(`Timeline validation passed (${validationResult.count} items)`);
        }

        const page = getPage();
        let items = [...data.timeline];

        // Filter by page
        if (page !== 'home' && page !== 'timeline') {
            items = items.filter(item => item.page === page);
            console.log(`Filtered to ${items.length} items for "${page}" page`);
        }

        // Sort by year
        items.sort((a, b) => a.year - b.year);

        // Limit for home preview
        if (limit && items.length > limit) {
            const previewYears = [1981, 1987, 1994, 1997, 2006, 2014, 2024];
            const preview = items.filter(item => previewYears.includes(item.year));
            items = preview.length >= limit ? preview.slice(0, limit) : items.slice(0, limit);
        }

        if (items.length === 0) {
            container.innerHTML = `
                <p class="error-message" style="text-align: center; padding: 2rem;">
                    ⚠️ No timeline items found for this page.
                </p>
            `;
            return;
        }

        // Render using the template engine
        try {
            container.innerHTML = window.renderTimeline(items);
            console.log(`✅ Rendered ${items.length} timeline items on "${page}" page`);

            // Re-trigger scroll animations
            if (typeof initScrollAnimations === 'function') {
                setTimeout(initScrollAnimations, 200);
            }
        } catch (renderError) {
            console.error('Render error:', renderError);
            container.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; background: #FFF0F0; border-radius: 12px; border: 1px solid #ED2939;">
                    <p style="color: #ED2939; font-weight: 600;">⚠️ Error rendering timeline</p>
                    <p style="color: #5A4A4A;">${renderError.message}</p>
                </div>
            `;
        }
    }

    async function renderStatisticsSection(container) {
        if (!container) return;

        container.innerHTML = '<p class="loading-message">⏳ Loading statistics...</p>';

        const data = await fetchJSON('data/statistics.json');

        if (!data || !Array.isArray(data.statistics) || data.statistics.length === 0) {
            container.innerHTML = `
                <div class="error-message" style="padding: 1.5rem; text-align: center; background: #FFF0F0; border-radius: 12px; border: 1px solid #ED2939;">
                    <p style="color: #ED2939;">⚠️ Statistics data could not be loaded</p>
                </div>
            `;
            return;
        }

        const validationResult = window.validateStatisticsData(data.statistics);
        if (!validationResult.valid) {
            console.warn('Statistics validation warnings:', validationResult.errors);
        }

        container.innerHTML = window.renderStatistics(data.statistics);
        console.log(`✅ Rendered ${data.statistics.length} statistics items`);
    }

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.backToTopThreshold) {
                btn.classList.add('is-visible');
            } else {
                btn.classList.remove('is-visible');
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ============================================================
    // MAIN INITIALISATION
    // ============================================================

    function initApp() {
        const page = getPage();

        const timelinePreview = document.getElementById('timelinePreview');
        const timelineContainer = document.getElementById('timelineContainer');
        const statsContainer = document.getElementById('statsContainer');

        console.log(`🚀 Singapore Connected — "${page}" page loaded`);
        console.log(`📱 Device: ${window.innerWidth < 768 ? 'Mobile' : 'Desktop'}`);

        if (page === 'home') {
            renderTimelineSection(timelinePreview, 6);
            renderStatisticsSection(statsContainer);
        } else if (page === 'timeline') {
            renderTimelineSection(timelineContainer, null);
        } else {
            renderTimelineSection(timelineContainer, null);
        }

        setTimeout(initScrollAnimations, 300);
        initBackToTop();
        initHeaderScroll();

        console.log('📦 Template engine: Custom JavaScript renderer (renderer.js)');
    }

    // --- Run on DOM ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
