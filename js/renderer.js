/* ============================================================
   RENDERER — Custom Template Engine
   Converts JSON data arrays into HTML strings
   ============================================================ */

(function() {
    'use strict';

    /**
     * Escape a string to prevent XSS injection
     * @param {string} str
     * @returns {string}
     */
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    /**
     * Map a category name to its CSS modifier class
     * @param {string} category
     * @returns {string}
     */
    function getCategoryClass(category) {
        const map = {
            'Academic': 'academic',
            'Commercial': 'commercial',
            'Government': 'government',
            'Infrastructure': 'infrastructure'
        };
        return map[category] || '';
    }

    /**
     * Render a single timeline item as an HTML string
     * @param {Object} item
     * @returns {string}
     */
    function renderTimelineItem(item) {
        const categoryClass = getCategoryClass(item.category);

        // Source: link if URL is available, plain text otherwise
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
                    ${item.significance
                        ? `<p class="tl-significance">${escapeHTML(item.significance)}</p>`
                        : ''}
                    <p class="tl-source">Source: ${sourceHtml}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render an array of timeline items
     * @param {Object[]} items
     * @returns {string}
     */
    function renderTimeline(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return '<p class="error-message">⚠️ No timeline items to display.</p>';
        }
        return items.map(item => renderTimelineItem(item)).join('');
    }

    /**
     * Render statistics as stat-card elements
     * @param {Object[]} items
     * @returns {string}
     */
    function renderStatistics(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return '<p class="error-message">⚠️ No statistics available.</p>';
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

    /**
     * Render milestone items (uses same styling as timeline items)
     * @param {Object[]} items
     * @returns {string}
     */
    function renderMilestones(items) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return '<p class="error-message">⚠️ No milestones available.</p>';
        }
        return items.map(m => `
            <div class="timeline-item">
                <div class="timeline-year">${escapeHTML(String(m.year))}</div>
                <div class="timeline-content">
                    <h4>${escapeHTML(m.icon || '✦')} ${escapeHTML(m.title)}</h4>
                    <p>${escapeHTML(m.summary || '')}</p>
                </div>
            </div>
        `).join('');
    }

    // --- Expose globally ---
    window.renderTimeline = renderTimeline;
    window.renderTimelineItem = renderTimelineItem;
    window.renderStatistics = renderStatistics;
    window.renderMilestones = renderMilestones;

    console.log('✅ Renderer (custom template engine) loaded');
})();