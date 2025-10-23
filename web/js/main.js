import { initStep1 } from './initialModal.js';
import { initStep2 } from './abilitiesModal.js';

// --- DOM Element References ---
const mainContainer = document.querySelector('.container');
const createButton = document.querySelector('#createCharacterBtn');
const editCharButton = document.querySelector('#editCharacterBtn');

const creatorModal = document.querySelector('#creatorModal');
const prevButton = document.querySelector('#prevBtn');
const nextButton = document.querySelector('#nextBtn');
const saveCharButton = document.querySelector('#saveBtn');
const loadCharButton = document.querySelector('#loadBtn');
const summaryName = document.querySelector('#summary-name');
const summaryRace = document.querySelector('#summary-race');
const summaryClass = document.querySelector('#summary-class');

// --- Application State ---
let currentStep = 1;
const totalSteps = 2;
let currentCharacter = {};

// --- Wasm Initialization ---

// 1. Define the callback function that Go will call when it's ready.
window.goWasmReady = () => {
    console.log("Go Wasm is ready and has exported its functions.");
    // 2. Enable the button ONLY when Go says it's ready.
    createButton.disabled = false;
    createButton.textContent = 'Create New Character';

    // Check if there's a saved character
    if (window.loadCharacter()) {
        editCharButton.disabled = false;
        editCharButton.textContent = 'Edit Existing Character';
    } else {
        editCharButton.textContent = 'No Saved Character';
    }
};

const go = new Go();
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
    console.log("Wasm module instantiated. Scheduling Go's main() function to run.");

    // Run Go's main function in a timeout. This is the critical change.
    // It frees the JS event loop, allowing Go to make calls back into JS (like js.Global().Set)
    // without causing a deadlock.
    setTimeout(() => {
        go.run(result.instance);
    }, 0);
 
    console.log("Wasm module instantiated. Go is now running its main() function.");
});

// --- Functions ---

/**
 * Resets the character state to its default values.
 */
function resetCharacterState() {
    currentCharacter = {
        name: "",
        race: "",
        subrace: "",
        class: "",
        background: "",
        abilityScores: {
            // Base score for Point Buy is 8
            str: 8, dex: 8, con: 8,
            int: 8, wis: 8, cha: 8,
        }
    };
    currentStep = 1;
}

/**
 * Updates the summary header with the latest character data.
 */
export function updateSummaryHeader() {
    summaryName.textContent = currentCharacter.name || "N/A";
    summaryRace.textContent = currentCharacter.race || "N/A";
    summaryClass.textContent = currentCharacter.class || "N/A";
}

/**
 * Controls which creator step is visible and updates navigation buttons.
 */
async function renderCurrentStep() {
    // Make all steps hidden
    document.querySelectorAll('.creator-step').forEach(step => {
        step.classList.remove('is-visible');
        step.classList.add('hidden');
    });

    // Make the current step visible
    const currentStepElement = document.querySelector(`#step-${currentStep}`);
    if (currentStepElement) {
        currentStepElement.classList.remove('hidden');
        currentStepElement.classList.add('is-visible');;
    }

    // Pass the necessary Go functions and state down to the step's initializer
    if (currentStep === 1) {
        const apiForStep1 = {
            getInitialSetupData: window.getInitialSetupData,
            getSubraces: window.getSubraces,
            currentCharacter: currentCharacter,
            updateSummaryHeader: updateSummaryHeader,
        };

        // Log the object to the console to inspect it
        console.log("Passing this API object to initStep1:", apiForStep1);

        if (typeof initStep1 !== 'function') {
            console.error("DEBUG ERROR: initStep1 is not a function! Check the import from './initialModal.js'.");
            return; // Stop execution to prevent further errors
        }

        // Wait for initStep1 (and its internal API calls) to finish before continuing
        try {
            await initStep1(apiForStep1);
            console.log("renderCurrentStep: initStep1() has finished."); // Added this log
        } catch (error) {
            console.error("Error *during* initStep1 execution:", error);
        }
    } else if (currentStep === 2) {
        initStep2({
            calculateModifier: window.calculateModifier,
            getPointBuyCost: window.getPointBuyCost,
            getPointBuyCostDelta: window.getPointBuyCostDelta,
            currentCharacter: currentCharacter,
        });
    }

    prevButton.disabled = currentStep === 1;
    nextButton.disabled = currentStep === totalSteps;

    updateSummaryHeader();
}

async function loadCharacterData() {
    const charJSON = window.loadCharacter(); // Call Go function
    if (!charJSON) {
        console.log("No saved character found."); // You could show a message here
        return;
    }

    try {
        currentCharacter = JSON.parse(charJSON);
        
        console.log("loadCharacterData: Successfully parsed data from localStorage:", currentCharacter);

        // Open modal and go to step 1
        mainContainer.classList.remove('is-visible');
        mainContainer.classList.add('hidden');
        creatorModal.classList.remove('hidden');
        creatorModal.classList.add('is-visible');
        
        currentStep = 1; 
        // This will call initStep1, which now populates the fields
        await renderCurrentStep(); 

    } catch (error) {
        console.error("Failed to parse saved character:", error);
    }
}

// --- Event Listeners Setup ---
// Set initial button state immediately
createButton.disabled = true;
createButton.textContent = 'Loading Engine...';

editCharButton.disabled = true;
editCharButton.textContent = 'Loading...';

createButton.addEventListener('click', async () => {
    resetCharacterState();
    await renderCurrentStep();
    // Hide the main page
    mainContainer.classList.remove('is-visible');
    mainContainer.classList.add('hidden');
    // Open the initial creator page
    creatorModal.classList.remove('hidden');
    creatorModal.classList.add('is-visible');

    updateSummaryHeader();
});

editCharButton.addEventListener('click', async () => {
    await loadCharacterData();
});

nextButton.addEventListener('click', async () => {
    if (currentStep < totalSteps) {
        currentStep++;
        await renderCurrentStep();
    }
});

prevButton.addEventListener('click', async () => {
    if (currentStep > 1) {
        currentStep--;
        await renderCurrentStep();
    }
});

saveCharButton.addEventListener('click', () => {
    // The saveCharacter function is on the global scope
    window.saveCharacter(JSON.stringify(currentCharacter));

    // Check that we can load the newly saved character; turn on the edit button
    if (window.loadCharacter()) {
        editCharButton.disabled = false;
        editCharButton.textContent = 'Edit Existing Character';
    }
});

loadCharButton.addEventListener('click', async () => {
    await loadCharacterData();
});

// Close modal if clicking on the overlay
creatorModal.addEventListener('click', (event) => {
    if (event.target === creatorModal) {
        creatorModal.classList.remove('is-visible');
        mainContainer.classList.remove('hidden');
    }
});