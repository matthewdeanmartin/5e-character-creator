import { getProficiencyBonus, updateAllSkills } from './skills.js';

import { fetchIndicesFromUrl } from './srd-api/fetch_from_url.js';
import { BASE_SRD_API_URL, SRD_API_ABILITIES_URL } from './srd-api/consts.js';

const abilitiesContainer = document.getElementById('abilities-title-box');

export async function initializeAbilities() {
    // Create ability elements in HTML
    await renderAllAbilities();
    // Bind new ability elements to event listeners
    bindAbilityEvents();
    // Update all ability elements, calculating initial output values to display
    updateAllAbilities();
}

function bindAbilityEvents() {
    abilitiesContainer.querySelectorAll('.entry-with-proficiency').forEach(entryWithProficiency => {
        // Should only be one ability score per entry
        const abilityScoreInput = entryWithProficiency.querySelector('.ability-score');
        // Should only be one proficiency checkmark per entry
        const abilityScoreProfCheckbox = entryWithProficiency.querySelector('.checkbox-style');
        abilityScoreInput.addEventListener('input', () => updateAbility(entryWithProficiency));
        abilityScoreProfCheckbox.addEventListener('change', () => updateAbility(entryWithProficiency));
    });
}

export function calcAbilityModifier(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}

export async function renderAllAbilities() {
    const abilitiesUrl = `${BASE_SRD_API_URL}${SRD_API_ABILITIES_URL}`;

    const abilitiesResponse = await fetchIndicesFromUrl(abilitiesUrl);

    // Validate abilities response
    if (!abilitiesResponse.error && Array.isArray(abilitiesResponse)) {
        console.log(`Successfully fetched ${abilitiesResponse.length} abilities.`);
    } else {
        console.log('Error fetching classes from the D&D 5E SRD API.');
    }

    // Create new ability HTML element for each ability
    abilitiesResponse.forEach(abilityIndex => {
        const abilityElement = createAbilityElement(abilityIndex, abilityIndex);
        abilitiesContainer.appendChild(abilityElement);
    });
}

function createAbilityElement(abilityIndex) {
    const element = document.createElement('div');
    element.className = 'entry-with-proficiency';
    element.id = `${abilityIndex.index}-container`;

    // The abilities themselves use the raw index as their ID
    // The saving throws tied to each ability use "{ndex}-save" as their ID
    element.innerHTML = `
        <div class="ability-label-container">
            <input type="checkbox" class="checkbox-style" id="${abilityIndex.index}-prof">
            <label class="label-style" for="${abilityIndex.index}">${abilityIndex.name}</label>
        </div>
        <input type="number" class="input-style ability-score" id="${abilityIndex.index}-score" value="10">
        <div class="calculated-value-style ability-modifier" id="${abilityIndex.index}-modifier">+0</div>
        <div class="calculated-value-style saving-throw" id="${abilityIndex.index}-save">+0</div>
        <label class="label-style" for="${abilityIndex.index}-save">Saving Throw</label>
    `;

    return element;
}

function updateInitiative() {
    const initiativeOutput = document.getElementById('initiative-output');
    const dexModifierOutput = document.getElementById('dex-modifier');
    const dexModifier = parseInt(dexModifierOutput.textContent);
    initiativeOutput.textContent = dexModifier >= 0 ? `+${dexModifier}` : dexModifier;
}

function updateArmorClass() {
    const acOutput = document.getElementById('ac-output');
    const dexModifierOutput = document.getElementById('dex-modifier');
    const dexModifier = parseInt(dexModifierOutput.textContent);
    acOutput.textContent = 10 + dexModifier;
}

export function updateAbility(entryWithProficiency) {
    // Should only be one ability score per entry
    const scoreInput = entryWithProficiency.querySelector('.ability-score');
    // Should only be one proficiency checkmark per entry
    const profCheckbox = entryWithProficiency.querySelector('.checkbox-style');
    // Should only be one ability modifier per entry
    const modifierOutput = entryWithProficiency.querySelector('.ability-modifier');
    // Should only be one saving throw per entry
    const savingThrowOutput = entryWithProficiency.querySelector('.saving-throw');

    // Parse the ability score (assume standard 10 if not known)
    const score = parseInt(scoreInput.value ?? 10, 10);
    // Calculate the ability modifier based on the score
    const modifier = calcAbilityModifier(score);

    // Display modifier with + if positive (- is embedded in negative number)
    modifierOutput.textContent = modifier >= 0 ? `+${modifier}` : modifier;
    
    // Calculate the saving throw bonus
    const savingThrow = modifier + (profCheckbox.checked ? getProficiencyBonus() : 0);

    // Display saving throw with + if positive (- is embedded in negative number)
    savingThrowOutput.textContent = savingThrow >= 0 ? `+${savingThrow}` : savingThrow;
    
    updateInitiative();
    updateArmorClass();
    updateAllSkills();
}

export function updateAllAbilities() {
    // Update all abilities
    abilitiesContainer.querySelectorAll('.entry-with-proficiency')
        .forEach(entryWithProficiency => updateAbility(entryWithProficiency));
}
