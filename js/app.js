/* ============================================================
   APP — COMPLETE SELF-CONTAINED VERSION (Mobile Fix v2)
   No external dependencies — all in one file
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // TEMPLATE ENGINE (built-in — no external dependency)
    // ============================================================

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    function getCategoryClass(category) {
        const map = {
            'Academic': 'academic',
            'Commercial': 'commercial',
            'Government': 'government',
            'Infrastructure': 'infrastructure'
        };
        return map[category] || '';
    }

    function renderTimelineItem(item) {
        const categoryClass = getCategoryClass(item.category);
        const sourceHtml = item.sourceUrl
            ? `<a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.source || 'Source')}</a>`
            : escapeHTML(item.source || '');

        return `
            <div class="timeline-item">
                <div class="timeline-year">${escapeHTML(String(item.year))}</div>
                <div class="timeline-content">
                    <span class="tl-category ${categoryClass}">${escapeHTML(item.category || 'General')}</span>
                    <h4>${escapeHTML(item.title)}</h4>
                    <p>${escapeHTML(item.description || '')}</p>
                    ${item.significance ? `<p class="tl-significance">${escapeHTML(item.significance)}</p>` : ''}
                    <p class="tl-source">Source: ${sourceHtml}</p>
                </div>
            </div>
        `;
    }

    function renderTimeline(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return '<p class="error-message">No timeline items to display.</p>';
        }
        return items.map(item => renderTimelineItem(item)).join('');
    }

    function renderStatistics(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return '<p class="error-message">No statistics available.</p>';
        }
        return items.map(stat => `
            <div class="stat-card">
                <span class="stat-number">${escapeHTML(stat.value || '—')}</span>
                <span class="stat-label">${escapeHTML(stat.label || '')}</span>
                ${stat.year ? `<span class="stat-year">${escapeHTML(String(stat.year))}</span>` : ''}
                ${stat.source ? `<span class="stat-source">Source: ${escapeHTML(stat.source)}</span>` : ''}
            </div>
        `).join('');
    }

    // ============================================================
    // MAIN APP
    // ============================================================

    function getPage() {
        const path = window.location.pathname;
        if (path.includes('origins'))      return 'origins';
        if (path.includes('growth'))       return 'growth';
        if (path.includes('smart-nation')) return 'smart-nation';
        if (path.includes('timeline'))     return 'timeline';
        return 'home';
    }

    function showError(container, message) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #FFF0F0; border-radius: 12px; border: 2px solid #ED2939;">
                <p style="font-size: 1.2rem; font-weight: bold; color: #ED2939;">⚠️ ${message}</p>
                <p style="color: #5A4A4A; margin-top: 0.5rem;">Please check your connection and refresh.</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 2rem; background: #ED2939; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
        revealAncestors(container);
    }

    function showLoading(container) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6A5A5A;">⏳ Loading timeline...</p>';
    }

    // Force any wrapping .scroll-animate ancestor to be visible.
    // Guards against the reveal-on-scroll observer never firing for this
    // element (e.g. it sat mid-viewport before content loaded and grew
    // afterward, or the intersection event was otherwise missed).
    function revealAncestors(el) {
        let node = el;
        while (node && node !== document.body) {
            if (node.classList && node.classList.contains('scroll-animate')) {
                node.classList.add('is-visible');
            }
            node = node.parentElement;
        }
    }

    // Real cache-busting: many mobile carriers and intermediary proxies
    // cache GET responses keyed by URL and ignore Cache-Control request
    // headers (those only govern the local browser's own HTTP cache).
    // Putting a changing value directly in the URL guarantees a fresh
    // response regardless of any proxy sitting in between.
    function bust(url) {
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}_=${Date.now()}`;
    }

    async function fetchJSON(url) {
        try {
            console.log('📡 Fetching:', url);
            const response = await fetch(bust(url), {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }
            const data = await response.json();
            console.log('✅ Loaded:', url, '—', Object.keys(data));
            return data;
        } catch (error) {
            console.error('❌ Failed to fetch', url, ':', error.message);
            return null;
        }
    }

    async function renderTimelineSection(container, limit) {
        if (!container) {
            console.warn('Container not found');
            return;
        }

        showLoading(container);

        const data = await fetchJSON('data/timeline.json');

        if (!data || !data.timeline || !Array.isArray(data.timeline)) {
            showError(container, 'Timeline data could not be loaded. Check your connection.');
            return;
        }

        const page = getPage();
        let items = [...data.timeline];

        if (page !== 'home' && page !== 'timeline') {
            items = items.filter(item => item.page === page);
        }

        items.sort((a, b) => a.year - b.year);

        if (limit && items.length > limit) {
            const previewYears = [1981, 1987, 1994, 1997, 2006, 2014, 2024];
            const preview = items.filter(item => previewYears.includes(item.year));
            items = preview.length >= limit ? preview.slice(0, limit) : items.slice(0, limit);
        }

        if (items.length === 0) {
            container.innerHTML = '<p class="error-message">No timeline items found for this page.</p>';
            revealAncestors(container);
            return;
        }

        try {
            container.innerHTML = renderTimeline(items);
            revealAncestors(container);
            console.log('✅ Rendered', items.length, 'items');
        } catch (e) {
            console.error('Render error:', e);
            showError(container, 'Error rendering: ' + e.message);
        }
    }

    async function renderStatisticsSection(container) {
        if (!container) return;

        container.innerHTML = '<p style="text-align: center; padding: 1rem; color: #6A5A5A;">⏳ Loading stats...</p>';

        const data = await fetchJSON('data/statistics.json');

        if (!data || !data.statistics || data.statistics.length === 0) {
            container.innerHTML = '<p class="error-message">Statistics could not be loaded.</p>';
            revealAncestors(container);
            return;
        }

        container.innerHTML = renderStatistics(data.statistics);
        revealAncestors(container);
    }

    function initScrollAnimations() {
        const targets = document.querySelectorAll('.scroll-animate');

        if (!('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        targets.forEach(el => observer.observe(el));

        // Safety net: if the observer never fires for some element on some
        // device (viewport quirks, content resizing after observation
        // starts, etc.), force it visible after a few seconds so nothing
        // is ever permanently stuck at opacity: 0.
        setTimeout(() => {
            document.querySelectorAll('.scroll-animate:not(.is-visible)').forEach(el => {
                el.classList.add('is-visible');
            });
        }, 4000);
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

    // ============================================================
    // INIT
    // ============================================================

    function initApp() {
        const page = getPage();
        console.log('🚀 Singapore Connected — page:', page);
        console.log('📱 Device:', window.innerWidth < 768 ? 'Mobile' : 'Desktop');

        const timelinePreview = document.getElementById('timelinePreview');
        const timelineContainer = document.getElementById('timelineContainer');
        const statsContainer = document.getElementById('statsContainer');

        // Each section's fetch/render is isolated in its own promise chain
        // so one failure can never block or freeze the rest of the page.
        if (page === 'home') {
            renderTimelineSection(timelinePreview, 6).catch(err => console.error('Timeline preview failed:', err));
            renderStatisticsSection(statsContainer).catch(err => console.error('Statistics failed:', err));
        } else {
            renderTimelineSection(timelineContainer, null).catch(err => console.error('Timeline failed:', err));
        }

        initScrollAnimations();
        initBackToTop();
        initHeaderScroll();
    }

    // --- Run ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
