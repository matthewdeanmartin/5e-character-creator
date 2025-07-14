import { buildSrdApiUrl_spells } from './build_fetch_urls.js';
import { fetchIndicesFromUrl, batchFetchDetailsFromApi } from './fetch_from_url.js';

/**
 * Fetches spell data from the 5e-bits API.
 * Caches the full list if it's the first time fetching all spells.
 * @returns {Array} The complete list of all spells.
 */
export async function fetchSpellsByFilter(schools=[], levels=[], classes=[]) {
    const fetchUrl = buildSrdApiUrl_spells(schools, levels);
    
    console.log(`Fetching spells from: ${fetchUrl}`);

    try {
        const spellIndices = await fetchIndicesFromUrl(fetchUrl);
        // Extract spells from spell indices
        const spells = batchFetchDetailsFromApi(spellIndices);
     
        if (spells.length) {
            // Filter by classes able to cast the matching spells
            spells.filter(spell => {
                // Check if one of the requested classes can cast this spell
                const classCanCastThisSpell = spell.classes.some(spell => classes.includes(spell.name));
                return classCanCastThisSpell;
            });
        }
        
        return spells;
    } catch (error) {
        // Propagate error produced by fetchIndicesFromUrl
        return error;
    }
}