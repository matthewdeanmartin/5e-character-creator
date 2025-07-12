import { getProficiencyBonus, updateAllSkills, updateArmorClass, updateInitiative } from './skills.js';

import { ABILITIES, SAVING_THROWS } from './consts.js';

const abilitiesContainer = document.querySelector('#ability-scores');

export function initializeAbilities() {
    renderAbilities();
    bindAbilityEvents();
    updateAllModifiers();
}

function bindAbilityEvents() {
    document.querySelectorAll('#ability-scores .form-element-container').forEach(container => {
        const input = container.querySelector('.ability-score');
        const checkbox = container.querySelector('.checkbox-style');
        input.addEventListener('input', () => updateAbility(container));
        checkbox.addEventListener('change', () => updateAbility(container));
    });
}

export function getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

export function renderAbilities() {
    ABILITIES.forEach((ability, index) => {
        const abilityElement = createAbilityElement(ability, SAVING_THROWS[index]);
        abilitiesContainer.appendChild(abilityElement);
    });
}

function createAbilityElement(abilityItem, savingThrowItem) {
    const element = document.createElement('div');
    element.className = 'proficiency-entry';
    element.dataset.name = abilityItem.name;
    element.dataset.ability = abilityItem.id;

    element.innerHTML = `
        <div class="ability-label-container">
            <input type="checkbox" class="checkbox-style" data-save="${abilityItem.id}-prof">
            <label class="label-style" for="${abilityItem.id}">${abilityItem.name}</label>
        </div>
        <input type="number" class="input-style ability-score" value="10">
        <div class="calculated-value-style ability-modifier">+0</div>
        <div class="calculated-value-style saving-throw" data-save="${savingThrowItem.id}">+0</div>
        <label class="label-style" for="${savingThrowItem.id}">Saving Throw</label>
    `;
    
    element.addEventListener('click', () => {
        updateAbility(element);
    });

    return element;
}

export function updateAbility(abilityContainer) {
    // Find the element containing this ability score
    const abilityElement = abilityContainer.querySelector('.ability-score');
    // Parse the ability score (0 if not specified)
    const score = parseInt(abilityElement.value, 10) || 0;
    // Calculate the ability modifier based on the score
    const modifier = getAbilityModifier(score);

    // Find the ability modifier element
    const modifierElement = abilityContainer.querySelector('.ability-modifier');
    // Update the ability modifier
    modifierElement.textContent = modifier >= 0 ? `+${modifier}` : modifier;
    
    // Check whether the proficiency checkbox is checked
    const isProficient = abilityContainer.querySelector('.checkbox-style').checked;
    // Find the proficiency bonus
    const proficiencyBonus = getProficiencyBonus();
    
    // Calculate the saving throw bonus
    const totalSaveBonus = modifier + (isProficient ? proficiencyBonus : 0);

    // Find the saving throw element
    const savingThrowElement = abilityContainer.querySelector('.saving-throw');
    // Update the saving throw
    savingThrowElement.textContent = totalSaveBonus >= 0 ? `+${totalSaveBonus}` : totalSaveBonus;
    
    updateAllSkills();
    updateInitiative();
    updateArmorClass();
}

export function updateAllModifiers() {
    document.querySelectorAll('#ability-scores .form-element-container')
            .forEach(container => updateAbility(container));
}
