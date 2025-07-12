import { buildSrdApiUrl_spells } from "../srd-api/build_fetch_urls.js";
import { fetchFromUrl } from "../srd-api/fetch_from_url.js";

/**
 * Fetches spell data from the 5e-bits API.
 * Caches the full list if it's the first time fetching all spells.
 * @returns {Array} The complete list of all spells.
 */
export async function fetchSpellsByFilter(schools=[], levels=[]) {
    const fetchUrl = buildSrdApiUrl_spells(schools, levels);
    
    console.log(`Fetching spells from: ${fetchUrl}`);

    try {
        const responseJson = await fetchFromUrl(fetchUrl);
        // Extract spell indices from the response JSON
        const spellIndices = responseJson.results;
        // Extract spells from spell indices
        const spells = batchFetchFromApi(spellIndices);
        
        return spells;
    } catch (error) {
        console.error("Failed to fetch spells:", error);
        // Return a structured error object
        return { error: true, message: error.message };
    }
}