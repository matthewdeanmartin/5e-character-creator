import { BASE_SRD_API_URL, SRD_API_CLASSES_URL, SRD_API_SPELLS_URL } from "./consts.js";

export function buildSrdApiUrl_spells(schools=[], levels=[]) {
    const queryParams = [];

    // Check if a 'levels' filter is provided and is a non-empty array.
    if (levels && Array.isArray(levels)) {
        if (levels.length === 1) {
            queryParams.push(`level=${levels[0]}`);
        }
        else if (levels.length > 1) {
            queryParams.push(`levels=${levels.join(',')}`);
        }
    }

    // Check if a 'schools' filter is provided and is a non-empty array.
    if (schools && Array.isArray(schools) && schools.length > 0) {
        // Note: The API expects the school name to be capitalized.
        queryParams.push(`school=${schools.join(',')}`);
    }

    // If there are any query parameters, join them with '&' and append to the base URL.
    if (queryParams.length > 0) {
        return `${BASE_SRD_API_URL}${SRD_API_SPELLS_URL}?${queryParams.join('&')}`;
    }
}

export function buildSrdApiUrl_class(dndClass="") {
    const classUrl = `/${dndClass}`;

    // Construct base URL for this class
    return `${BASE_SRD_API_URL}${SRD_API_CLASSES_URL}${classUrl}`;
}