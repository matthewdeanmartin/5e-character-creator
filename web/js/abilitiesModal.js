let api; // To hold the functions and state passed from main.js
let pointsPoolDisplay;
let currentPointPool = 27;

const POINT_BUY_TOTAL = 27;
const MIN_SCORE = 8;
const MAX_SCORE = 18;

/**
 * Updates the modifier span for a given ability input.
 */
function updateModifier(inputElement) {
    if (!inputElement) return;
    const score = parseInt(inputElement.value, 10);
    // Find the modifier span *within the same row*
    const modifierSpan = inputElement.closest('.ability-score-row').querySelector('.ability-modifier');
    
    if (modifierSpan) {
        // Use the Go function passed via 'api'
        const modifier = api.calculateModifier(score);
        modifierSpan.textContent = modifier >= 0 ? `+${modifier}` : modifier;
    }
}

/**
 * Calculates the total cost of all scores and updates the pool display.
 * This is used on init to sync the UI with loaded data.
 */
function syncPointPool() {
    let totalCost = 0;
    const abilityInputs = document.querySelectorAll('.ability-input');
    
    abilityInputs.forEach(input => {
        const score = parseInt(input.value, 8);
        // Use the Go function to get the *total* cost for this score
        totalCost += api.getPointBuyCost(score); 
    });
    
    currentPointPool = POINT_BUY_TOTAL - totalCost;
    if (pointsPoolDisplay) {
        pointsPoolDisplay.textContent = currentPointPool;
    }
    
    // After syncing, update all button states
    updateAllButtonStates();
}

/**
 * Updates the state (disabled/enabled) of all ability buttons
 * based on score limits and point pool.
 */
function updateAllButtonStates() {
    const abilityInputs = document.querySelectorAll('.ability-input');
    
    abilityInputs.forEach(input => {
        const score = parseInt(input.value, 10);
        const ability = input.dataset.ability;
        
        const decBtn = document.querySelector(`.ability-btn[data-ability="${ability}"][data-action="decrease"]`);
        const incBtn = document.querySelector(`.ability-btn[data-ability="${ability}"][data-action="increase"]`);

        if (!decBtn || !incBtn) return;

        // Disable "down" button if at min score
        decBtn.disabled = (score <= MIN_SCORE);
        
        // Check if we can afford the *next* point
        const nextScore = score + 1;
        const costToIncrease = api.getPointBuyCostDelta(nextScore);
        
        // Disable "up" button if at max score OR we can't afford the next point
        incBtn.disabled = (score >= MAX_SCORE) || (currentPointPool < costToIncrease);
    });
}

/**
 * Handles clicks on the '+' or '-' buttons.
 */
function onAbilityChange(event) {
    const button = event.target.closest('.ability-btn');
    if (!button) return;

    const action = button.dataset.action;
    const ability = button.dataset.ability;
    
    const input = document.querySelector(`#score-${ability}`);
    let currentScore = parseInt(input.value, 10);

    if (action === 'increase') {
        const nextScore = currentScore + 1;
        if (nextScore > MAX_SCORE) return; // Hard stop
        
        // Use Go to get the cost of moving *to* the next score
        const cost = api.getPointBuyCostDelta(nextScore);
        
        if (currentPointPool >= cost) {
            currentPointPool -= cost;
            input.value = nextScore;
            api.currentCharacter.abilityScores[ability] = nextScore;
        }
        
    } else if (action === 'decrease') {
        const prevScore = currentScore - 1;
        if (prevScore < MIN_SCORE) return; // Hard stop

        // The "refund" is the cost of the *current* score we are moving *from*
        const refund = api.getPointBuyCostDelta(currentScore); 
        
        currentPointPool += refund;
        input.value = prevScore;
        api.currentCharacter.abilityScores[ability] = prevScore;
    }
    
    // Update UI
    if (pointsPoolDisplay) {
        pointsPoolDisplay.textContent = currentPointPool;
    }
    updateModifier(input);
    updateAllButtonStates(); // Update all buttons, as the pool affects all
}

/**
 * Initializes all logic for Step 2.
 * @param {object} apiObject - An object containing necessary functions and state from main.js
 */
export function initStep2(apiObject) {
    api = apiObject; // Store the passed-in dependencies
    
    pointsPoolDisplay = document.querySelector('#points-pool-display');
    if (!pointsPoolDisplay) {
        console.error("Fatal: #points-pool-display not found!");
        return;
    }

    const abilityInputs = document.querySelectorAll('.ability-input');

    // 1. Populate fields from saved data
    // BUT ensure they are within the point-buy bounds (8-18)
    abilityInputs.forEach(input => {
        const ability = input.dataset.ability;
        let score = api.currentCharacter.abilityScores[ability];

        // Force scores into the valid point-buy range.
        // This handles loading old characters or bad data.
        if (score < MIN_SCORE) score = MIN_SCORE;
        if (score > MAX_SCORE) score = MAX_SCORE;
        
        input.value = score;
        api.currentCharacter.abilityScores[ability] = score; // Sync state
        
        // Update modifier on load
        updateModifier(input);
    });

    // 2. Calculate initial point pool based on loaded scores
    syncPointPool(); // This will also call updateAllButtonStates

    // 3. Add listeners to all buttons
    // We use a single listener on the grid for efficiency
    const grid = document.querySelector('.ability-scores-grid');
    if (grid) {
        // Remove old listener if initStep2 is ever called twice
        grid.removeEventListener('click', onAbilityChange); 
        grid.addEventListener('click', onAbilityChange);
    }

    // 4. Make all inputs readonly
    abilityInputs.forEach(input => {
        input.setAttribute('readonly', true);
        // Remove any old 'input' listeners just in case
        input.replaceWith(input.cloneNode(true));
    });
}

