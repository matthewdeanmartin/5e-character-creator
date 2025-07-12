// Using a CORS proxy to bypass the browser's security policy.

const DND_5E_API_URL = 'https://www.dnd5eapi.co',
    SPELLS_BASE_URL = 'https://www.dnd5eapi.co/api/2014/spells';

export const CACHE_KEY = 'dnd_all_spells_cache';

/**
 * Fetches spell data from the 5e-bits API.
 * Caches the full list if it's the first time fetching all spells.
 * @returns {Array} The complete list of all spells.
 */
export async function fetchFromAPI(schools=[], levels=[]) {
    let fetchUrl = SPELLS_BASE_URL;

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
        fetchUrl = `${fetchUrl}?${queryParams.join('&')}`;
    }
    
    console.log(`Fetching from: ${fetchUrl}`);

    try {
        const response = await fetch(fetchUrl);
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseJson = await response.json();
        // Extract spells from the response JSON
        const spellIndices = responseJson.results;

        // Fetch 10 spell details at a time
        const batchSize = 10;
        // Wait a quarter of a second
        const delayMs = 250;

        let spells = []
        for (let batchInd = 0; batchInd < spellIndices.length; batchInd += batchSize) {
            const batch = spellIndices.slice(batchInd, batchInd + batchSize);
            // Build batch of Promises to fetch some spell details
            const promises =
                batch.map((spellIndex) =>
                    fetch(DND_5E_API_URL + spellIndex.url).then((response) => response.json())
                );
            // Await current batch of spell details
            const batchSpells = await Promise.all(promises);
            spells.push(...batchSpells);
            // Wait for a little before requesting another batch of spell details
            if (batchInd + batchSize < spellIndices.length) {
                await new Promise(waitResponse => setTimeout(waitResponse, delayMs));
            }
        }

        // Only save if we fetched all spells
        if (queryParams.length === 0) {
            localStorage.setItem(CACHE_KEY, spells);
        }
        
        return spells;
    } catch (error) {
        console.error("Failed to fetch spells:", error);
        // Return a structured error object
        return { error: true, message: error.message, results: [] };
    }
}

/**
 * Clears the spell data from localStorage.
 */
export function clearCache() {
    localStorage.removeItem(CACHE_KEY);
}
