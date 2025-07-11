import { CLASSES, RACES } from './consts.js';

const classDropdown = document.getElementById('class');
const raceDropdown = document.getElementById('race');

export function initializeCharacterBox() {
    populateDropdowns();
}

function populateDropdowns() {
    CLASSES.forEach(className => {
        const option = new Option(className, className);
        classDropdown.add(option);
    });

    RACES.forEach(raceName => {
        const option = new Option(raceName, raceName);
        raceDropdown.add(option);
    });
}
