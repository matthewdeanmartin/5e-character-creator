const go = new Go(); 

WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
    // Start the Go main() function inside the Wasm instance
    go.run(result.instance);
    console.log("Wasm module loaded and Go main() has been run.");
    // Enable the character creation entrypoint now that Wasm has loaded
    document.querySelector('#createCharacterBtn').disabled = false;
});

// Ease-of-access element references
const mainModal = document.querySelector("#mainModal");
const createCharButton = document.querySelector('#createCharacterBtn');

const creationModal = document.querySelector('#creationModal');
const raceSelect = document.querySelector("#charRace");
const cancelButton = document.querySelector("#cancelBtn");

/**
 * 
 * @param {HTMLSelectElement} selectElement 
 * @param {Array<Object>} data 
 */
function insertDataIntoDropdown(selectElement, data) {
    // Clear dropdown
    selectElement.innerHTML = '';

    data.forEach(entry => {
        const currentOption = document.createElement('option');
        currentOption.value = entry.name;
        currentOption.text = entry.name;
        selectElement.add(currentOption);
    });
}

// Wait for the Wasm module to be ready before setting up event listeners
window.addEventListener('load', () => {
    // Will enable this once WebAssembly loads successfully
    createCharButton.disabled = true;

    createCharButton.addEventListener('click', () => {
        // Fetch the initial character creation data from Go
        const jsonDataString = fetchInitialCharData();
        const initialCharData = JSON.parse(jsonDataString);
        // Populate the Race dropdown with data from Go
        insertDataIntoDropdown(raceSelect, initialCharData.races);

        // Stop displaying the main modal
        mainModal.classList.remove("visible");
        mainModal.classList.add("invisible");
        // Start displaying the initial character creation modal
        creationModal.classList.remove("invisible");
        creationModal.classList.add("visible");
    });

    cancelButton.addEventListener('click', () => {
        // Stop displaying the initial character creation modal
        creationModal.classList.remove("visible");
        creationModal.classList.add("invisible");
        // Start displaying the main modal
        mainModal.classList.remove("invisible");
        mainModal.classList.add("visible");
    });
});