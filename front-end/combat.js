// js/combat.js

const attacksList = document.getElementById('attacks-list');
const addAttackBtn = document.getElementById('add-attack');

export function initializeCombat() {
    addAttackBtn.addEventListener('click', () => addAttack());
}

export function addAttack(attackData = { name: '', bonus: '', damage: '' }) {
    const attackEl = document.createElement('div');
    attackEl.className = 'details-grid';
    attackEl.innerHTML = `
        <input type="text" class="input-style attack-name" placeholder="Attack Name" value="${attackData.name}">
        <input type="text" class="input-style attack-bonus" placeholder="Bonus" value="${attackData.bonus}">
        <input type="text" class="input-style attack-damage" placeholder="Damage/Type" value="${attackData.damage}">
        <button class="btn remove-attack">&times;</button>
    `;
    attackEl.querySelector('.remove-attack').addEventListener('click', (e) => e.target.parentElement.remove());
    attacksList.appendChild(attackEl);
}
