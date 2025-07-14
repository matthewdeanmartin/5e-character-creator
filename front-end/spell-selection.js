// spell-modal.js
// This file handles all the logic for the spell selection modal.

import { fetchSpellsByFilter } from './srd-api/fetch_spells.js';

// Get all necessary DOM elements for the spell modal.
const spellModal = document.getElementById('spell-modal');
const closeSpellModalBtn = document.getElementById('close-spell-modal-btn');
const doneSelectingSpellBtn = document.getElementById('done-selecting-spell-btn');
const spellSelectionContainer = document.getElementById('spell-selection-container');
const spellModalTitle = document.getElementById('spell-modal-title');
let currentSpellLevel = 0; // Variable to track which level's table to add to.

/**
 * Populates and shows the spell selection modal for a specific spell level.
 * @param {number} spellLevel - The spell level to display spells for.
 */
export async function showSpellModal(spellLevel) {
    currentSpellLevel = spellLevel;
    spellModalTitle.textContent = `Select ${spellLevel === 0 ? 'Cantrips' : `Level ${spellLevel} Spells`}`;
    spellSelectionContainer.innerHTML = ''; // Clear previous spells from the modal table.

    const dndClass = document.getElementById('class');

    // Get the list of spells for the chosen level.
    // TODO(vmartin): Add dropdown menu to allow filtering by magic school
    const spellsForLevel = await fetchSpellsByFilter([], [spellLevel], dndClass ? [dndClass] : []);

    let description = "";
    let descriptionUpgrade = "";
    // Create and append a table row for each spell.
    spellsForLevel.forEach(spell => {
        // Cantrip are described differently than spells with levels
        description = spellLevel === 0 ? spell.desc.slice(0, -1) : spell.desc;
        descriptionUpgrade = spellLevel === 0 ? spell.desc.at(-1) : spell.higher_level.join("\n");

        const spellCard = document.createElement('div');
        spellCard.classList.add('spell-card');

        // Store all spell data on the card element itself for easy access later.
        spellCard.dataset.name = spell.name;
        spellCard.dataset.school = spell.school.name;
        spellCard.dataset.range = spell.range;
        spellCard.dataset.components = spell.components.join(", ");
        spellCard.dataset.material = spell.material;
        spellCard.dataset.ritual = spell.ritual;
        spellCard.dataset.duration = spell.duration;
        spellCard.dataset.concentration = spell.concentration;
        spellCard.dataset.casting_time = spell.casting_time;
        spellCard.dataset.damage_type = spell.damage ? spell.damage.damage_type : "N/A";
        spellCard.dataset.save_dc_type = spell.dc ? spell.dc.dc_type : "N/A";
        spellCard.dataset.area_of_effect = spell.area_of_effect ? `${spell.area_of_effect.size}ft ${spell.area_of_effect.type}` : "N/A";
        spellCard.dataset.description = description;
        spellCard.dataset.descriptionUpgrade = descriptionUpgrade;

        // For ease of reference below
        const spellInfo = spellCard.dataset;

        // Populate the card with the spell's details and a checkbox for selection.
        spellCard.innerHTML = `
                <div class="spell-card-header">
                    <label class="spell-select-label">
                        <input type="checkbox" class="spell-select-checkbox">
                        <h4>${spellInfo.name}</h4>
                    </label>
                    <span>${spellInfo.school}</span>
                </div>
                <div class="spell-card-body">
                    <div class="spell-detail-grid">
                        <div class="spell-detail-item"><strong>Casting Time</strong><span>${spellInfo.casting_time}</span></div>
                        <div class="spell-detail-item"><strong>Range</strong><span>${spellInfo.range}</span></div>
                        <div class="spell-detail-item"><strong>Duration</strong><span>${spellInfo.duration}</span></div>
                        <div class="spell-detail-item"><strong>Components</strong><span>${spellInfo.components}</span></div>
                        <div class="spell-detail-item"><strong>Ritual</strong><span>${spellInfo.ritual}</span></div>
                        <div class="spell-detail-item"><strong>Concentration</strong><span>${spellInfo.concentration}</span></div>
                        <div class="spell-detail-item"><strong>Damage Type</strong><span>${spellInfo.damageType}</span></div>
                        <div class="spell-detail-item"><strong>Save DC</strong><span>${spellInfo.save_dc_type}</span></div>
                        <div class="spell-detail-item full-width"><strong>Area of Effect</strong><span>${spellInfo.area_of_effect}</span></div>
                        <div class="spell-detail-item full-width"><strong>Material</strong><span>${spellInfo.material}</span></div>
                    </div>
                    <div class="spell-description">
                        <p>${spellInfo.description}</p>
                    </div>
                    ${spellInfo.descriptionUpgrade ? `
                    <div class="spell-description-upgrade">
                        <strong>At Higher Levels:</strong>
                        <p>${spell.descriptionUpgrade}</p>
                    </div>` : 'N/A'}
                </div>
            `;

        spellSelectionContainer.appendChild(spellCard);
    });

    // Make the modal visible.
    spellModal.classList.add('visible');
}

/**
 * Adds the selected spells from the modal to the correct table on the main page.
 */
function addSelectedSpells() {
    const targetContainer = document.querySelector(`#spell-level-${currentSpellLevel}-container .spell-list-container`);
    if (!targetContainer) return;

    // Find all spell cards in the modal's selection container.
    spellSelectionContainer.querySelectorAll('.spell-card').forEach(card => {
        const checkbox = card.querySelector('.spell-select-checkbox');
        // If the checkbox for a spell is checked...
        if (checkbox.checked) {
            const spell = card.dataset; // Get all data attributes

            // Create a new card for the spell for the main page (without the checkbox).
            const newSpellCard = document.createElement('div');
            newSpellCard.classList.add('spell-card');
            
            newSpellCard.innerHTML = `
                <div class="spell-card-header">
                    <h4>${spell.name}</h4>
                    <span>${spell.school}</span>
                </div>
                <div class="spell-card-body">
                    <div class="spell-detail-grid">
                        <div class="spell-detail-item"><strong>Casting Time</strong><span>${spell.casting_time}</span></div>
                        <div class="spell-detail-item"><strong>Range</strong><span>${spell.range}</span></div>
                        <div class="spell-detail-item"><strong>Duration</strong><span>${spell.duration}</span></div>
                        <div class="spell-detail-item"><strong>Components</strong><span>${spell.components}</span></div>
                        <div class="spell-detail-item"><strong>Ritual</strong><span>${spell.ritual}</span></div>
                        <div class="spell-detail-item"><strong>Concentration</strong><span>${spell.concentration}</span></div>
                        <div class="spell-detail-item"><strong>Damage Type</strong><span>${spell.damageType}</span></div>
                        <div class="spell-detail-item"><strong>Save DC</strong><span>${spell.save_dc_type}</span></div>
                        <div class="spell-detail-item full-width"><strong>Area of Effect</strong><span>${spell.area_of_effect}</span></div>
                        <div class="spell-detail-item full-width"><strong>Material</strong><span>${spell.material}</span></div>
                    </div>
                    <div class="spell-description">
                        <p>${spell.description}</p>
                    </div>
                    ${spell.descriptionUpgrade ? `
                    <div class="spell-description-upgrade">
                        <strong>At Higher Levels:</strong>
                        <p>${spell.descriptionUpgrade}</p>
                    </div>` : 'N/A'}
                </div>
            `;
            
            targetContainer.appendChild(newSpellCard);
            checkbox.checked = false; // Uncheck for next time.
        }
    });
    
    spellModal.classList.remove('visible');
}

// --- Event Listeners ---
closeSpellModalBtn.addEventListener('click', () => spellModal.classList.remove('visible'));
spellModal.addEventListener('click', (e) => e.target === spellModal && spellModal.classList.remove('visible'));
doneSelectingSpellBtn.addEventListener('click', addSelectedSpells);
