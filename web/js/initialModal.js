let api; // To hold the functions and state passed from main.js
let dataLoaded = false;

// --- DOM Element References for Step 1 ---
const charNameInput = document.querySelector('#charName');
const raceSelect = document.querySelector('#charRace');
const subraceGroup = document.querySelector('#subrace-group');
const subraceSelect = document.querySelector('#charSubrace');
const classSelect = document.querySelector('#charClass');
const backgroundSelect = document.querySelector('#charBackground');

/**
 * Populates a dropdown with options from the API.
 */
function populateSelect(selectElement, options, placeholder) {
    selectElement.innerHTML = `<option value="">-- ${placeholder} --</option>`;
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.index;
        opt.textContent = option.name;
        selectElement.appendChild(opt);
    });
}

function findOptionValueByText(selectElement, text) {
    if (!text) return '';
    const option = Array.from(selectElement.options).find(opt => opt.text === text);
    return option ? option.value : '';
}

/**
 * Fetches and populates the initial dropdowns for races, classes, etc.
 */
async function setupInitialData() {
    try {
        // Use the function passed in via the 'api' object
        const data = await api.getInitialSetupData();
        populateSelect(raceSelect, data.races, 'Select a Race');
        populateSelect(classSelect, data.classes, 'Select a Class');
        populateSelect(backgroundSelect, data.backgrounds, 'Select a Background');
        dataLoaded = true;
    } catch (error) {
        console.error("Failed to get initial setup data:", error);
    }
}

/**
 * Fetches and populates the subrace dropdown based on the selected race.
 */
async function handleRaceChange(isUserChange = true) {
    const selectedRaceIndex = raceSelect.value;
    
    // Only reset the race & subrace info if this was caused by a user's change
    if (isUserChange) {
        api.currentCharacter.race = raceSelect.options[raceSelect.selectedIndex].text;
        api.currentCharacter.subrace = ""; // Reset subrace on change
    }

    if (!selectedRaceIndex) {
        subraceGroup.classList.add('hidden'); // Use class to hide
        subraceSelect.disabled = true;
        // Only update the header if this was caused by a user's change
        if (isUserChange) {
            api.updateSummaryHeader();
        }
        return;
    }

    try {
        const subraces = await api.getSubraces(selectedRaceIndex);
        
        // Correctly check if the returned array has items
        if (subraces && subraces.length > 0) {
            populateSelect(subraceSelect, subraces, 'Select a Subrace');
            subraceSelect.disabled = false;
            subraceGroup.classList.remove('hidden'); // Use class to show
        } else {
            subraceGroup.classList.add('hidden'); // Use class to hide
            subraceSelect.disabled = true;
        }
    } catch (error) {
        console.error("Failed to fetch subraces:", error);
        subraceGroup.classList.add('hidden'); // Use class to hide
        subraceSelect.disabled = true;
    }
    
    // Only update the header if this was caused by a user's change
    if (isUserChange) {
        api.updateSummaryHeader();
    }
}

/**
 * Initializes all logic for Step 1.
 * @param {object} apiObject - An object containing necessary functions and state from main.js
 */
export async function initStep1(apiObject) {
    api = apiObject; // Store the passed-in dependencies

    console.log("initStep1: Received API object. Character name is:", api.currentCharacter.name);

    // 1. Ensure dropdown data is loaded before continuing
    await setupInitialData();

    console.log("initStep1: setupInitialData() finished. Populating fields...");

    // 2. Populate fields from the saved character data (if present)
    charNameInput.value = api.currentCharacter.name || '';

    console.log(`initStep1: Set Character Name field to: '${charNameInput.value}'`);

    // Set the Race (find a value in saved character data)
    const raceIndex = findOptionValueByText(raceSelect, api.currentCharacter.race);
    if (raceIndex) {
        raceSelect.value = raceIndex;
        console.log(`initStep1: Set Race field to: '${raceSelect.value}'`);
        // If a race was loaded, we must load the subraces into the selector
        await handleRaceChange(false); // Don't reset state of race selection box
    }

        // Set Subrace (find a value in saved character data)
    const subraceIndex = findOptionValueByText(subraceSelect, api.currentCharacter.subrace);
    if (subraceIndex) {
        subraceSelect.value = subraceIndex;
        console.log(`initStep1: Set Subrace field to: '${subraceSelect.value}'`);
    }

    // Set Class (find a value in saved character data)
    const classIndex = findOptionValueByText(classSelect, api.currentCharacter.class);
    if (classIndex) {
        classSelect.value = classIndex;
        console.log(`initStep1: Set Class field to: '${subraceSelect.value}'`);
    }

    // Set Background (find a value in saved character data)
    const bgIndex = findOptionValueByText(backgroundSelect, api.currentCharacter.background);
    if (bgIndex) {
        backgroundSelect.value = bgIndex;
        console.log(`initStep1: Set Background field to: '${subraceSelect.value}'`);
    }

    // 3. Re-attach event listeners
    charNameInput.oninput = () => {
        api.currentCharacter.name = charNameInput.value;
        api.updateSummaryHeader();
    };

    raceSelect.onchange = () => handleRaceChange(true); // User-initiated change detected
    subraceSelect.onchange = () => {
        api.currentCharacter.subrace = subraceSelect.options[subraceSelect.selectedIndex].text;
        api.updateSummaryHeader();
    };
    classSelect.onchange = () => {
        api.currentCharacter.class = classSelect.options[classSelect.selectedIndex].text;
        api.updateSummaryHeader();
    };
    backgroundSelect.onchange = () => {
        api.currentCharacter.background = backgroundSelect.options[backgroundSelect.selectedIndex].text;
    };
}

