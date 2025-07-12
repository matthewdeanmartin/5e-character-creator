// See Proficiency Bonus table from Page 8 of the SRD 5.2.1
// Source: https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf
export const PROFICIENCY_BONUSES = [
    { minLevel: 1, bonus: 2},
    { minLevel: 5, bonus: 3},
    { minLevel: 9, bonus: 4},
    { minLevel: 13, bonus: 5},
    { minLevel: 17, bonus: 6},
    { minLevel: 21, bonus: 7},
    { minLevel: 25, bonus: 8},
    { minLevel: 29, bonus: 9},
];

// See Ability Check Examples table from Page 6 of the SRD 5.2.1
export const ABILITIES = [
    { name: "Strength", id: "strength", description:"Lift, push, pull, or break something" }, 
    { name: "Dexterity", id: "dexterity", description: "Move nimbly, quickly, or quietly" },
    { name: "Constitution", id: "constitution", description: "Push your body beyond normal limits" },
    { name: "Intelligence", id: "intelligence", description: "Reason or remember" },
    { name: "Wisdom", id: "wisdom", description: "Notice things in the environment or in creatures’ behavior" },
    { name: "Charisma", id: "charisma", description: "Influence, entertain, or deceive" }
], 
    // See Skills table from Page 9 of the SRD 5.2.1
    SKILLS = [
        { name: "Acrobatics", id: "acrobatics", ability: "dexterity" }, 
        { name: "Animal Handling", id: "animal-handling", ability: "wisdom" },
        { name: "Arcana", id: "arcana", ability: "intelligence" }, 
        { name: "Athletics", id: "athletics", ability: "strength" },
        { name: "Deception", id: "deception", ability: "charisma" }, 
        { name: "History", id: "history", ability: "intelligence" },
        { name: "Insight", id: "insight", ability: "wisdom" }, 
        { name: "Intimidation", id: "intimidation", ability: "charisma" },
        { name: "Investigation", id: "investigation", ability: "intelligence" }, 
        { name: "Medicine", id: "medicine", ability: "wisdom" },
        { name: "Nature", id: "nature", ability: "intelligence" }, 
        { name: "Perception", id: "perception", ability: "wisdom" },
        { name: "Performance", id: "performance", ability: "charisma" },
        { name: "Persuasion", id: "persuasion", ability: "charisma" },
        { name: "Religion", id: "religion", ability: "intelligence" }, 
        { name: "Sleight of Hand", id: "sleight-of-hand", ability: "dexterity" },
        { name: "Stealth", id: "stealth", ability: "dexterity" }, 
        { name: "Survival", id: "survival", ability: "wisdom" }
    ],
    // See Saving Throw Examples table from Page 7 of the SRD 5.2.1
    SAVING_THROWS = [
        { name: "Strength", id: "strength-save", ability: "strength", description: "Physically resist direct force"}, 
        { name: "Dexterity", id: "dexterity-save", ability: "dexterity", description: "Dodge out of harm’s way" },
        { name: "Constitution", id: "constitution-save", ability: "constitution", description: "Endure a toxic hazard"},
        { name: "Intelligence", id: "intelligence-save", ability: "intelligence", description: "Recognize an illusion as fake" },
        { name: "Wisdom", id: "wisdom-save", ability: "wisdom", description: "Resist a mental assault" }, 
        { name: "Charisma", id: "charisma-save", ability: "charisma", description: "Assert your identity" }
    ];

