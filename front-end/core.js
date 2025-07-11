// js/script.js
import { initializeCharacterBox } from './character.js';
import { initializeAbilities, updateAllModifiers } from './abilities.js';
import { initializeSkills, updateAllSkills } from './skills.js';
import { initializeCombat, addAttack } from './combat.js';
import { initializeSpells } from './spells.js';
import { initializeTooltips } from './tooltips.js';

const DND_SHEET = {
    saveKey: 'currentCharacterSheet',

    init() {
        // Initialize all the modules
        initializeCharacterBox();
        initializeAbilities();
        initializeSkills();
        initializeCombat();
        initializeTooltips();
        initializeSpells(); // Initialize the spellbook
        
        // Bind global events
        this.bindGlobalEvents();

        // Load any saved data
        this.loadCharacter();
    },

    bindGlobalEvents() {
        document.getElementById('save-character').addEventListener('click', () => this.saveCharacter());
        document.getElementById('load-character').addEventListener('click', () => this.loadCharacter());
        document.getElementById('reset-character').addEventListener('click', () => this.resetCharacter());
    },

    saveCharacter() {
        const data = { attacks: [], skills: {}, abilities: {} };
        document.querySelectorAll('[data-save]').forEach(element => {
            const key = element.dataset.save;
            if (element.type === 'checkbox') {
                data[key] = element.checked;
            } else {
                data[key] = (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') ? element.value : element.textContent;
            }
        });
        document.querySelectorAll('#ability-scores .form-element-container').forEach(c => { 
            data.abilities[c.dataset.ability] = c.querySelector('.ability-score').value; 
        });
        document.querySelectorAll('#skills .proficiency-entry').forEach(element => { 
            data.skills[element.dataset.name] = element.classList.contains('proficient'); 
        });
        document.querySelectorAll('#attacks-list .details-grid').forEach(element => {
            data.attacks.push({
                name: element.querySelector('.attack-name').value,
                bonus: element.querySelector('.attack-bonus').value,
                damage: element.querySelector('.attack-damage').value
            });
        });
        localStorage.setItem(this.saveKey, JSON.stringify(data));
        alert('Character Saved!');
    },

    loadCharacter() {
        const data = JSON.parse(localStorage.getItem(this.saveKey));
        if (!data) { return; }
        
        document.querySelectorAll('[data-save]').forEach(element => {
            const key = element.dataset.save;
            if (data[key] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') { 
                    element.value = data[key]; 
                } else { 
                    element.textContent = data[key]; 
                }
            }
        });

        if (data.abilities) {
            Object.keys(data.abilities).forEach(ability => {
                const input = document.querySelector(`#ability-scores [data-ability="${ability}"] .ability-score`);
                if (input) input.value = data.abilities[ability];
            });
        }

        if (data.skills) {
            Object.keys(data.skills).forEach(name => {
                const element = document.querySelector(`#skills [data-name="${name}"]`);
                if (element) element.classList.toggle('proficient', data.skills[name]);
            });
        }

        document.getElementById('attacks-list').innerHTML = '';
        if (data.attacks) { data.attacks.forEach(attackData => addAttack(attackData)); }
        
        // Update all calculated values after loading
        updateAllModifiers();
        updateAllSkills();
        
        alert('Character Loaded!');
    },

    resetCharacter() {
        if (confirm('Are you sure? This will erase the saved character.')) {
            localStorage.removeItem(this.saveKey);
            window.location.reload();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => DND_SHEET.init());
