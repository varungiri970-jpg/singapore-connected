/* ============================================================
   APP — Main Orchestrator
   Fetches JSON, validates, renders with custom template engine
   Singapore Connected — Premium Red & White Theme
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // PAGE DETECTION
    // ============================================================

    /**
     * Get current page name from URL.
     * Defined here as a fallback in case router.js hasn't run yet,
     * since both scripts listen to DOMContentLoaded and order isn't guaranteed.
     * @returns {string} 'home' | 'origins' | 'growth' | 'smart-nation' | 'timeline'
     */
    function getPage() {
        const path = window.location.pathname;

        // Check for specific page names in the URL path
        if (path.includes('origins'))      return 'origins';
        if (path.includes('growth'))       return 'growth';
        if (path.includes('smart-nation')) return 'smart-nation';
        if (path.includes('timeline'))     return 'timeline';

        // Default to home page
        return 'home';
    }

    // ============================================================
    // DATA FETCHING
    // ============================================================

    /**
     * Fetch JSON data with error handling
     * @param {string} url - Path to JSON file
     * @returns {Promise<Object|null>} Parsed JSON or null on error
     */
    async function fetchJSON(url) {
        try {
            const response = await fetch(url);

            // Check if response is OK (status 200-299)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ Failed to fetch ${url}:`, error.message);
            return null;
        }
    }

    // ============================================================
    // TIMELINE RENDERING
    // ============================================================

    /**
     * Render timeline section — used on home (preview) and all inner pages
     * @param {HTMLElement} container - Where to inject HTML
     * @param {number|null} limit - Max items for preview (null = show all)
     */
    async function renderTimelineSection(container, limit) {
        // Exit if container doesn't exist
        if (!container) {
            console.warn('⚠️ Timeline container not found on this page.');
            return;
        }

        // Fetch timeline data
        const data = await fetchJSON('data/timeline.json');

        // Handle fetch errors
        if (!data || !Array.isArray(data.timeline)) {
            container.innerHTML = `
                <p class="error-message">
                    ⚠️ Timeline data could not be loaded. Please check your connection.
                </p>
            `;
            return;
        }

        // Validate timeline data before rendering
        const validationResult = window.validateTimelineData(data.timeline);

        if (!validationResult.valid) {
            console.warn('⚠️ Timeline validation warnings:', validationResult.errors);
        } else {
            console.log(`✅ Timeline validation passed (${validationResult.count} items)`);
        }

        // Determine which page we're on
        const page = getPage();

        // Copy timeline items so we don't mutate the original
        let items = [...data.timeline];

        // Filter by page for inner pages (not home, not full timeline)
        if (page !== 'home' && page !== 'timeline') {
            items = items.filter(item => item.page === page);

            console.log(`📋 Filtered to ${items.length} items for "${page}" page`);
        }

        // Sort items by year (ascending)
        items.sort((a, b) => a.year - b.year);

        // For home preview: pick a balanced cross-era selection
        if (limit && items.length > limit) {
            // Key milestone years for a balanced preview
            const previewYears = [
                1981, // NCB Established
                1987, // NUS BITNET
                1994, // SingNet
                1997, // Singapore ONE
                2006, // Wireless@SG
                2014, // Smart Nation
                2024  // Smart Nation 2.0
            ];

            // First, try to get items from the preview years
            const preview = items.filter(item => previewYears.includes(item.year));

            // If we have enough from the preferred years, use those; otherwise fallback to first N
            items = preview.length >= limit ? preview.slice(0, limit) : items.slice(0, limit);
        }

        // Handle empty results
        if (items.length === 0) {
            container.innerHTML = `
                <p class="error-message">
                    ⚠️ No timeline items found for this page.
                </p>
            `;
            return;
        }

        // Render using the custom template engine
        container.innerHTML = window.renderTimeline(items);

        console.log(`✅ Rendered ${items.length} timeline items on "${page}" page`);
    }

    // ============================================================
    // STATISTICS RENDERING
    // ============================================================

    /**
     * Render statistics grid (homepage only)
     * @param {HTMLElement} container - Where to inject HTML
     */
    async function renderStatisticsSection(container) {
        // Exit if container doesn't exist
        if (!container) {
            console.warn('⚠️ Statistics container not found on this page.');
            return;
        }

        // Fetch statistics data
        const data = await fetchJSON('data/statistics.json');

        // Handle fetch errors
        if (!data || !Array.isArray(data.statistics) || data.statistics.length === 0) {
            container.innerHTML = `
                <p class="error-message">
                    ⚠️ Statistics data could not be loaded.
                </p>
            `;
            return;
        }

        // Validate statistics data
        const validationResult = window.validateStatisticsData(data.statistics);

        if (!validationResult.valid) {
            console.warn('⚠️ Statistics validation warnings:', validationResult.errors);
        } else {
            console.log(`✅ Statistics validation passed (${data.statistics.length} items)`);
        }

        // Render using the custom template engine
        container.innerHTML = window.renderStatistics(data.statistics);

        console.log(`✅ Rendered ${data.statistics.length} statistics items`);
    }

    // ============================================================
    // MILESTONES RENDERING (Optional — for future use)
    // ============================================================

    /**
     * Render milestones (can be used on any page if needed)
     * @param {HTMLElement} container - Where to inject HTML
     */
    async function renderMilestonesSection(container) {
        if (!container) {
            console.warn('⚠️ Milestones container not found.');
            return;
        }

        const data = await fetchJSON('data/milestones.json');

        if (!data || !Array.isArray(data.milestones) || data.milestones.length === 0) {
            container.innerHTML = `
                <p class="error-message">
                    ⚠️ Milestones data could not be loaded.
                </p>
            `;
            return;
        }

        // Validate milestones
        const validationResult = window.validateMilestonesData(data.milestones);

        if (!validationResult.valid) {
            console.warn('⚠️ Milestones validation warnings:', validationResult.errors);
        }

        // Render using the custom template engine
        container.innerHTML = window.renderMilestones(data.milestones);
    }

    // ============================================================
    // APPLICATION INITIALISATION
    // ============================================================

    /**
     * Initialise the application when DOM is ready
     */
    function initApp() {
        const page = getPage();

        // Get DOM element references
        const timelinePreview = document.getElementById('timelinePreview');
        const timelineContainer = document.getElementById('timelineContainer');
        const statsContainer = document.getElementById('statsContainer');
        const milestonesContainer = document.getElementById('milestonesContainer');

        console.log(`🚀 Singapore Connected — "${page}" page initialised`);

        // Render appropriate content based on page
        if (page === 'home') {
            // Home page: show preview timeline (6 items) + statistics
            renderTimelineSection(timelinePreview, 6);
            renderStatisticsSection(statsContainer);

            console.log('📊 Home page: Timeline preview + Statistics loaded');

        } else if (page === 'timeline') {
            // Timeline page: show all events (no limit)
            renderTimelineSection(timelineContainer, null);

            console.log('📅 Timeline page: Full timeline loaded');

        } else {
            // Origins, Growth, Smart Nation pages: show filtered timeline
            renderTimelineSection(timelineContainer, null);

            console.log(`📄 ${page.charAt(0).toUpperCase() + page.slice(1)} page: Filtered timeline loaded`);
        }

        // Optionally render milestones if container exists (for future use)
        if (milestonesContainer) {
            renderMilestonesSection(milestonesContainer);
        }

        // Log template engine info
        console.log('📦 Template engine: Custom JavaScript renderer (renderer.js)');
        console.log(`📊 Data source: data/timeline.json`);
    }

    // ============================================================
    // START — Run on DOM Ready
    // ============================================================

    document.addEventListener('DOMContentLoaded', initApp);

    // Also support if DOM already loaded (edge case)
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initApp();
    }

})();