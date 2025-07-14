// weapon-selection.js
// This file handles all the logic for the weapon selection modal.

/**
 * Initializes the weapon selection modal, including event listeners for
 * opening, closing, and adding selected weapons to the attacks table.
 */
export function initWeaponSelection() {
    // Get all necessary DOM elements for the weapon modal.
    const addWeaponBtn = document.getElementById('add-weapon-btn');
    const weaponModal = document.getElementById('weapon-modal');
    const closeWeaponModalBtn = document.getElementById('close-weapon-modal-btn');
    const doneSelectingWeaponBtn = document.getElementById('done-selecting-weapon-btn');
    const attacksTable = document.getElementById('attacks-table');
    const weaponSelectionTable = document.getElementById('weapon-selection-table');

    // --- Event Listeners ---

    // Show the modal when the "Add Weapon" button is clicked.
    addWeaponBtn.addEventListener('click', () => weaponModal.classList.add('visible'));

    // Hide the modal when the close (X) button is clicked.
    closeWeaponModalBtn.addEventListener('click', () => weaponModal.classList.remove('visible'));

    // Hide the modal if the user clicks on the dark overlay area.
    weaponModal.addEventListener('click', (e) => {
        if (e.target === weaponModal) {
            weaponModal.classList.remove('visible');
        }
    });

    // Handle the logic for when the "Done Selecting Weapons" button is clicked.
    doneSelectingWeaponBtn.addEventListener('click', () => {
        // Find all rows in the selection table.
        weaponSelectionTable.querySelectorAll('tbody tr').forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            // If the checkbox for a weapon is checked...
            if (checkbox.checked) {
                // Create a new row element for the main attacks table.
                const newAttackRow = document.createElement('div');
                newAttackRow.classList.add('table-row');
                
                // Populate the new row with inputs containing the weapon's data.
                newAttackRow.innerHTML = `
                    <input type="text" value="${row.dataset.name}">
                    <input type="number" value="${row.dataset.bonus}">
                    <input type="text" value="${row.dataset.damage}">
                `;
                
                // Add the new row to the attacks table on the character sheet.
                attacksTable.appendChild(newAttackRow);
                
                // Uncheck the box for the next time the modal is opened.
                checkbox.checked = false;
            }
        });
        // Hide the modal after processing the selections.
        weaponModal.classList.remove('visible');
    });
}
