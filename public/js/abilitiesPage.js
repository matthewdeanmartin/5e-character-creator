/**
 * @file abilitiesPage.js
 * Handles the logic and DOM binding for the Ability Scores page.
 */

const STATS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

/**
 * Calculates combined ability bonuses from the character's race and subrace details.
 * @param {object} character - The DndCharacter instance
 * @returns {object} A mapping of stats to their total racial bonus (e.g., { str: 2, con: 1 })
 */
function calculateRacialBonuses(character) {
    const totals = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

    const applyBonuses = (bonusesArray) => {
        if (!bonusesArray) return;
        for (const bonus of bonusesArray) {
            // The Go API returns { ability_score: { index: "str" }, bonus: 2 }
            if (bonus.ability_score && bonus.ability_score.index) {
                const stat = bonus.ability_score.index.toLowerCase(); 
                if (totals[stat] !== undefined) {
                    totals[stat] += bonus.bonus;
                }
            }
        }
    };

    if (character.raceDetails) applyBonuses(character.raceDetails.abilityBonuses);
    if (character.subRaceDetails) applyBonuses(character.subRaceDetails.abilityBonuses);

    return totals;
}

/**
 * Finds inputs on Page 2 and binds them to the character's stats.
 * @param {object} character - The DndCharacter instance
 */
export function bindAbilitiesPage(character) {
    // 1. Calculate the innate bonuses provided by Race/SubRace selections from Page 1
    const racialBonuses = calculateRacialBonuses(character);

    // 2. We iterate over each stat to set up event listeners and default values
    STATS.forEach(stat => {
        const baseInput = document.getElementById(`base-${stat}`);
        const racialDisplay = document.getElementById(`racial-${stat}`);
        const userInput = document.getElementById(`user-${stat}`);
        const totalDisplay = document.getElementById(`total-${stat}`);

        if (!baseInput || !racialDisplay || !userInput || !totalDisplay) return;

        // Set the non-editable racial bonus text
        const racialVal = racialBonuses[stat] || 0;
        racialDisplay.textContent = racialVal;

        // Function to compute total and push it to the character object
        const updateTotal = () => {
            const baseVal = parseInt(baseInput.value, 10) || 0;
            const userVal = parseInt(userInput.value, 10) || 0;
            const finalTotal = baseVal + racialVal + userVal;

            // Update UI
            totalDisplay.textContent = finalTotal;

            character.baseAbilityScores[stat] = baseVal;
            character.userAbilityBonuses[stat] = userVal;

            character._abilityScores[stat] = finalTotal;
                
            // Allow other parts of the app to react to the ability score changing
            character.dispatchChangeEvent(`ability_${stat}`, finalTotal);
        };

        // Setup event listeners for user-editable fields for real-time feedback when the user types
        baseInput.addEventListener('input', updateTotal);
        userInput.addEventListener('input', updateTotal);

        // Run the calculation once on load to establish baseline Totals
        updateTotal();
    });
}