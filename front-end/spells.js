// Keep a reference to the popup window
let popupWindow = null;

const SPELL_SELECT_CACHE_KEY = 'dnd_selected_spells_cache';

// Function to open the popup
export function openSpellbookPopup() {
    // Open the new window and store its reference
    popupWindow = window.open('./front-end/spellbook/spellbook.html', 'Spellbook Selector', `width="75%",height="75%"`);

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
                        <div class="spell-header">
                            <strong>${spell.name}</strong>
                            <em>Level ${spell.level} ${spell.school.name} (${spell.classes.map(dndClass => dndClass.name).join(", ")})<em>
                        </div>
                        <strong>Casting Time:</strong><em> ${spell.casting_time}</em>
                        ${componentsHtml}
                        ${durationHtml}
                        <p>${spell.level === 0 ? spell.desc.slice(0, -1).join("\n") : spell.desc.join("\n")}</p>
                        ${descriptionAddonHtml}
                    `;

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