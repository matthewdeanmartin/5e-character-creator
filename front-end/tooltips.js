import { ABILITIES, SAVING_THROWS } from './consts.js';

let tooltipElement;

// 2. LOGIC: This function sets up the entire tooltip system.
export function initializeTooltips() {
    createTooltipElement();
    addAbilityTooltipIcons();
}

// Creates a single tooltip div that will be reused for all tooltips.
function createTooltipElement() {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip-popup';
    document.body.appendChild(tooltipElement);
}

// Finds all elements that need a tooltip and adds the question mark icon.
function addAbilityTooltipIcons() {
    // We will attach the tooltip icon to the label associated with the input.
    // This makes the layout more consistent.
    for (const abilityItem of ABILITIES) {
        addTooltipIconForElement(abilityItem.id, abilityItem.description);
    }
    for (const savingThrowItem of SAVING_THROWS) {
        console.log("Adding tooltip icons for saving throws!");
        addTooltipIconForElement(savingThrowItem.id, savingThrowItem.description);
    }
}

function addTooltipIconForElement(id, description) {
    // Find the input/element with the matching data-save attribute
    const targetElement = document.querySelector(`[data-save="${id}"], [data-ability="${id}"]`);
    if (targetElement) {
        console.log(`Searching for a label with ID = ${id}`);
        // Find the corresponding label for that element
        const label = document.querySelector(`label[for="${id}"]`);
        
        if (label) {
            console.log(`Found a label with the matching 'for' attribute`);
            
            const icon = document.createElement('span');
            icon.className = 'tooltip-icon';
            icon.textContent = '?';
            
            // Add event listeners to the icon
            icon.addEventListener('mouseover', () => showTooltip(icon, description));
            icon.addEventListener('mouseout', hideTooltip);
            icon.addEventListener('mousemove', moveTooltip);

            // Add the icon next to the label
            label.appendChild(icon);
        }
    }
}

// 3. ACTIONS: These functions control the tooltip's visibility and content.
function showTooltip(iconElement, text) {
    tooltipElement.textContent = text;
    tooltipElement.style.display = 'block';
    moveTooltip({ pageX: iconElement.getBoundingClientRect().right, pageY: iconElement.getBoundingClientRect().top });
}

function hideTooltip() {
    tooltipElement.style.display = 'none';
}

function moveTooltip(event) {
    // Position the tooltip slightly to the right and below the cursor
    tooltipElement.style.left = `${event.pageX + 10}px`;
    tooltipElement.style.top = `${event.pageY + 10}px`;
}
