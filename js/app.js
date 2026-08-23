/* ============================================================
   APP — Mobile-Fixed Version
   Shows timeline with clear errors if something fails
   ============================================================ */

(function() {
    'use strict';

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
            console.log('📡 Fetching:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }
            const data = await response.json();
            console.log('✅ Loaded:', url);
            return data;
        } catch (error) {
            console.error('❌ Failed:', url, error.message);
            return null;
        }
    }

    function showError(container, message) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #FFF0F0; border-radius: 12px; border: 2px solid #ED2939;">
                <p style="font-size: 1.2rem; font-weight: bold; color: #ED2939;">⚠️ ${message}</p>
                <p style="color: #5A4A4A; margin-top: 0.5rem;">Please refresh or try again.</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 2rem; background: #ED2939; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    }

    async function renderTimelineSection(container, limit) {
        if (!container) {
            console.warn('Container not found');
            return;
        }

        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6A5A5A;">⏳ Loading timeline...</p>';

        // Try to load the JSON
        const data = await fetchJSON('data/timeline.json');

        if (!data || !data.timeline || !Array.isArray(data.timeline)) {
            showError(container, 'Timeline data could not be loaded. Check your connection.');
            return;
        }

        const page = getPage();
        let items = data.timeline;

        // Filter by page
        if (page !== 'home' && page !== 'timeline') {
            items = items.filter(item => item.page === page);
        }

        // Sort by year
        items.sort((a, b) => a.year - b.year);

        // Home page preview limit
        if (limit && items.length > limit) {
            const previewYears = [1981, 1987, 1994, 1997, 2006, 2014, 2024];
            const preview = items.filter(item => previewYears.includes(item.year));
            items = preview.length >= limit ? preview.slice(0, limit) : items.slice(0, limit);
        }

        if (items.length === 0) {
            container.innerHTML = '<p class="error-message">No timeline items found.</p>';
            return;
        }

        // Render using the renderer
        try {
            container.innerHTML = window.renderTimeline(items);
            console.log('✅ Rendered', items.length, 'items');
        } catch (e) {
            showError(container, 'Error rendering: ' + e.message);
        }
    }

    async function renderStatisticsSection(container) {
        if (!container) return;

        container.innerHTML = '<p style="text-align: center; padding: 1rem; color: #6A5A5A;">⏳ Loading stats...</p>';

        const data = await fetchJSON('data/statistics.json');

        if (!data || !data.statistics || data.statistics.length === 0) {
            container.innerHTML = '<p class="error-message">Statistics could not be loaded.</p>';
            return;
        }

        container.innerHTML = window.renderStatistics(data.statistics);
    }

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('is-visible', window.scrollY > 400);
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    // --- MAIN INIT ---
    function initApp() {
        const page = getPage();

        const timelinePreview = document.getElementById('timelinePreview');
        const timelineContainer = document.getElementById('timelineContainer');
        const statsContainer = document.getElementById('statsContainer');

        console.log('🚀 Singapore Connected — "' + page + '" page');
        console.log('📱 Device:', window.innerWidth < 768 ? 'Mobile' : 'Desktop');

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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
