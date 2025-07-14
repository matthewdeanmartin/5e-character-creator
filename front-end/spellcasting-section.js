// spellcasting-logic.js
// This file contains the master list of spells and generates the spell tables on the page.

import { showSpellModal } from './spell-selection.js';

/**
 * Generates the HTML for all spell level tables (Cantrips through Level 9)
 * and attaches event listeners to their "Add Spells" buttons.
 */
export async function generateSpellTables() {
    const spellTablesContainer = document.getElementById('spell-tables-container');
    if (!spellTablesContainer) return;

    // Loop from 0 (Cantrips) to 9 to create a section for each spell level.
    for (let i = 0; i <= 9; i++) {
        const levelName = i === 0 ? 'Cantrips' : `Level ${i}`;
        const spellLevelSection = document.createElement('div');
        spellLevelSection.id = `spell-level-${i}-container`;
        
        // Create the header with the level name and the button.
        spellLevelSection.innerHTML = `
            <div class="spell-level-header">
                <h3>${levelName}</h3>
                <button class="action-button add-spell-button" data-level="${i}">Add Spells</button>
            </div>
            <div class="spell-list-container">
                <!-- Spell cards will be added here by JavaScript -->
            </div>
        `;
        spellTablesContainer.appendChild(spellLevelSection);
    }

    // After creating all the buttons, add event listeners to them.
    document.querySelectorAll('.add-spell-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const level = e.target.dataset.level;
            // When clicked, show the spell selection window for the corresponding level.
            await showSpellModal(parseInt(level, 10));
        });
    });
}
