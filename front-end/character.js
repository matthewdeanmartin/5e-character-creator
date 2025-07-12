import { BASE_SRD_API_URL, SRD_API_CLASSES_URL, SRD_API_RACES_URL } from './srd-api/consts.js';
import { fetchFromUrl } from './srd-api/fetch_from_url.js';

const classDropdown = document.getElementById('class-dropdown');
const raceDropdown = document.getElementById('race-dropdown');


export async function initializeCharacterBox() {
    await populateDropdowns();
}

async function fetchIndexResponse(fetchUrl) {
    console.log(`Fetching indices from: ${fetchUrl}`);

    try {
        const responseJson = await fetchFromUrl(fetchUrl);
        // Extract class indices from the response JSON
        const classIndices = responseJson.results;

        return classIndices;
    } catch (error) {
        console.error("Failed to fetch indices:", error);
        // Return a structured error object
        return { error: true, message: error.message };
    }
}

async function populateDropdowns() {
    const classUrl = `${BASE_SRD_API_URL}${SRD_API_CLASSES_URL}`;
    const raceUrl = `${BASE_SRD_API_URL}${SRD_API_RACES_URL}`;

    const classesResponse = await fetchIndexResponse(classUrl);
    const racesResponse = await fetchIndexResponse(raceUrl);

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

    classesResponse.forEach(classIndex => {
        const classOption = new Option(classIndex.name, classIndex.index);
        classDropdown.add(classOption);
    });

    racesResponse.forEach(raceIndex => {
        const raceOption = new Option(raceIndex.name, raceIndex.index);
        raceDropdown.add(raceOption);
    });
}
