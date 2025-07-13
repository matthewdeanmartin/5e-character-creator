import { BASE_SRD_API_URL, 
    SRD_API_CLASSES_URL, 
    SRD_API_RACES_URL,
    SRD_API_ALIGNMENTS_URL,
    SRD_API_BACKGROUNDS_URL,
    SRD_API_SUBCLASSES_URL,
    SRD_API_SUBRACES_URL
 } from './srd-api/consts.js';

import { updateProficiencyBonus } from './skills.js'

import { EXPERIENCE_TOTALS_BY_LEVEL } from './consts.js';

import { fetchIndicesFromUrl } from './srd-api/fetch_from_url.js';

const classDropdown = document.getElementById('class-dropdown');
const raceDropdown = document.getElementById('race-dropdown');
const levelDropdown = document.getElementById('level-dropdown');
const alignmentDropdown = document.getElementById('alignment-dropdown');
const backgroundDropdown = document.getElementById('background-dropdown');
const experienceInput = document.getElementById('experience-number');

export async function initializeCharacterBox() {
    await populateDropdowns();
    bindCharacterEvents();
}

function bindCharacterEvents() {
    levelDropdown.addEventListener('change', (event) => {
        const newLevel = parseInt(event.target.value);
        // Find the minimum experience total associated with the new level
        const minExperienceForLevel = EXPERIENCE_TOTALS_BY_LEVEL.find(expObj => expObj.level === newLevel).expPoints;
        experienceInput.value = minExperienceForLevel;
        updateProficiencyBonus(newLevel);
    });
}

async function fetchApiResponses() {
    const classUrl = `${BASE_SRD_API_URL}${SRD_API_CLASSES_URL}`;
    const raceUrl = `${BASE_SRD_API_URL}${SRD_API_RACES_URL}`;
    const alignmentUrl = `${BASE_SRD_API_URL}${SRD_API_ALIGNMENTS_URL}`;
    const backgroundUrl = `${BASE_SRD_API_URL}${SRD_API_BACKGROUNDS_URL}`;

    const classesResponse = await fetchIndicesFromUrl(classUrl);
    const racesResponse = await fetchIndicesFromUrl(raceUrl);
    const alignmentResponse = await fetchIndicesFromUrl(alignmentUrl);
    const backgroundResponse = await fetchIndicesFromUrl(backgroundUrl);

    // Validate classes response
    if (!classesResponse.error && Array.isArray(classesResponse)) {
        console.log(`Successfully fetched ${classesResponse.length} classes.`);
    } else {
        console.log('Error fetching classes from the D&D 5E SRD API.');
    }

    // Validate races response
    if (!racesResponse.error && Array.isArray(racesResponse)) {
        console.log(`Successfully fetched ${racesResponse.length} races.`);
    } else {
        console.log('Error fetching races from the D&D 5E SRD API.');
    }

    // Validate alignments response
    if (!alignmentResponse.error && Array.isArray(alignmentResponse)) {
        console.log(`Successfully fetched ${alignmentResponse.length} alignments.`);
    } else {
        console.log('Error fetching alignments from the D&D 5E SRD API.');
    }

    // Validate backgrounds response
    if (!backgroundResponse.error && Array.isArray(backgroundResponse)) {
        console.log(`Successfully fetched ${backgroundResponse.length} backgrounds.`);
    } else {
        console.log('Error fetching backgrounds from the D&D 5E SRD API.');
    }

    return {
        classIndices: classesResponse,
        raceIndices: racesResponse,
        alignmentIndices: alignmentResponse,
        backgroundIndices: backgroundResponse
    };
}

async function populateDropdowns() {
    const resultIndexLists = await fetchApiResponses();

    // Add class options in the dropdown (from SRD)
    resultIndexLists.classIndices.forEach(classIndex => {
        const classOption = new Option(classIndex.name, classIndex.index);
        classDropdown.add(classOption);
    });

    // Add race options in the dropdown (from SRD)
    resultIndexLists.raceIndices.forEach(raceIndex => {
        const raceOption = new Option(raceIndex.name, raceIndex.index);
        raceDropdown.add(raceOption);
    });

    // Add alignment options in the dropdown (from SRD)
    resultIndexLists.alignmentIndices.forEach(alignmentIndex => {
        const alignmentOption = new Option(alignmentIndex.name, alignmentIndex.index);
        alignmentDropdown.add(alignmentOption);
    });

    // Add background options in the dropdown (from SRD)
    resultIndexLists.backgroundIndices.forEach(backgroundIndex => {
        const backgroundOption = new Option(backgroundIndex.name, backgroundIndex.index);
        backgroundDropdown.add(backgroundOption);
    });

    // Maximum level for player characters is 20
    const maxLevel = 20;
    // Add level option for all possible player character levels
    for (let level = 1; level <= maxLevel; level++) {
        const levelOption = new Option(`Level ${level}`, level);
        levelDropdown.add(levelOption);
    }
}
