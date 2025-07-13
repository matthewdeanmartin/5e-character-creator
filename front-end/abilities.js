import { getProficiencyBonus, updateAllSkills } from './skills.js';

import { fetchIndicesFromUrl } from './srd-api/fetch_from_url.js';
import { BASE_SRD_API_URL, SRD_API_ABILITIES_URL } from './srd-api/consts.js';

const abilitiesContainer = document.getElementById('abilities-table');

export async function initializeAbilities() {
    // Create ability elements in HTML
    await renderAllAbilities();
    // Bind new ability elements to event listeners
    bindAbilityEvents();
    // Update all ability elements, calculating initial output values to display
    updateAllAbilities();
}

function bindAbilityEvents() {
    abilitiesContainer.querySelectorAll('.table-row').forEach(abilityElement => {
        const scoreInput = document.getElementById(`${abilityElement.id}-score`);
        const profCheckbox = document.getElementById(`${abilityElement.id}-prof`);
        scoreInput.addEventListener('input', () => updateAbility(abilityElement));
        profCheckbox.addEventListener('change', () => updateAbility(abilityElement));
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
        const abilityElement = createAbilityElement(abilityIndex);
        abilitiesContainer.appendChild(abilityElement);
    });
}

function createAbilityElement(abilityIndex) {
    const element = document.createElement('div');
    element.className = 'table-row';
    element.id = `${abilityIndex.index}`;

    // The abilities themselves use the raw index as their ID
    // The saving throws tied to each ability use "{ndex}-save" as their ID
    const abilityLabelWithProfHtml = `
        <div class="table-cell">
            <label class="label-cell" for="${abilityIndex.index}">Proficiency</label>
            <input type="checkbox" class="checkbox-cell" id="${abilityIndex.index}-prof">
        </div>
    `;

    const abilityModHtml = `
        <div class="table-cell">    
            <label class="label-cell" for="${abilityIndex.index}">${abilityIndex.name}</label>
            <input type="number" class="input-value-cell" id="${abilityIndex.index}-score" value="10">
            <div class="output-value-cell" id="${abilityIndex.index}-modifier">+0</div>
        </div>
    `;

    const savingThrowHtml = `
        <div class="table-cell">
            <label class="label-cell" for="${abilityIndex.index}-save">Saving Throw</label>
            <div class="output-value-cell" id="${abilityIndex.index}-save">+0</div>
        </div>
    `;

    element.innerHTML = `
        ${abilityLabelWithProfHtml}
        ${abilityModHtml}
        ${savingThrowHtml}
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

export function updateAbility(abilityElement) {
    const scoreInput = document.getElementById(`${abilityElement.id}-score`);
    const profCheckbox = document.getElementById(`${abilityElement.id}-prof`);
    const modifierOutput = document.getElementById(`${abilityElement.id}-modifier`);
    const savingThrowOutput = document.getElementById(`${abilityElement.id}-save`);

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
    abilitiesContainer.querySelectorAll('.table-row')
        .forEach(abilityElement => updateAbility(abilityElement));
}
