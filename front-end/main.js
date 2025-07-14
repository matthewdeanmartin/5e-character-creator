// main.js
// This is the primary script that initializes all the interactive components of the character sheet.

import { initWeaponSelection } from './weapon-selection.js';
import { generateSpellTables } from './spellcasting-section.js';
import { batchFetchDetailsFromApi, fetchIndicesFromUrl } from './srd-api/fetch_from_url.js';
import { BASE_SRD_API_URL, SRD_API_CLASSES_URL, SRD_API_RACES_URL } from './srd-api/consts.js';

async function populateClassDropdown() {
    const classDropdown = document.getElementById('class');
    if (!classDropdown) return;

    const classesUrl = `${BASE_SRD_API_URL}${SRD_API_CLASSES_URL}`;
    const classIndices = await fetchIndicesFromUrl(classesUrl);
    const classDetailsResponses = await batchFetchDetailsFromApi(classIndices);

    // Add all classes from SRD to the class dropdown
    classDetailsResponses.forEach(classDetails => {
        const classOption = new Option(classDetails.name, classDetails.index);
        classDropdown.appendChild(classOption);
    });
}

async function populateRaceDropdown() {
    const raceDropdown = document.getElementById('race');
    if (!raceDropdown) return;

    const racesUrl = `${BASE_SRD_API_URL}${SRD_API_RACES_URL}`;
    const raceIndices = await fetchIndicesFromUrl(racesUrl);
    const raceDetailsResponses = await batchFetchDetailsFromApi(raceIndices);

    // Add all races from SRD to the race dropdown
    raceDetailsResponses.forEach(raceDetails => {
        const raceOption = new Option(raceDetails.name, raceDetails.index);
        raceDropdown.appendChild(raceOption);
    });
}

async function populateLevelDropdown() {
    const levelDropdown = document.getElementById('level');
    if (!levelDropdown) return;

    // Add Levels 1 thru 20 to the level dropdown
    for (let level = 1; level <= 20; level++) {
        const levelOption = new Option(`${level}`, level);
        levelDropdown.appendChild(levelOption);
    }
}

// Wait until the entire HTML document is loaded and parsed before running the scripts.
document.addEventListener('DOMContentLoaded', async () => {
    await populateClassDropdown();
    await populateRaceDropdown();
    await populateLevelDropdown();
    
    // Initialize the weapon selection modal functionality.
    initWeaponSelection();

    // Generate the spellcasting tables and set up their interactive elements.
    await generateSpellTables();
});
