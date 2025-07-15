// Find class
const dndClassDropdown = document.getElementById('class');
const levelDropdown = document.getElementById('level');

// Find all abilities
const strInput = document.getElementById('str-ability');
const dexInput = document.getElementById('dex-ability');
const conInput = document.getElementById('con-ability');
const intInput = document.getElementById('int-ability');
const wisInput = document.getElementById('wis-ability');
const chaInput = document.getElementById('cha-ability');

// Find proficiency bonus
const profBonusOutput = document.getElementById('prof-bonus');

// Find all saving throws proficiency checkboxes
const strCheckbox = document.getElementById('str-prof');
const dexCheckbox = document.getElementById('dex-prof');
const conCheckbox = document.getElementById('con-prof');
const intCheckbox = document.getElementById('int-prof');
const wisCheckbox = document.getElementById('wis-prof');
const chaCheckbox = document.getElementById('cha-prof');
// Find all saving throws
const strSaveOutput = document.getElementById('str-save');
const dexSaveOutput = document.getElementById('dex-save');
const conSaveOutput = document.getElementById('con-save');
const intSaveOutput = document.getElementById('int-save');
const wisSaveOutput = document.getElementById('wis-save');
const chaSaveOutput = document.getElementById('cha-save');

// Find all skills (organized by ability)
const strSkillOutputs = [
    document.getElementById('athletics')
];

const dexSkillOutputs = [
    document.getElementById('acrobatics'),
    document.getElementById('sleight-of-hand'),
    document.getElementById('stealth')
];

const intSkillOutputs = [
    document.getElementById('arcana'),
    document.getElementById('history'),
    document.getElementById('investigation'),
    document.getElementById('nature'),
    document.getElementById('religion')
];

const wisSkillOutputs = [
    document.getElementById('animal-handling'),
    document.getElementById('insight'),
    document.getElementById('medicine'),
    document.getElementById('perception'),
    document.getElementById('survival')
];

const chaSkillOutputs = [
    document.getElementById('deception'),
    document.getElementById('intimidation'),
    document.getElementById('performance'),
    document.getElementById('persuasion')
];

const profBonusByLevel = [
    { minLevel: 1, profBonus: 2},
    { minLevel: 5, profBonus: 3},
    { minLevel: 9, profBonus: 4},
    { minLevel: 13, profBonus: 5},
    { minLevel: 17, profBonus: 6},
];

function calculateModifier(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}

export function initDropdownListeners() {
    levelDropdown.addEventListener('change', (event) => {
        const selectedLevel = parseInt(event.target.value, 10);
        updateProficiencyBonus(selectedLevel);
        // Update all saving throws & skills
        // Strength
        updateSavingThrow(strCheckbox.checked, calculateModifier(strInput.value), strSaveOutput);
        updateSkills(strCheckbox.checked, calculateModifier(strInput.value), strSkillOutputs);
        // Dexterity
        updateSavingThrow(dexCheckbox.checked, calculateModifier(dexInput.value), dexSaveOutput);
        updateSkills(dexCheckbox.checked, calculateModifier(dexInput.value), dexSkillOutputs);
        // Constitution
        updateSavingThrow(conCheckbox.checked, calculateModifier(conInput.value), conSaveOutput);
        // Intelligence 
        updateSavingThrow(intCheckbox.checked, calculateModifier(intInput.value), intSaveOutput);
        updateSkills(intCheckbox.checked, calculateModifier(intInput.value), intSkillOutputs);
        // Wisdom
        updateSavingThrow(wisCheckbox.checked, calculateModifier(wisInput.value), wisSaveOutput);
        updateSkills(wisCheckbox.checked, calculateModifier(wisInput.value), wisSkillOutputs);
        // Charisma
        updateSavingThrow(chaCheckbox.checked, calculateModifier(chaInput.value), chaSaveOutput);
        updateSkills(chaCheckbox.checked, calculateModifier(chaInput.value), chaSkillOutputs);
    });
}

export function initInputListeners() {
    // Checkbox listeners
    strCheckbox.addEventListener('change', (event) => {
        updateSavingThrow(event.target.checked, calculateModifier(strInput.value), strSaveOutput);
        updateSkills(event.target.checked, calculateModifier(strInput.value), strSkillOutputs);
    });
    dexCheckbox.addEventListener('change', (event) => {
        updateSavingThrow(event.target.checked, calculateModifier(dexInput.value), dexSaveOutput);
        updateSkills(event.target.checked, calculateModifier(dexInput.value), dexSkillOutputs);
    });
    conCheckbox.addEventListener('change', (event) => {
        updateSavingThrow(event.target.checked, calculateModifier(conInput.value), conSaveOutput);
    });
    intCheckbox.addEventListener('change', (event) => {
        updateSavingThrow(event.target.checked, calculateModifier(intInput.value), intSaveOutput);
        updateSkills(event.target.checked, calculateModifier(intInput.value), intSkillOutputs);
    });
    wisCheckbox.addEventListener('change', (event) => {
        updateSavingThrow(event.target.checked, calculateModifier(wisInput.value), wisSaveOutput);
        updateSkills(event.target.checked, calculateModifier(wisInput.value), wisSkillOutputs);
    });
    chaCheckbox.addEventListener('change', (event) => {
        updateSavingThrow(event.target.checked, calculateModifier(chaInput.value), chaSaveOutput);
        updateSkills(event.target.checked, calculateModifier(chaInput.value), chaSkillOutputs);
    });

    // Ability score input listeners
    strInput.addEventListener('input', (event) => {
        updateSavingThrow(strCheckbox.checked, calculateModifier(event.target.value), strSaveOutput);
        updateSkills(strCheckbox.checked, calculateModifier(event.target.value), strSkillOutputs);
    });
    dexInput.addEventListener('input', (event) => {
        updateSavingThrow(dexCheckbox.checked, calculateModifier(event.target.value), dexSaveOutput);
        updateSkills(dexCheckbox.checked, calculateModifier(event.target.value), dexSkillOutputs);
    });
    conInput.addEventListener('input', (event) => {
        updateSavingThrow(conCheckbox.checked, calculateModifier(event.target.value), conSaveOutput);
        // There are no skills based on Constitution
    });
    intInput.addEventListener('input', (event) => {
        updateSavingThrow(intCheckbox.checked, calculateModifier(event.target.value), intSaveOutput);
        updateSkills(intCheckbox.checked, calculateModifier(event.target.value), intSkillOutputs);
    });
    wisInput.addEventListener('input', (event) => {
        updateSavingThrow(wisCheckbox.checked, calculateModifier(event.target.value), wisSaveOutput);
        updateSkills(wisCheckbox.checked, calculateModifier(event.target.value), wisSkillOutputs);
    });
    chaInput.addEventListener('input', (event) => {
        updateSavingThrow(chaCheckbox.checked, calculateModifier(event.target.value), chaSaveOutput);
        updateSkills(chaCheckbox.checked, calculateModifier(event.target.value), chaSkillOutputs);
    });
}

function updateProficiencyBonus(level) {
    const profLevelPair = profBonusByLevel.findLast(profLevelPair => level >= profLevelPair.minLevel);
    if (!profLevelPair) {
        throw Error(`Input error: Proficiency bonus not known for level ${level}`)
    }
    profBonusOutput.textContent = `+${profLevelPair.profBonus}`;
}

function updateSavingThrow(abilityProfChecked, modifier, saveOutput) {
    // Use proficiency bonus only if trained
    const profBonus = (abilityProfChecked) ? parseInt(profBonusOutput.textContent) : 0;
    const totalBonus = modifier + profBonus;

    saveOutput.textContent = totalBonus < 0 ? totalBonus : `+${totalBonus}`;
}

function updateSkills(abilityProfChecked, modifier, skillOutputs) {
    // Use proficiency bonus only if trained
    const profBonus = (abilityProfChecked) ? parseInt(profBonusOutput.textContent) : 0;
    const totalBonus = modifier + profBonus;

    skillOutputs.forEach(skillOutput => {
        skillOutput.textContent = totalBonus < 0 ? totalBonus : `+${totalBonus}`;
    });
}