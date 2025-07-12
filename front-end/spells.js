import { buildSpellInfoHtml } from "./spell-selector/spells_render.js";

// Keep a reference to the popup window
let popupWindow = null;

const SPELL_SELECT_CACHE_KEY = 'dnd_selected_spells_cache';

// Function to open the popup
export function openSpellbookPopup() {
    // Open the new window and store its reference
    popupWindow = window.open('./front-end/spell-selector/spell_selector.html', 'Spellbook Selector', `width="75%",height="75%"`);

    // Start an interval to check if the popup has been closed
    const interval = setInterval(() => {
        // The 'closed' property will be true when the window is closed
        if (popupWindow.closed) {
            // Stop checking
            clearInterval(interval);

            // Retrieve the data the popup saved in localStorage
            const spellsJson = localStorage.getItem(SPELL_SELECT_CACHE_KEY);

            
            if (spellsJson) {
                const spells = JSON.parse(spellsJson);

                console.log('Spellbook popup was closed, loading data into known spells container.');
                
                // Now, add elements to the main page based on the data
                const knownSpellsContainer = document.getElementById('known-spells');
                
                if (!spells || spells.length === 0) {
                    knownSpellsContainer.innerHTML = '<label class="label-style">No learned spells.</p>';
                    return;
                }

                spells.forEach(spell => {
                    const spellCard = document.createElement('div');
                    spellCard.className = 'spell-item';
                    
                    // Construct the spell-card based on known info about this spell
                    spellCard.innerHTML = buildSpellInfoHtml(spell);

                    knownSpellsContainer.appendChild(spellCard);
                });

                // Clean up by removing the item from localStorage
                localStorage.removeItem(SPELL_SELECT_CACHE_KEY);
            } else {
                console.log('Spellbook popup was closed without any spells being selected.');
            }
        }
    }, 250); // Check every quarter of a second
}