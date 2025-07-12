// js/main.js
import { CACHE_KEY, fetchFromAPI, clearCache as clearApiCache } from './spells_api.js';
import { renderSpells, updateStatus, renderError, clearResults } from './spells_render.js';

const SPELL_SELECT_CACHE_KEY = 'dnd_selected_spells_cache';

// --- DOM Elements ---
const schoolFilter = document.getElementById('school-filter');
const startLevelFilter = document.getElementById('start-level-filter');
const endLevelFilter = document.getElementById('end-level-filter');
const fetchBtn = document.getElementById('fetch-spells-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const doneSelectingBtn = document.getElementById('done-btn');

function onSpellSelect(spell, isChecked) {
    // Fetch current list of selected spells
    const selectedSpellsJson = localStorage.getItem(SPELL_SELECT_CACHE_KEY);
    let selectedSpells = JSON.parse(selectedSpellsJson ?? "[]");

    // Add or remove the current spell, depending on whether it was checked or unchecked
    if (isChecked) {
        selectedSpells.push(spell);
    }
    else {
        // Find the spell, and remove it
        const removedSpellInd = selectedSpells.indexOf(spell);
        if (removedSpellInd > -1) {
            selectedSpells.splice(removedSpellInd, 1);
        }
    }

    // Update the list of selected spells
    localStorage.setItem(SPELL_SELECT_CACHE_KEY, JSON.stringify(selectedSpells));
}

/**
 * Main function to fetch and display spells. It orchestrates the API and UI modules.
 */
async function handleFetchSpells() {
    const minLevel = parseInt(startLevelFilter.value, 10);
    const maxLevel = parseInt(endLevelFilter.value, 10);
    let levels = [];

    if (!isNaN(minLevel)) {
        // If max level is also a valid number and is greater than or equal to min level, create a range.
        if (!isNaN(maxLevel) && maxLevel >= minLevel) {
            for (let level = minLevel; level <= maxLevel; level++) {
                levels.push(level);
            }
        } else {
            // Otherwise, just use the min level.
            levels.push(minLevel);
        }
    }

    const schools = [];
    if (schoolFilter.value) {
        schools.push(schoolFilter.value);
    }

    updateStatus('Fetching spells...');

    let allSpells = localStorage.getItem(CACHE_KEY);

    if (allSpells) {
        // If cache exists, parse it and use it.
        updateStatus('Filtering spells from local cache...');
        allSpells = JSON.parse(allSpells);
    } else {
        // If no cache, fetch from the API.
        updateStatus('No local cache found. Fetching from API...');

        // Make sure the user can't click fetch button again until done fetching spells
        let fetchButtonEl = document.getElementById('fetch-spells-btn');
        fetchButtonEl.disabled = true;
        fetchButtonEl.classList.add('opacity-50', 'cursor-not-allowed');

        updateStatus(`Fetching spells according to the user's request...`);

        allSpells = await fetchFromAPI(schools, levels);
        // Let the user click the fetch button again
        fetchButtonEl.disabled = false;
        fetchButtonEl.classList.remove('opacity-50', 'cursor-not-allowed');

        if (allSpells) {
            updateStatus(`Successfully fetched and cached ${allSpells.length} spells.`);
        } else {
            updateStatus('Error fetching spells from the API.');
            renderError();
            return;
        }
    }

    renderSpells(allSpells, onSpellSelect);
    updateStatus(`Displaying ${allSpells.length} spells based on filter inputs.`);
}

/**
 * Handles the cache clearing process.
 */
function handleClearCache() {
    clearApiCache();
    updateStatus('Local spell cache has been cleared.');
    clearResults();
}

function closePopup() {
    // Close the popup window
    window.close();
}

/**
 * Initializes the application by setting up event listeners and initial status.
 */
function initialize() {
    fetchBtn.addEventListener('click', handleFetchSpells);
    clearCacheBtn.addEventListener('click', handleClearCache);
    doneSelectingBtn.addEventListener('click', closePopup);

    if (localStorage.getItem(CACHE_KEY)) {
        updateStatus('A local spell cache is available. Filtering will be fast!');
    } else {
        updateStatus('No local cache found. Fetching spells will create one.');
    }
}

// --- Start the application ---
document.addEventListener('DOMContentLoaded', initialize);
