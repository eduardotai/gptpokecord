const pd = require('../systems/pokemonData');

describe('pokemonData module', () => {
  test('getPokemon returns data with expected fields', () => {
    const bulba = pd.getPokemon(1);
    expect(bulba).toBeDefined();
    expect(bulba.name).toBe('Bulbasaur');
    expect(Array.isArray(bulba.types)).toBe(true);
    expect(Array.isArray(bulba.moves)).toBe(true);
  });

  test('getMove returns move data', () => {
    const move = pd.getMove('Tackle');
    expect(move).toBeDefined();
    expect(move.power).toBeGreaterThanOrEqual(0);
  });

  test('type effectiveness basic cases', () => {
    expect(pd.calculateTypeEffectiveness('Fire', ['Grass'])).toBeGreaterThan(1);
    expect(pd.calculateTypeEffectiveness('Electric', ['Ground'])).toBe(0);
  });

  test('calculateDamage produces positive integer', () => {
    const attacker = { level: 10, attack: 30, special_attack: 30, types: ['Fire'] };
    const defender = { defense: 20, special_defense: 20, types: ['Grass'] };
    const dmg = pd.calculateDamage(attacker, defender, 'Ember');
    expect(Number.isInteger(dmg)).toBe(true);
    expect(dmg).toBeGreaterThan(0);
  });

  test('generateRandomPokemon returns valid structure', () => {
    const p = pd.generateRandomPokemon(5, 10);
    expect(p.level).toBeGreaterThanOrEqual(5);
    expect(p.level).toBeLessThanOrEqual(10);
    expect(p.currentHp).toBeGreaterThan(0);
    expect(p.maxHp).toBeGreaterThan(0);
  });

  test('pickRandomEncounter returns a plausible encounter', () => {
    const e = pd.pickRandomEncounter([{ id: 1, weight: 5 }, { id: 4, weight: 1 }], 3, 5);
    expect([1, 4]).toContain(e.id);
    expect(e.level).toBeGreaterThanOrEqual(3);
    expect(e.level).toBeLessThanOrEqual(5);
  });
});
