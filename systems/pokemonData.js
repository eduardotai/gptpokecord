// Dados dos Pokémon da primeira geração
// Rebalanceamento simplificado de stats base e níveis de evolução clássicos
const pokemonData = {
    1: {
        id: 1,
        name: "Bulbasaur",
        types: ["Grass", "Poison"],
        baseStats: { hp: 47, attack: 50, defense: 50, speed: 45, special_attack: 67, special_defense: 67 },
        moves: ["Tackle", "Growl", "Vine Whip", "Poison Powder"],
        evolution: { level: 16, evolvesTo: 2 },
        catchRate: 45,
        description: "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon."
    },
    2: {
        id: 2,
        name: "Ivysaur",
        types: ["Grass", "Poison"],
        baseStats: { hp: 62, attack: 64, defense: 64, speed: 60, special_attack: 82, special_defense: 82 },
        moves: ["Tackle", "Growl", "Vine Whip", "Poison Powder", "Razor Leaf"],
        evolution: { level: 32, evolvesTo: 3 },
        catchRate: 45,
        description: "When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs."
    },
    3: {
        id: 3,
        name: "Venusaur",
        types: ["Grass", "Poison"],
        baseStats: { hp: 82, attack: 84, defense: 84, speed: 80, special_attack: 102, special_defense: 102 },
        moves: ["Tackle", "Growl", "Vine Whip", "Poison Powder", "Razor Leaf", "Solar Beam"],
        evolution: null,
        catchRate: 45,
        description: "The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight."
    },
    4: {
        id: 4,
        name: "Charmander",
        types: ["Fire"],
        baseStats: { hp: 41, attack: 53, defense: 44, speed: 66, special_attack: 61, special_defense: 51 },
        moves: ["Scratch", "Growl", "Ember", "Leer"],
        evolution: { level: 16, evolvesTo: 5 },
        catchRate: 45,
        description: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail."
    },
    5: {
        id: 5,
        name: "Charmeleon",
        types: ["Fire"],
        baseStats: { hp: 60, attack: 66, defense: 60, speed: 80, special_attack: 82, special_defense: 66 },
        moves: ["Scratch", "Growl", "Ember", "Leer", "Fire Fang"],
        evolution: { level: 36, evolvesTo: 6 },
        catchRate: 45,
        description: "When it swings its burning tail, it elevates the temperature to unbearably hot levels."
    },
    6: {
        id: 6,
        name: "Charizard",
        types: ["Fire", "Flying"],
        baseStats: { hp: 80, attack: 86, defense: 80, speed: 101, special_attack: 111, special_defense: 86 },
        moves: ["Scratch", "Growl", "Ember", "Leer", "Fire Fang", "Flamethrower", "Air Slash"],
        evolution: null,
        catchRate: 45,
        description: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally."
    },
    7: {
        id: 7,
        name: "Squirtle",
        types: ["Water"],
        baseStats: { hp: 46, attack: 49, defense: 66, speed: 44, special_attack: 51, special_defense: 65 },
        moves: ["Tackle", "Tail Whip", "Water Gun", "Withdraw"],
        evolution: { level: 16, evolvesTo: 8 },
        catchRate: 45,
        description: "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth."
    },
    8: {
        id: 8,
        name: "Wartortle",
        types: ["Water"],
        baseStats: { hp: 61, attack: 65, defense: 82, speed: 58, special_attack: 67, special_defense: 82 },
        moves: ["Tackle", "Tail Whip", "Water Gun", "Withdraw", "Bite"],
        evolution: { level: 36, evolvesTo: 9 },
        catchRate: 45,
        description: "Often hides in water to stalk unwary prey. For swimming fast, it moves its ears to maintain balance."
    },
    9: {
        id: 9,
        name: "Blastoise",
        types: ["Water"],
        baseStats: { hp: 81, attack: 85, defense: 102, speed: 78, special_attack: 87, special_defense: 107 },
        moves: ["Tackle", "Tail Whip", "Water Gun", "Withdraw", "Bite", "Hydro Pump"],
        evolution: null,
        catchRate: 45,
        description: "A brutal Pokémon with pressurized water jets on its shell. They are used for high speed tackles."
    },
    25: {
        id: 25,
        name: "Pikachu",
        types: ["Electric"],
        baseStats: { hp: 36, attack: 56, defense: 41, speed: 91, special_attack: 51, special_defense: 51 },
        moves: ["Thunder Shock", "Growl", "Quick Attack", "Thunder Wave"],
        evolution: { item: "Thunder Stone", evolvesTo: 26 },
        catchRate: 190,
        description: "When several of these Pokémon gather, their electricity can cause lightning storms."
    },
    26: {
        id: 26,
        name: "Raichu",
        types: ["Electric"],
        baseStats: { hp: 61, attack: 91, defense: 56, speed: 111, special_attack: 91, special_defense: 81 },
        moves: ["Thunder Shock", "Growl", "Quick Attack", "Thunder Wave", "Thunderbolt"],
        evolution: null,
        catchRate: 75,
        description: "Its long tail serves as a ground to protect itself from its own electrical power."
    },
    133: {
        id: 133,
        name: "Eevee",
        types: ["Normal"],
        baseStats: { hp: 56, attack: 56, defense: 51, speed: 56, special_attack: 46, special_defense: 66 },
        moves: ["Tackle", "Tail Whip", "Quick Attack", "Bite"],
        evolution: { item: "Water Stone", evolvesTo: 134 },
        catchRate: 45,
        description: "Its genetic code is irregular. It may mutate if it is exposed to radiation from element stones."
    },
    134: {
        id: 134,
        name: "Vaporeon",
        types: ["Water"],
        baseStats: { hp: 132, attack: 66, defense: 61, speed: 66, special_attack: 112, special_defense: 96 },
        moves: ["Tackle", "Tail Whip", "Quick Attack", "Bite", "Water Gun", "Hydro Pump"],
        evolution: null,
        catchRate: 45,
        description: "Lives close to water. Its long tail is ridged with a fin which is often mistaken for a mermaid's."
    }
};

// Dados dos movimentos
const moveData = {
    "Tackle": {
        name: "Tackle",
        type: "Normal",
        power: 40,
        accuracy: 100,
        pp: 35,
        category: "Physical",
        description: "A physical attack in which the user charges and slams into the target with its whole body."
    },
    "Scratch": {
        name: "Scratch",
        type: "Normal",
        power: 40,
        accuracy: 100,
        pp: 35,
        category: "Physical",
        description: "Hard, pointed, sharp claws rake the target to inflict damage."
    },
    "Growl": {
        name: "Growl",
        type: "Normal",
        power: 0,
        accuracy: 100,
        pp: 40,
        category: "Status",
        description: "The user growls in an endearing way, making the target less wary. This lowers its Attack stat."
    },
    "Ember": {
        name: "Ember",
        type: "Fire",
        power: 40,
        accuracy: 100,
        pp: 25,
        category: "Special",
        description: "The target is attacked with small flames. This may also leave the target with a burn."
    },
    "Water Gun": {
        name: "Water Gun",
        type: "Water",
        power: 40,
        accuracy: 100,
        pp: 25,
        category: "Special",
        description: "The target is blasted with a forceful shot of water."
    },
    "Vine Whip": {
        name: "Vine Whip",
        type: "Grass",
        power: 45,
        accuracy: 100,
        pp: 25,
        category: "Physical",
        description: "The target is struck with slender, whiplike vines to inflict damage."
    },
    "Thunder Shock": {
        name: "Thunder Shock",
        type: "Electric",
        power: 40,
        accuracy: 100,
        pp: 30,
        category: "Special",
        description: "A jolt of electricity is hurled at the target to inflict damage. This may also leave the target with paralysis."
    },
    "Quick Attack": {
        name: "Quick Attack",
        type: "Normal",
        power: 40,
        accuracy: 100,
        pp: 30,
        category: "Physical",
        description: "The user lunges at the target at a speed that makes it almost invisible. This move always goes first."
    },
    "Thunder Wave": {
        name: "Thunder Wave",
        type: "Electric",
        power: 0,
        accuracy: 90,
        pp: 20,
        category: "Status",
        description: "A weak electric charge is launched at the target. It causes paralysis if it hits."
    },
    "Fire Fang": {
        name: "Fire Fang",
        type: "Fire",
        power: 65,
        accuracy: 95,
        pp: 15,
        category: "Physical",
        description: "The user bites with flame-cloaked fangs. This may also make the target flinch or leave it with a burn."
    },
    "Flamethrower": {
        name: "Flamethrower",
        type: "Fire",
        power: 90,
        accuracy: 100,
        pp: 15,
        category: "Special",
        description: "The target is scorched with an intense blast of fire. This may also leave the target with a burn."
    },
    "Hydro Pump": {
        name: "Hydro Pump",
        type: "Water",
        power: 110,
        accuracy: 80,
        pp: 5,
        category: "Special",
        description: "The target is blasted by a huge volume of water launched under great pressure."
    },
    "Solar Beam": {
        name: "Solar Beam",
        type: "Grass",
        power: 120,
        accuracy: 100,
        pp: 10,
        category: "Special",
        description: "A two-turn attack. The user gathers light, then blasts a bundled beam on the next turn."
    },
    "Thunderbolt": {
        name: "Thunderbolt",
        type: "Electric",
        power: 90,
        accuracy: 100,
        pp: 15,
        category: "Special",
        description: "A strong electric blast is loosed at the target. This may also leave the target with paralysis."
    },
    "Air Slash": {
        name: "Air Slash",
        type: "Flying",
        power: 75,
        accuracy: 95,
        pp: 15,
        category: "Special",
        description: "The user attacks with a blade of air that slices even the sky. This may also make the target flinch."
    }
};

// Dados dos tipos e suas eficácias
const typeEffectiveness = {
    "Normal": { "Rock": 0.5, "Ghost": 0, "Steel": 0.5 },
    "Fire": { "Fire": 0.5, "Water": 0.5, "Grass": 2, "Ice": 2, "Bug": 2, "Rock": 0.5, "Dragon": 0.5, "Steel": 2 },
    "Water": { "Fire": 2, "Water": 0.5, "Grass": 0.5, "Ground": 2, "Rock": 2, "Dragon": 0.5 },
    "Electric": { "Water": 2, "Electric": 0.5, "Grass": 0.5, "Ground": 0, "Flying": 2, "Dragon": 0.5 },
    "Grass": { "Fire": 0.5, "Water": 2, "Grass": 0.5, "Poison": 0.5, "Ground": 2, "Flying": 0.5, "Bug": 0.5, "Rock": 2, "Dragon": 0.5, "Steel": 0.5 },
    "Ice": { "Fire": 0.5, "Water": 0.5, "Grass": 2, "Ice": 0.5, "Ground": 2, "Flying": 2, "Dragon": 2, "Steel": 0.5 },
    "Fighting": { "Normal": 2, "Ice": 2, "Poison": 0.5, "Flying": 0.5, "Psychic": 0.5, "Bug": 0.5, "Rock": 2, "Ghost": 0, "Steel": 2, "Fairy": 0.5 },
    "Poison": { "Grass": 2, "Poison": 0.5, "Ground": 0.5, "Rock": 0.5, "Ghost": 0.5, "Steel": 0, "Fairy": 2 },
    "Ground": { "Fire": 2, "Electric": 2, "Grass": 0.5, "Poison": 2, "Flying": 0, "Bug": 0.5, "Rock": 2, "Steel": 2 },
    "Flying": { "Electric": 0.5, "Grass": 2, "Fighting": 2, "Bug": 2, "Rock": 0.5, "Steel": 0.5 },
    "Psychic": { "Fighting": 2, "Poison": 2, "Psychic": 0.5, "Dark": 0, "Steel": 0.5 },
    "Bug": { "Fire": 0.5, "Grass": 2, "Fighting": 0.5, "Poison": 0.5, "Flying": 0.5, "Psychic": 2, "Ghost": 0.5, "Dark": 2, "Steel": 0.5, "Fairy": 0.5 },
    "Rock": { "Fire": 2, "Ice": 2, "Fighting": 0.5, "Ground": 0.5, "Flying": 2, "Bug": 2, "Steel": 0.5 },
    "Ghost": { "Normal": 0, "Psychic": 2, "Ghost": 2, "Dark": 0.5 },
    "Dragon": { "Dragon": 2, "Steel": 0.5, "Fairy": 0 },
    "Dark": { "Fighting": 0.5, "Psychic": 2, "Ghost": 2, "Dark": 0.5, "Fairy": 0.5 },
    "Steel": { "Fire": 0.5, "Water": 0.5, "Electric": 0.5, "Ice": 2, "Rock": 2, "Steel": 0.5, "Fairy": 2 },
    "Fairy": { "Fighting": 2, "Poison": 0.5, "Dragon": 2, "Dark": 2, "Steel": 0.5 }
};

// Dados dos itens
const itemData = {
    "pokeball": {
        name: "Poké Ball",
        description: "A device for catching wild Pokémon. It's thrown like a ball at the target.",
        price: 200,
        catchRate: 1.0
    },
    "greatball": {
        name: "Great Ball",
        description: "A good, high-performance Ball that provides a higher success rate for catching Pokémon than a standard Poké Ball.",
        price: 600,
        catchRate: 1.5
    },
    "ultraball": {
        name: "Ultra Ball",
        description: "An ultra-performance Ball that provides a higher success rate for catching Pokémon than a Great Ball.",
        price: 1200,
        catchRate: 2.0
    },
    "masterball": {
        name: "Master Ball",
        description: "The best Ball with the ultimate level of performance. It will catch any wild Pokémon without fail.",
        price: 0,
        catchRate: 255
    },
    "potion": {
        name: "Potion",
        description: "Restores the HP of a Pokémon by 20 points.",
        price: 300,
        healAmount: 20
    },
    "superpotion": {
        name: "Super Potion",
        description: "Restores the HP of a Pokémon by 50 points.",
        price: 700,
        healAmount: 50
    },
    "hyperpotion": {
        name: "Hyper Potion",
        description: "Restores the HP of a Pokémon by 200 points.",
        price: 1200,
        healAmount: 200
    },
    "maxpotion": {
        name: "Max Potion",
        description: "Fully restores the HP of a Pokémon.",
        price: 2500,
        healAmount: "max"
    },
    "revive": {
        name: "Revive",
        description: "A medicine that can revive fainted Pokémon. It also restores half the Pokémon's maximum HP.",
        price: 1500
    },
    "maxrevive": {
        name: "Max Revive",
        description: "A medicine that can revive fainted Pokémon. It also fully restores the Pokémon's HP.",
        price: 4000
    }
};

function init() {
    console.log('✅ Dados dos Pokémon carregados com sucesso!');
}

function getPokemon(id) {
    return pokemonData[id];
}

function getMove(name) {
    return moveData[name];
}

function getItem(id) {
    return itemData[id];
}

function calculateTypeEffectiveness(attackType, defenderTypes) {
    let effectiveness = 1;
    
    for (const defenderType of defenderTypes) {
        const chart = typeEffectiveness[attackType];
        if (chart && Object.prototype.hasOwnProperty.call(chart, defenderType)) {
            effectiveness *= chart[defenderType];
        }
    }
    
    return effectiveness;
}

function generateRandomPokemon(minLevel = 1, maxLevel = 100) {
    const pokemonIds = Object.keys(pokemonData).map(Number);
    const randomId = pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
    const pokemon = pokemonData[randomId];
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    
    return {
        ...pokemon,
        level: level,
        currentHp: calculateStats(pokemon.baseStats.hp, level),
        maxHp: calculateStats(pokemon.baseStats.hp, level),
        attack: calculateStats(pokemon.baseStats.attack, level),
        defense: calculateStats(pokemon.baseStats.defense, level),
        speed: calculateStats(pokemon.baseStats.speed, level),
        special_attack: calculateStats(pokemon.baseStats.special_attack, level),
        special_defense: calculateStats(pokemon.baseStats.special_defense, level)
    };
}

function pickRandomEncounter(encounterTable = null, minLevel = 2, maxLevel = 20) {
    // encounterTable: [{ id, weight }] - opcional; se não houver, usa todos os disponíveis com peso igual
    const entries = encounterTable && encounterTable.length > 0
        ? encounterTable
        : Object.keys(pokemonData).map(id => ({ id: Number(id), weight: 1 }));

    const total = entries.reduce((s, e) => s + (e.weight || 1), 0);
    let r = Math.random() * total;
    let chosen = entries[0].id;
    for (const e of entries) {
        r -= (e.weight || 1);
        if (r <= 0) { chosen = e.id; break; }
    }
    const base = pokemonData[chosen];
    const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
    return {
        ...base,
        level,
        currentHp: calculateStats(base.baseStats.hp, level),
        maxHp: calculateStats(base.baseStats.hp, level),
        attack: calculateStats(base.baseStats.attack, level),
        defense: calculateStats(base.baseStats.defense, level),
        speed: calculateStats(base.baseStats.speed, level),
        special_attack: calculateStats(base.baseStats.special_attack, level),
        special_defense: calculateStats(base.baseStats.special_defense, level),
        moves: base.moves.slice(0, 4)
    };
}

function calculateStats(baseStat, level) {
    return Math.floor(((2 * baseStat + 31) * level) / 100) + level + 10;
}

function calculateDamage(attacker, defender, move, isCritical = false) {
    const moveData = getMove(move);
    if (!moveData) return 0;
    
    const level = attacker.level;
    const attack = moveData.category === "Physical" ? attacker.attack : attacker.special_attack;
    const defense = moveData.category === "Physical" ? defender.defense : defender.special_defense;
    const power = moveData.power;
    
    let damage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50 + 2);
    
    // Aplicar STAB (Same Type Attack Bonus)
    if (attacker.types.includes(moveData.type)) {
        damage = Math.floor(damage * 1.5);
    }
    
    // Aplicar eficácia de tipo
    const effectiveness = calculateTypeEffectiveness(moveData.type, defender.types);
    damage = Math.floor(damage * effectiveness);
    
    // Aplicar crítico
    if (isCritical) {
        damage = Math.floor(damage * 1.5);
    }
    
    // Variação aleatória (85-100%)
    const variation = Math.random() * 0.15 + 0.85;
    damage = Math.floor(damage * variation);
    
    return Math.max(1, damage);
}

module.exports = {
    init,
    getPokemon,
    getMove,
    getItem,
    calculateTypeEffectiveness,
    generateRandomPokemon,
    pickRandomEncounter,
    calculateStats,
    calculateDamage,
    pokemonData,
    moveData,
    itemData,
    typeEffectiveness
};
