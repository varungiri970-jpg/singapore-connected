/* ============================================================
   VALIDATOR — JSON Data Validation
   Checks required fields, types, ranges, and URLs
   ============================================================ */

(function() {
    'use strict';

    // --- Validation Constants ---
    const VALID_CATEGORIES = ['Academic', 'Commercial', 'Government', 'Infrastructure'];
    const VALID_PAGES = ['origins', 'growth', 'smart-nation'];
    const YEAR_MIN = 1980;
    const YEAR_MAX = 2026;
    const MIN_DESCRIPTION_LENGTH = 10;
    const MIN_SIGNIFICANCE_LENGTH = 10;

    /**
     * Validate a single timeline item
     * @param {Object} item
     * @param {number} index
     * @returns {{ valid: boolean, errors: string[] }}
     */
    function validateTimelineItem(item, index) {
        const errors = [];
        const prefix = `Item ${index + 1}`;

        // Required fields — ALL must be present and non-empty
        const required = ['year', 'title', 'category', 'description', 'significance', 'source', 'page'];
        for (const field of required) {
            if (item[field] === undefined || item[field] === null || item[field] === '') {
                errors.push(`${prefix}: missing required field "${field}"`);
            }
        }

        // Year: must be a number in range
        if (item.year !== undefined && item.year !== null) {
            if (typeof item.year !== 'number') {
                errors.push(`${prefix}: "year" must be a number (got ${typeof item.year})`);
            } else if (item.year < YEAR_MIN || item.year > YEAR_MAX) {
                errors.push(`${prefix}: "year" must be between ${YEAR_MIN}–${YEAR_MAX} (got ${item.year})`);
            }
        }

        // Category: must be one of the valid values
        if (item.category && !VALID_CATEGORIES.includes(item.category)) {
            errors.push(`${prefix}: "category" must be one of: ${VALID_CATEGORIES.join(', ')} (got "${item.category}")`);
        }

        // Page: must be one of the valid pages
        if (item.page && !VALID_PAGES.includes(item.page)) {
            errors.push(`${prefix}: "page" must be one of: ${VALID_PAGES.join(', ')} (got "${item.page}")`);
        }

        // Description minimum length
        if (item.description && item.description.length < MIN_DESCRIPTION_LENGTH) {
            errors.push(`${prefix}: "description" too short (min ${MIN_DESCRIPTION_LENGTH} chars, got ${item.description.length})`);
        }

        // Significance minimum length
        if (item.significance && item.significance.length < MIN_SIGNIFICANCE_LENGTH) {
            errors.push(`${prefix}: "significance" too short (min ${MIN_SIGNIFICANCE_LENGTH} chars, got ${item.significance.length})`);
        }

        // sourceUrl: if present, must be a valid http/https URL
        if (item.sourceUrl) {
            try {
                const url = new URL(item.sourceUrl);
                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    errors.push(`${prefix}: "sourceUrl" must use http:// or https:// (got "${item.sourceUrl}")`);
                }
            } catch (_) {
                errors.push(`${prefix}: "sourceUrl" is not a valid URL (got "${item.sourceUrl}")`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Validate the full timeline array
     * @param {any} data
     * @returns {{ valid: boolean, errors: string[], count: number }}
     */
    function validateTimelineData(data) {
        if (!data || !Array.isArray(data)) {
            return { valid: false, errors: ['Data is not an array'], count: 0 };
        }
        if (data.length === 0) {
            return { valid: false, errors: ['Timeline array is empty'], count: 0 };
        }

        const allErrors = [];
        data.forEach((item, index) => {
            const result = validateTimelineItem(item, index);
            if (!result.valid) allErrors.push(...result.errors);
        });

        return { valid: allErrors.length === 0, errors: allErrors, count: data.length };
    }

    /**
     * Validate statistics array
     * @param {any} data
     * @returns {{ valid: boolean, errors: string[] }}
     */
    function validateStatisticsData(data) {
        const errors = [];

        if (!data || !Array.isArray(data)) {
            return { valid: false, errors: ['Statistics data is not an array'] };
        }
        if (data.length === 0) {
            return { valid: false, errors: ['Statistics array is empty'] };
        }

        data.forEach((item, index) => {
            const prefix = `Stat ${index + 1}`;
            if (!item.id)       errors.push(`${prefix}: missing "id"`);
            if (!item.label)    errors.push(`${prefix}: missing "label"`);
            if (!item.value)    errors.push(`${prefix}: missing "value"`);
            if (!item.year)     errors.push(`${prefix}: missing "year"`);
            if (!item.source)   errors.push(`${prefix}: missing "source"`);
            // Validate sourceUrl if present
            if (item.sourceUrl) {
                try {
                    new URL(item.sourceUrl);
                } catch (_) {
                    errors.push(`${prefix}: "sourceUrl" is not a valid URL`);
                }
            }
        });

        return { valid: errors.length === 0, errors };
    }

    /**
     * Validate milestones array
     * @param {any} data
     * @returns {{ valid: boolean, errors: string[] }}
     */
    function validateMilestonesData(data) {
        const errors = [];

        if (!data || !Array.isArray(data)) {
            return { valid: false, errors: ['Milestones data is not an array'] };
        }
        if (data.length === 0) {
            return { valid: false, errors: ['Milestones array is empty'] };
        }

        data.forEach((item, index) => {
            const prefix = `Milestone ${index + 1}`;
            if (!item.id)      errors.push(`${prefix}: missing "id"`);
            if (!item.year)    errors.push(`${prefix}: missing "year"`);
            if (!item.title)   errors.push(`${prefix}: missing "title"`);
            if (!item.summary) errors.push(`${prefix}: missing "summary"`);
            if (!item.page)    errors.push(`${prefix}: missing "page"`);
        });

        return { valid: errors.length === 0, errors };
    }

    // --- Expose Globally ---
    window.validateTimelineData = validateTimelineData;
    window.validateStatisticsData = validateStatisticsData;
    window.validateMilestonesData = validateMilestonesData;

    console.log('✅ Validator loaded');
    console.log(`   Valid categories: ${VALID_CATEGORIES.join(', ')}`);
    console.log(`   Valid pages:      ${VALID_PAGES.join(', ')}`);
    console.log(`   Year range:       ${YEAR_MIN}–${YEAR_MAX}`);
})();