const allResultsContainer = document.getElementById('all-results-container');
const statusDiv = document.getElementById('status');
const CACHE_KEY = 'dnd_all_spells_cache';

/**
 * Renders the list of spells to the page.
 * @param {Array} spells - An array of spell objects.
 * @param {Function} onSpellSelect - Callback function for when a spell's checkbox is changed.
 */
export function renderSpells(spells, onSpellSelect) {
    allResultsContainer.innerHTML = ''; // Clear previous results
    statusDiv.innerHTML = ''; // Clear status (only relevant when fetching results)
    const selectedSpells = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    const selectedSpellNames = new Set(selectedSpells.map(s => s.name));

    if (!spells || spells.length === 0) {
        resultsContainer.innerHTML = '<label class="label-style">No spells match your criteria.</p>';
        return;
    }

    spells.forEach(spell => {
        const spellCard = document.createElement('div');
        spellCard.className = 'row-form-element-container-rigid';
        const isChecked = selectedSpellNames.has(spell.name);

        let componentsHtml = "";
        if (spell.components && spell.components.length > 0) {
            componentsHtml = `<strong>Components:</strong><em> ${spell.components.join(", ")}</em>`;
            if (spell.materials) {
                componentsHtml = `<strong>Components:</strong><em> ${spell.components.join(", ")} (${spell.materials})</em>`;
            }
        }
        let durationHtml = "";
        if (spell.duration) {
            durationHtml = `<strong>Duration:</strong><em>  ${spell.duration}</em>`;
        }
        let descriptionAddonHtml = "";
        if (spell.level > 0 && spell.higher_level && spell.higher_level.length > 0) {
            descriptionAddonHtml = `<strong>Cantrip Upgrade:</strong><em> ${spell.higher_level.join("\n")}</em>`;
        }
        else {
            descriptionAddonHtml = `<strong>Higher Level:</strong><em> ${spell.desc.at(-1)}</em>`;
        }

        spellCard.innerHTML = `
            <div>
                <input type="checkbox" class="checkbox-style" ${isChecked ? 'checked' : ''}>
            </div>
            <div class="spell-item">
                <div class="spell-header">
                    <strong>${spell.name}</strong>
                    <em>Level ${spell.level} ${spell.school.name} (${spell.classes.map(dndClass => dndClass.name).join(", ")})<em>
                </div>
                <strong>Casting Time:</strong><em> ${spell.casting_time}</em>
                ${componentsHtml}
                ${durationHtml}
                <p>${spell.level === 0 ? spell.desc.slice(0, -1).join("\n") : spell.desc.join("\n")}</p>
                ${descriptionAddonHtml}
            </div>
        `;
        
        const checkbox = spellCard.querySelector('.checkbox-style');
        checkbox.addEventListener('change', (event) => {
            onSpellSelect(spell, event.target.checked);
        });

        allResultsContainer.appendChild(spellCard);
    });
}

/**
 * Updates the status message displayed to the user.
 * @param {string} message - The message to display.
 */
export function updateStatus(message) {
    statusDiv.textContent = message;
}

/**
 * Renders an error message in the results container.
 */
export function renderError() {
    resultsContainer.innerHTML = `
        <div class="class="spell-item"" role="alert">
            <strong>Error:</strong>
            <span class="block sm:inline">Could not retrieve spell data. Please try again later.</span>
        </div>
    `;
}

/**
 * Clears the spell results from the page.
 */
export function clearResults() {
    resultsContainer.innerHTML = '';
}
