/**
 * @file dndModels.js
 * Mirrors the Go backend data structures.
 */

export class DndClass {
    constructor(data) {
        this.index = data.index || "";
        this.name = data.name || "";
        this.hitDie = data.hit_die || 0;
        this.savingThrows = data.saving_throws || [];
        this.subClasses = data.subclasses || [];
        this.url = data.url || "";
        this.updatedAt = data.updated_at || "";
    }
}

export class DndRace {
    constructor(data) {
        this.index = data.index || "";
        this.name = data.name || "";
        this.speed = data.speed || 0;
        this.abilityBonuses = data.ability_bonuses || [];
        this.alignmentDesc = data.alignment || "";
        this.ageDesc = data.age || "";
        this.size = data.size || "";
        this.sizeDesc = data.size_description || "";
        this.languages = data.languages || [];
        this.languageDesc = data.language_desc || "";
        this.traits = data.traits || [];
        this.subRaces = data.subraces || [];
        this.url = data.url || "";
        this.updatedAt = data.updated_at || "";
    }
}

/**
 * Represents the nested parent race object returned within a sub-race.
 */
export class DndParentRace {
    constructor(data) {
        if (!data) data = {};
        this.index = data.index || "";
        this.name = data.name || "";
        this.url = data.url || "";
        this.updatedAt = data.updated_at || "";
    }
}

/**
 * Represents a sub-race.
 */
export class DndSubRace {
    constructor(data) {
        if (!data) data = {};
        this.index = data.index || "";
        this.name = data.name || "";
        // Map the nested object to the DndParentRace class
        this.race = data.race ? new DndParentRace(data.race) : null; 
        this.desc = data.desc || "";
        this.abilityBonuses = data.ability_bonuses || [];
        this.racialTraits = data.racial_traits || [];
        this.url = data.url || "";
        this.updatedAt = data.updated_at || "";
    }
}