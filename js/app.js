/* ============================================================
   APP — Premium Edition
   Fetch, validate, render + scroll animations + counters
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${url}:`, error.message);
            return null;
        }
    }

    async function renderTimelineSection(container, limit) {
        if (!container) return;
        container.innerHTML = '<p class="loading-message">Loading timeline...</p>';
        const data = await fetchJSON('data/timeline.json');
        if (!data || !Array.isArray(data.timeline)) {
            container.innerHTML = `<p class="error-message">Timeline data could not be loaded.</p>`;
            return;
        }
        const validationResult = window.validateTimelineData(data.timeline);
        if (!validationResult.valid) console.warn('Timeline validation warnings:', validationResult.errors);
        else console.log(`Timeline validation passed (${validationResult.count} items)`);

        const page = getPage();
        let items = [...data.timeline];
        if (page !== 'home' && page !== 'timeline') items = items.filter(item => item.page === page);
        items.sort((a, b) => a.year - b.year);

        if (limit && items.length > limit) {
            const previewYears = [1981, 1987, 1994, 1997, 2006, 2014, 2024];
            const preview = items.filter(item => previewYears.includes(item.year));
            items = preview.length >= limit ? preview.slice(0, limit) : items.slice(0, limit);
        }
        if (items.length === 0) {
            container.innerHTML = `<p class="error-message">No timeline items found for this page.</p>`;
            return;
        }
        container.innerHTML = window.renderTimeline(items);
        console.log(`Rendered ${items.length} timeline items on "${page}" page`);
        initScrollAnimations();
    }

    async function renderStatisticsSection(container) {
        if (!container) return;
        container.innerHTML = '<p class="loading-message">Loading statistics...</p>';
        const data = await fetchJSON('data/statistics.json');
        if (!data || !Array.isArray(data.statistics) || data.statistics.length === 0) {
            container.innerHTML = `<p class="error-message">Statistics data could not be loaded.</p>`;
            return;
        }
        const validationResult = window.validateStatisticsData(data.statistics);
        if (!validationResult.valid) console.warn('Statistics validation warnings:', validationResult.errors);
        else console.log(`Statistics validation passed (${data.statistics.length} items)`);

        container.innerHTML = window.renderStatistics(data.statistics);
        console.log(`Rendered ${data.statistics.length} statistics items`);
        setTimeout(initCounters, 100);
        initScrollAnimations();
    }

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: `0px 0px -${CONFIG.animationOffset}px 0px`, threshold: 0.1 });
        document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
    }

    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-value]');
        counters.forEach(counter => {
            const target = counter.getAttribute('data-value');
            if (!target) return;
            const num = parseFloat(target);
            if (isNaN(num)) return;
            const suffix = target.replace(/[0-9.]/g, '');
            const duration = CONFIG.counterDuration;
            const start = performance.now();
            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = (num * ease).toFixed(1).replace(/\.0$/, '');
                counter.textContent = current + suffix;
                if (progress < 1) requestAnimationFrame(update);
                else counter.textContent = target;
            }
            requestAnimationFrame(update);
        });
    }

    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.backToTopThreshold) btn.classList.add('is-visible');
            else btn.classList.remove('is-visible');
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }, { passive: true });
    }

    function initApp() {
        const page = getPage();
        const timelinePreview = document.getElementById('timelinePreview');
        const timelineContainer = document.getElementById('timelineContainer');
        const statsContainer = document.getElementById('statsContainer');
        console.log(`Singapore Connected Premium — "${page}" page initialised`);

        if (page === 'home') {
            renderTimelineSection(timelinePreview, 6);
            renderStatisticsSection(statsContainer);
        } else if (page === 'timeline') {
            renderTimelineSection(timelineContainer, null);
        } else {
            renderTimelineSection(timelineContainer, null);
        }
        initScrollAnimations();
        initBackToTop();
        initHeaderScroll();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
    else initApp();
})();
