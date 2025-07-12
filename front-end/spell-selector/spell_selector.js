// js/main.js
import { fetchSpellsByFilter } from './spells_api.js';
import { renderSpells, updateStatus } from './spells_render.js';

const SPELL_SELECT_CACHE_KEY = 'dnd_selected_spells_cache';

// --- DOM Elements ---
const schoolDropdown = document.getElementById('school-filter');
const minLevelDropdown = document.getElementById('start-level-filter');
const maxLevelDropdown = document.getElementById('end-level-filter');
const fetchBtn = document.getElementById('fetch-spells-btn');
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
    // All spell levels will be fetched if this array remains empty
    let levels = [];

    const minLevel = parseInt(minLevelDropdown.value, 10);
    const maxLevel = parseInt(maxLevelDropdown.value, 10);
    if (!isNaN(minLevel)) {
        // If min & max levels are valid create a range
        if (!isNaN(maxLevel) && maxLevel >= minLevel) {
            for (let level = minLevel; level <= maxLevel; level++) {
                levels.push(level);
            }
        } else {
            // Otherwise, just use the min level
            levels.push(minLevel);
        }
    }

    // All spell schools will be fetched if this array remains empty
    const schools = [];
    if (schoolDropdown.value) {
        schools.push(schoolDropdown.value);
    }

    // Make sure the user can't click fetch button again until done fetching spells
    let fetchBtn = document.getElementById('fetch-spells-btn');
    fetchBtn.disabled = true;
    fetchBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    updateStatus('Fetching requested spells over D&D 5E SRD API...');

    const spellsResponse = await fetchSpellsByFilter(schools, levels);
    // Let the user click the fetch button again
    fetchBtn.disabled = false;
    fetchBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    // If error property is not present and the response is an array, it succeeded
    if (!spellsResponse.error && Array.isArray(spellsResponse)) {
        updateStatus(`Successfully fetched and cached ${spellsResponse.length} spells.`);
    } else {
        updateStatus('Error fetching spells from the API.');
        // The result is an error
        renderError(spellsResponse);
        return;
    }

    renderSpells(spellsResponse, onSpellSelect);
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
    doneSelectingBtn.addEventListener('click', closePopup);

    updateStatus('Please fetch spells to populate the spellbook!');
}

// --- Start the application ---
document.addEventListener('DOMContentLoaded', initialize);
