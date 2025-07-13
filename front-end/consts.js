export const CHARACTER_CACHE_KEY = "character-indices",
    ABILITIES_CACHE_KEY = "abilities-indices",
    SKILLS_CACHE_KEY = "skill-indices",
    RACE_INDICES_CACHE_KEY = "race-indices",
    CLASS_INDICES_CACHE_KEY = "class-indices";

// See Character Advancement table from Page 56 of the SRD, v5.1
// Source: https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf
export const PROFICIENCY_BONUSES_BY_LEVEL = [
    { minLevel: 1, bonus: 2},
    { minLevel: 5, bonus: 3},
    { minLevel: 9, bonus: 4},
    { minLevel: 13, bonus: 5},
    { minLevel: 17, bonus: 6}
];

export const EXPERIENCE_TOTALS_BY_LEVEL = [
    { level: 1, expPoints: 0},
    { level: 2, expPoints: 300},
    { level: 3, expPoints: 900},
    { level: 4, expPoints: 2.7e3},
    { level: 5, expPoints: 6.5e3},
    { level: 6, expPoints: 14e3},
    { level: 7, expPoints: 23e3},
    { level: 8, expPoints: 34e3},
    { level: 9, expPoints: 48e3},
    { level: 10, expPoints: 64e3},
    { level: 11, expPoints: 85e3},
    { level: 12, expPoints: 100e3},
    { level: 13, expPoints: 120e3},
    { level: 14, expPoints: 140e3},
    { level: 15, expPoints: 165e3},
    { level: 16, expPoints: 195e3},
    { level: 17, expPoints: 225e3},
    { level: 18, expPoints: 265e3},
    { level: 19, expPoints: 305e3},
    { level: 20, expPoints: 355e3},
];
