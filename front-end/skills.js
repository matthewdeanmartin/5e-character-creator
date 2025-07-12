// js/skills.js
import { getAbilityModifier } from './abilities.js';

import { PROFICIENCY_BONUSES, SKILLS } from './consts.js';

const skillsContainer = document.querySelector('#skills');
const proficiencyBonusInput = document.querySelector('[data-save="proficiency-bonus"]');
const levelInput = document.querySelector('[data-save="level"]')
const initiativeValue = document.querySelector('[data-save="initiative"]');
const armorClassValue = document.querySelector('[data-save="ac"]');

export function initializeSkills() {
    renderSkills();
    bindSkillsEvents();
}

function bindSkillsEvents() { 
    proficiencyBonusInput.addEventListener('input', () => {
        updateAllSkills();
        // Also need to update saving throws when proficiency changes
        document.querySelectorAll('#ability-scores .form-element-container').forEach(container => {
             const { updateAbility } = import('./abilities.js');
             updateAbility(container);
        });
    });

    levelInput.addEventListener('input', () => {
        const levelValue = levelInput.value;
        const bonusElement = PROFICIENCY_BONUSES.findLast(bonusElement => levelValue >= bonusElement.minLevel);
        proficiencyBonusInput.value = bonusElement.bonus >= 0 ? `+${bonusElement.bonus}` : bonusElement.bonus;
        // Trigger a proficiency bonus 'input' event to ensure all associated values are updated properly
        const inputEvent = new Event('input', { bubbles: true});
        proficiencyBonusInput.dispatchEvent(inputEvent);
    });
}

function renderSkills() {
    SKILLS.forEach(skill => {
        const skillElement = createProficiencyElement(skill);
        skillsContainer.appendChild(skillElement);
    });
    updateAllSkills();
}

function createProficiencyElement(item) {
    const element = document.createElement('div');
    element.className = 'proficiency-entry';
    element.dataset.name = item.name;
    element.dataset.ability = item.ability;

    element.innerHTML = `
        <input type="checkbox" class="checkbox-style" data-save="${item.id}-skill">
        <label class="label-style" for="${item.id}">${item.name} (${item.ability.slice(0,3)})</label>
        <div class="calculated-value-style bonus">+0</div>
    `;
    
    element.addEventListener('click', () => {
        updateSkill(element);
    });

    return element;
}

export function getProficiencyBonus() {
    const profValue = proficiencyBonusInput.value;
    const bonus = parseInt(profValue.replace(/[^0-9-]/g, ''), 10);
    return isNaN(bonus) ? 0 : bonus;
}

function updateSkill(skillElement) {
    const isProficient = skillElement.querySelector('.checkbox-style').checked;
    const abilityId = skillElement.dataset.ability;
    // Find the ability associated with this skill
    const abilityContainer = document.querySelector(`#ability-scores [data-ability="${abilityId}"]`);
    // Find the score of the associated ability
    const abilityScore = parseInt(abilityContainer.querySelector('.ability-score').value, 10);
    // Calculate the modifier of the score
    const abilityModifier = getAbilityModifier(abilityScore);
    // Find the proficiency bonus
    const proficiencyBonus = getProficiencyBonus();
    
    // Calculate the total skill bonus
    const totalBonus = abilityModifier + (isProficient ? proficiencyBonus : 0);
    
    // Update the bonus input for this skill
    const bonusElement = skillElement.querySelector('.bonus');
    // Use + to make it obvious that the bonus is positive
    bonusElement.textContent = totalBonus >= 0 ? `+${totalBonus}` : totalBonus;
}

export function updateAllSkills() {
    document.querySelectorAll('#skills .proficiency-entry').forEach(element => updateSkill(element));
}

export function updateInitiative() {
    const dexContainer = document.querySelector('#ability-scores [data-ability="dexterity"]');
    const dexScore = parseInt(dexContainer.querySelector('.ability-score').value, 10);
    const dexMod = getAbilityModifier(dexScore);
    initiativeValue.textContent = dexMod >= 0 ? `+${dexMod}` : dexMod;
}

export function updateArmorClass() {
    const dexContainer = document.querySelector('#ability-scores [data-ability="dexterity"]');
    const dexScore = parseInt(dexContainer.querySelector('.ability-score').value, 10);
    const dexMod = getAbilityModifier(dexScore);
    // Base AC = 10 + Dexterity modifier
    armorClassValue.textContent = `${10 + dexMod}`;
}
