// js/skills.js
import { calcAbilityModifier } from './abilities.js';

import { SKILLS_CACHE_KEY, PROFICIENCY_BONUSES_BY_LEVEL } from './consts.js';

import { BASE_SRD_API_URL, SRD_API_SKILLS_URL } from './srd-api/consts.js';

import { batchFetchDetailsFromApi, fetchIndicesFromUrl } from './srd-api/fetch_from_url.js'

const skillsContainer = document.getElementById('skills-table');
const profBonusOutput = document.getElementById('prof-bonus-output');

export async function initializeSkills() {
    await renderSkills();
    bindSkillEvents();
}

function bindSkillEvents() {
    skillsContainer.querySelectorAll('.table-row').forEach(skillElement => {
        const modOutput = document.getElementById(`${skillElement.id}-modifier`);
        const profCheckbox = document.getElementById(`${skillElement.id}-prof`);
        modOutput.addEventListener('input', () => updateSkill(skillElement));
        profCheckbox.addEventListener('change', () => updateSkill(skillElement));
    });
}

export function updateProficiencyBonus(level) {
    // Determine new proficiency bonus based on level
    const newProfObj = PROFICIENCY_BONUSES_BY_LEVEL.findLast(profBonusObj => profBonusObj.minLevel <= level);
    // Output new proficient bonus for display
    profBonusOutput.textContent = newProfObj.bonus >= 0 ? `+${newProfObj.bonus}` : newProfObj.bonus;
}

async function renderSkills() {
    const skillsUrl = `${BASE_SRD_API_URL}${SRD_API_SKILLS_URL}`;
    
    const skillIndices = await fetchIndicesFromUrl(skillsUrl);

    const skillsDetails = await batchFetchDetailsFromApi(skillIndices);

    // Validate skills' details response
    if (!skillsDetails.error && Array.isArray(skillsDetails)) {
        console.log(`Successfully fetched ${skillsDetails.length} skills.`);
    } else {
        console.log('Error fetching skills from the D&D 5E SRD API.');
    }

    skillsDetails.forEach(skillDetails => {
        const skillElement = createSkillElement(skillDetails);
        skillsContainer.appendChild(skillElement);
    });

    // Stringify array into JSON for storage
    localStorage.setItem(SKILLS_CACHE_KEY, JSON.stringify(skillsDetails));

    updateAllSkills();
}

function createSkillElement(skillDetails) {
    const element = document.createElement('div');
    element.className = 'table-row';
    element.id = `${skillDetails.index}`;

    // The abilities themselves use the raw index as their ID
    // The saving throws tied to each ability use "{ndex}-save" as their ID
    element.innerHTML = `
        <input type="checkbox" class="checkbox-cell" id="${skillDetails.index}-prof">
        <label class="label-cell" for="${skillDetails.index}">${skillDetails.name} (${skillDetails.ability_score.name})</label>
        <div class="output-value-cell" id="${skillDetails.index}-modifier">+0</div>
    `;
    
    element.addEventListener('click', () => {
        updateSkill(element);
    });

    return element;
}

export function getProficiencyBonus() {
    const profBonusValue = profBonusOutput.textContent;
    // Assume +0 bonus if not present
    const profBonus = parseInt(profBonusValue ?? 0, 10);
    return profBonus;
}

function updateSkill(skillElement) {
    // Unwrap array out of JSON string for use
    const skillsDetailsJson = localStorage.getItem(SKILLS_CACHE_KEY);
    const skillsDetails = JSON.parse(skillsDetailsJson);
    // Find the skill index
    const skillDetails = skillsDetails.find(details => details.index === skillElement.id);

    const isProficient = document.getElementById(`${skillElement.id}-prof`).checked;
    // Find the ability modifier associated with this skill
    const abilityModifierOutput = document.getElementById(`${skillDetails.ability_score.index}-modifier`);
    const abilityModifier = parseInt(abilityModifierOutput.textContent);
    // Find the proficiency bonus
    const proficiencyBonus = getProficiencyBonus();
    
    // Calculate the total skill bonus
    const totalBonus = abilityModifier + (isProficient ? proficiencyBonus : 0);
    
    // Update the bonus input for this skill
    const skillModifierOutput = document.getElementById(`${skillElement.id}-modifier`);
    // Use + to make it obvious that the bonus is positive
    skillModifierOutput.textContent = totalBonus >= 0 ? `+${totalBonus}` : totalBonus;
}

export function updateAllSkills() {
    skillsContainer.querySelectorAll('.table-row').forEach(element => updateSkill(element));
}
