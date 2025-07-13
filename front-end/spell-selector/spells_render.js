const allResultsContainer = document.getElementById('all-results-container');
const statusDiv = document.getElementById('status');

export function buildSpellInfoHtml(spell) {
    let componentsHtml = "";
    if (spell.components && spell.components.length > 0) {
        componentsHtml = `<strong>Components:</strong><em> ${spell.components.join(", ")}</em>`;
        if (spell.materials) {
            componentsHtml = `<strong>Components:</strong><em> ${spell.components.join(", ")} (${spell.materials})</em>`;
        }
    }
    let durationHtml = "";
    if (spell.duration) {
        durationHtml = `<strong>Duration:</strong><em> ${spell.duration}</em>`;
    }
    let descriptionHtml = "";
    let descriptionAddonHtml = "";
    // Cantrips are defined as level === 0
    if (spell.level > 0) {
        descriptionHtml = `<p>${spell.desc.join("\n")}</p>`;
        // The spell higher-level info is stored in a different property
        if (spell.higher_level && spell.higher_level.length > 0) {
            descriptionAddonHtml = `<strong>Higher Level:</strong><em> ${spell.higher_level.join("\n")}</em>`;
        }
    }
    else {
        // The cantrip upgrade info is embedded in its description
        descriptionHtml = `<p>${spell.desc.slice(0, -1).join("\n")}</p>`;
        descriptionAddonHtml = `<strong>Cantrip Upgrade:</strong><em> ${spell.desc.at(-1)}</em>`;
    }

    return `
        <div class="spell-header">
            <strong>${spell.name}</strong>
            <em>Level ${spell.level} ${spell.school.name} (${spell.classes.map(dndClass => dndClass.name).join(", ")})<em>
        </div>
        <strong>Casting Time:</strong><em> ${spell.casting_time}</em>
        ${componentsHtml}
        ${durationHtml}
        ${descriptionHtml}
        ${descriptionAddonHtml}
    `;
}

/**
 * Renders the list of spells to the page.
 * @param {Array} spells - An array of spell objects.
 * @param {Function} onSpellSelect - Callback function for when a spell's checkbox is changed.
 */
export function renderSpells(spells, onSpellSelect) {
    allResultsContainer.innerHTML = ''; // Clear previous results
    
    if (!spells || spells.length === 0) {
        updateStatus("No spells matched your request");
        return;
    }

    spells.forEach(spell => {
        const spellCard = document.createElement('div');
        spellCard.className = 'row-form-element-container-rigid';
        
        spellCard.innerHTML = `
            <div>
                <input type="checkbox" class="checkbox-style"}>
            </div>
            <div class="spell-item">
                ${buildSpellInfoHtml(spell)}
            </dev>
        `;
        
        const checkbox = spellCard.querySelector('.checkbox-style');
        checkbox.addEventListener('change', (event) => {
            onSpellSelect(spell, event.target.checked);
        });

        allResultsContainer.appendChild(spellCard);
    });
    
    updateStatus(`Displaying ${spells.length} spells based on filter inputs.`);
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
export function renderError(errorResponse) {
    allResultsContainer.innerHTML = `
        <div class="spell-item" role="alert">
            <strong>Error:</strong><em> ${errorResponse.error}</em>
            <p>${errorResponse.message}</p>
        </div>
    `;
}

/**
 * Clears the spell results from the page.
 */
export function clearResults() {
    allResultsContainer.innerHTML = '';
}
