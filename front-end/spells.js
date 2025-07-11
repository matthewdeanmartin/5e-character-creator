
import { CLASSES, SPELL_SCHOOL_FILTERS, SPELL_LEVEL_FILTERS } from './consts.js';

// Cache DOM elements for the spell section
const spellBox = document.getElementById('spell-box');
const classFilter = document.getElementById('spell-class-filter');
const schoolFilter = document.getElementById('spell-school-filter');
const levelFilter = document.getElementById('spell-level-filter');
const spellList = document.getElementById('spell-list');
const loadingIndicator = document.getElementById('wasm-loading');

export async function initializeSpells() {
    if (!WebAssembly) {
        console.error("WebAssembly is not supported in this browser.");
        loadingIndicator.textContent = "WebAssembly not supported!";
        return;
    }

    // Load the WebAssembly module
    const go = new Go();
    try {
        const result = await WebAssembly.instantiateStreaming(fetch("../back-end/main.wasm"), go.importObject);
        go.run(result.instance);
        loadingIndicator.style.display = 'none'; // Hide loading indicator
        spellBox.style.display = 'block'; // Show spell filters
    } catch (error) {
        console.error("Error loading Wasm module:", error);
        loadingIndicator.textContent = "Failed to load spellbook.";
        return;
    }
    
    // Populate filter dropdowns
    populateFilters();
    
    // Add event listeners to filters
    classFilter.addEventListener('change', updateSpellList);
    schoolFilter.addEventListener('change', updateSpellList);
    levelFilter.addEventListener('change', updateSpellList);

    // Initial population of the spell list
    updateSpellList();
}

function populateFilters() {
    CLASSES.forEach(classValue => {
        classFilter.add(new Option(classValue, classValue));
    });
    classFilter.add(new Option("All Classes", "All"), 0);
    classFilter.value = "All";

    SPELL_SCHOOL_FILTERS.forEach(schoolOption => schoolFilter.add(
        new Option(schoolOption === "All" ? "All Schools" : `${schoolOption} School`, schoolOption))
    );
    SPELL_LEVEL_FILTERS.forEach(levelOption => levelFilter.add(
        new Option(levelOption === "All" ? "All Levels" : `Level ${levelOption}`, levelOption))
    );
}

function updateSpellList() {
    const selectedClass = classFilter.value;
    const selectedSchool = schoolFilter.value;
    const selectedLevel = levelFilter.value === "All" ? -1 : parseInt(levelFilter.value);

    // Call the Go function exported to the global scope
    const spellsJson = filterSpells(selectedClass, selectedSchool, selectedLevel);
    const spells = JSON.parse(spellsJson);

    renderSpells(spells);
}

function renderSpells(spells) {
    spellList.innerHTML = ''; // Clear the list

    if (spells.length === 0) {
        spellList.innerHTML = '<div class="spell-item">No spells match the current filters.</div>';
        return;
    }

    spells.forEach(spell => {
        const spellItem = document.createElement('div');
        spellItem.className = 'spell-item';
        spellItem.innerHTML = `
            <div class="spell-header">
                <strong>${spell.name}</strong>
                <em>Level ${spell.level} ${spell.school} (${spell.classes.join(", ")})</em>
                <em>Casting Time: ${spell.castingTime}</em>
                <em>Range: ${spell.range}</em>
                <em>Duration: ${spell.duration}</em>
            </div>
            <p>${spell.description}</p>
        `;
        spellList.appendChild(spellItem);
    });
}
